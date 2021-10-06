from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.bitwise import bitwise_and
from starkware.cairo.common.cairo_builtins import BitwiseBuiltin

func exp_iter{range_check_ptr}(val: felt, n_steps: felt) -> (out: felt):
  if n_steps == 0:
    return (out=val)
  end

  let (quot, rem) = unsigned_div_rem(val, 2)
  let (out) = exp_iter(quot, n_steps-1)
  return (out)
end

func exp{range_check_ptr}(in: felt, n_steps: felt) -> (out: felt):
  alloc_locals
  
  let (out) = exp_iter(in, n_steps)
  return (out)
end

func right_shift{range_check_ptr}(in: felt, bits: felt) -> (out: felt):
  let (quot) = exp(in, bits)
  return (out=quot)
end

func iter{range_check_ptr, bitwise_ptr: BitwiseBuiltin*}(
  in: felt,
  out: felt*,
  e2: felt*,
  lc1: felt*,
  n_steps: felt,
  index: felt
):
  if n_steps == 0:
    return ()
  end

  let (shift) = right_shift(in, index)
  let (a_and_b) = bitwise_and(shift, 1)
  assert [out] = a_and_b 
  assert [out]*([out] - 1) = 0
  let inter = [out]*[e2]
  assert [lc1+1] = [lc1]+inter
  assert [e2+1] = [e2]*[e2]
  iter(in, out+1, e2+1, lc1+1, n_steps-1, index+1)
  return ()
end

func Num2Bits(in: felt, n: felt) -> (out: felt*):

  let input = in
  let out: felt* = alloc()
  %{
    binary = bin(ids.input).replace('0b', '')
    zeros = ids.n - len(binary)
    for i in range(zeros):
      memory[ids.out + i] = 0
    for i, bit in enumerate(binary):
      memory[ids.out + i + zeros] = int(bit)
  %}

  return (out)
end
func Num2Bits2{range_check_ptr, bitwise_ptr: BitwiseBuiltin*}(in: felt, n: felt) -> (out: felt*):
  alloc_locals

  let (__fp__, _) = get_fp_and_pc()
  let (local lc1: felt*) = alloc()
  let (local e2: felt*) = alloc()
  let (local out: felt*) = alloc()
  let i = 0
  assert [lc1] = 0
  assert e2[i] = 1

  iter(in, out, e2, lc1, n, 0)

  return (out)
end

func MontgomeryDouble(in: felt*) -> (out: felt*):
  alloc_locals

  let (out: felt*) = alloc()

  let a = 168700
  let d = 168696

  let x = (2 * (a + d)) / (a - d)
  [ap] = x; ap++ # A
  let A = [ap-1]
  let y = 4 / (a - d)
  [ap] = y; ap++ # B
  let B = [ap-1]

  let x1_2 = ap
  local x = [in]
  [ap] = x*x; ap++
  let x1_2 = [ap-1]

  local three = 3 
  local two = 2
  local in1 = [in]
  local in2 = [in+1]

  [ap] = three*x1_2; ap++
  [ap] = two*A; ap++
  [ap] = [ap-1]*in1; ap++
  [ap] = [ap-3]+[ap-1]; ap++

  [ap] = [ap-1]+1; ap++
  let num = [ap-1]

  [ap] = [ap-1]*in1; ap++
  [ap] = two*B; ap++
  [ap] = [ap-1]*in2; ap++
  let den = [ap-1]

  #let (quot, rem) = unsigned_div_rem([num], [den])
  #assert rem = 0
  let quot = 0
  [ap] = num/den; ap++
  let lambda = [ap-1]
  assert lambda*(2*B*in2) = (three*x1_2 + two*A*in1 + 1)

  assert [out] = B*lambda*lambda - A - two*in1
  assert [out+1] = lambda*(in1 - [out]) - in2

  return (out)
end

func MontgomeryAdd{range_check_ptr}(in1: felt*, in2: felt*) -> (out: felt*):

  alloc_locals

  let (local out: felt*) = alloc()

  let a = 168700
  let d = 168696

  let x = (2*(a + d)) / (a - d)
  [ap] = x; ap++
  let A = [ap-1]
  let y = 4 / (a - d)
  [ap] = y; ap++
  let B = [ap-1]

  let lambda = ap
  local num = [in2+1] - [in1+1]
  local den = [in2] - [in1]
  local lambda = num/den
  assert lambda*([in2] - [in1]) = ([in2+1] - [in1+1])

  assert [out] = B*lambda*lambda - A - [in1] - [in2]
  assert [out+1] = lambda*([in1] - [out]) - [in1+1]

  return (out)
end

func Edwards2Montgomery(in: felt*) -> (out: felt*):
  alloc_locals

  [ap] = [in]; ap++
  [ap] = [in+1]; ap++

  let (local out: felt*) = alloc()

  assert [out] = (1 + [in+1])/(1-[in+1])
  assert [out+1] = [out]/[in]

  assert [out]*(1-[in+1]) = (1+[in+1])
  assert [out+1]*[in] = [out]

  let (output: felt*) = alloc()
  assert [output] = [out]
  assert [output+1] = [out+1]
  return (out=output)
end

func Montgomery2Edwards(in: felt*) -> (out: felt*):
  alloc_locals

  let (local out: felt*) = alloc()

  assert [out] = [in]/[in+1]
  assert [out+1] = ([in]-1)/([in]+1)

  assert [out]*[in+1] = [in]
  assert [out+1]*([in]+1) = [in]-1

  return (out)
end

func BabyAdd(x1: felt, y1: felt, x2: felt, y2: felt) -> (xout: felt, yout: felt):
  alloc_locals

  let a = 168700
  let d = 168696

  [ap] = x1*y2; ap++
  let beta = [ap-1]

  [ap] = y1*x2; ap++
  let gamma = [ap-1]

  local step1a = -a*x1
  local step1 = step1a + y1
  local step2 = x2 + y2
  [ap] = step1*step2; ap++
  let delta = [ap-1]

  [ap] = beta*gamma; ap++
  let tau = [ap-1]

  local num = beta + gamma
  local den = 1 + d*tau
  [ap] = num / den; ap++
  let xout = [ap-1]
  assert (1 + d*tau)*xout = (beta + gamma)

  local p1 = a*beta
  local p2 = delta - gamma
  local num = p1 + p2
  local den = 1 - d*tau
  [ap] = num / den; ap++
  let yout = [ap-1]
  assert (1-d*tau)*yout = (delta + a*beta - gamma)

  return (xout=xout, yout=yout)
end
