from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.math_cmp import is_nn
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.bitwise import bitwise_and
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.alloc import alloc
from cairo.utils.math import (MontgomeryDouble, Montgomery2Edwards, Edwards2Montgomery, MontgomeryAdd, BabyAdd)

struct Multiplexor2In:
  member a: felt
  member b: felt
end

func Multiplexor2(sel: felt, in: Multiplexor2In*) -> (out: felt*):
  alloc_locals

  let (local out: felt*) = alloc()

  assert [out] = ([in+1].a - [in].a)*sel + [in].a
  assert [out+1] = ([in+1].b - [in].b)*sel + [in].b

  return (out)
end

func BitElementMulAny{range_check_ptr}(
  sel: felt,
  dblIn: felt*,
  addIn: felt*
) -> (dblOut: felt*, addOut: felt*):
  alloc_locals

  let (dblOut: felt*) = alloc()
  local dblOutLocal: felt* = dblOut
  let (local addOut: felt*) = alloc()
  assert [dblOut] = [dblIn]
  assert [dblOut+1] = [dblIn+1]

  let (double: felt*) = MontgomeryDouble(in=dblOut)
  local doubleLocal: felt* = double
  
  let (add: felt*) = MontgomeryAdd(double, addIn)

  let (local addIn2: Multiplexor2In*) = alloc()
  assert addIn2.a = cast(addIn, Multiplexor2In*).a
  assert addIn2.b = cast(addIn, Multiplexor2In*).b
  assert [addIn2+Multiplexor2In.SIZE].a = cast(add, Multiplexor2In*).a
  assert [addIn2+Multiplexor2In.SIZE].b = cast(add, Multiplexor2In*).b

  let (out) = Multiplexor2(
    sel=sel,
    in=addIn2
  )
  assert [addOut] = [out]
  assert [addOut+1] = [out+1]

  return (doubleLocal, addOut)
end

struct SegmentOut:
  member out: felt*
  member dbl: felt*
end

func SegmentMulAny_iter{range_check_ptr}(
  e: felt*,
  dblOut: felt*,
  addOut: felt*,
  n_steps: felt
) -> (addOut: felt*, dblOut: felt*):

  let (dblOut3, addOut3) = BitElementMulAny(
    sel=[e],
    dblIn=dblOut,
    addIn=addOut
  )

  if n_steps == 1:
    return (addOut=addOut3, dblOut=dblOut3)
  else:
    let (dblOut2, addOut2) = SegmentMulAny_iter(e+1, dblOut3, addOut3, n_steps-1)
    return (addOut=addOut2, dblOut=dblOut2)
  end
end

func SegmentMulAny{range_check_ptr}(
  e: felt*,
  p: felt*,
  n: felt
) -> (out: SegmentOut):

  alloc_locals

  let (local out: felt*) = alloc()
  let (local dbl: felt*) = alloc()

  [ap] = [p]; ap++
  [ap] = [p+1]; ap++
  let (e2mOut) = Edwards2Montgomery(p)

  let (dblOut, addOut) = BitElementMulAny(
    sel=[e],
    dblIn=e2mOut,
    addIn=e2mOut
  )
  local addOutLocal: felt* = addOut

  let (dblOut2, addOut2) = SegmentMulAny_iter(e+1, dblOut, addOut, n-2)
  assert [dbl] = [dblOut2]
  assert [dbl+1] = [dblOut2+1]

  let (m2eOut) = Montgomery2Edwards(addOutLocal)

  let (xout, yout) = BabyAdd(
    x1=[m2eOut],
    y1=[m2eOut+1],
    x2=-[p],
    y2=[p+1]
  )

  let (local lastSelIn: Multiplexor2In*) = alloc()
  local mult: Multiplexor2In = Multiplexor2In(a=xout, b=yout)
  lastSelIn.a = mult.a
  lastSelIn.b = mult.b
  assert [lastSelIn+Multiplexor2In.SIZE].a = cast(m2eOut, Multiplexor2In*).a
  assert [lastSelIn+Multiplexor2In.SIZE].b = cast(m2eOut, Multiplexor2In*).b

  let (lastSel) = Multiplexor2(
    sel=[e],
    in=lastSelIn
  )
  
  local output: SegmentOut = SegmentOut(out=lastSel, dbl=dbl)
  return (out=output)
end

func EscalarMulAny_iter{range_check_ptr}(
  segments: SegmentOut*,
  doublers: felt*,
  m2e: felt*,
  adders: felt**,
  e: felt*,
  p: felt*,
  zeropointout: felt,
  nsegments: felt,
  nlastsegment: felt,
  n_steps: felt,
  index: felt
):

  alloc_locals
  local range_check_ptr1 = range_check_ptr

  if index == nsegments-1:
    [ap] = nlastsegment; ap++
  else:
    [ap] = 148; ap++
  end
  local n = [ap-1]

  let (local segmentsIn: felt*) = alloc()
  if index == 0:
    assert [segmentsIn] = [p] + (5299619240641551281634865583518297030282874472190772894086521144482721001553 - [p])*zeropointout
    assert [segmentsIn+1] = [p+1] + (16950150798460657717958625567821834550301663161624707787222815936182638968203 - [p+1])*zeropointout
    let (segmentoutput) = SegmentMulAny(
      e=e,
      p=segmentsIn,
      n=n
    )
    let b = [segmentoutput.out]
    assert [segments] = segmentoutput
  else:
    let (montgomery_double) = MontgomeryDouble([segments-SegmentOut.SIZE].dbl)
    [doublers-1] = montgomery_double
    let (montgomery2edwards) = Montgomery2Edwards(cast([doublers-1], felt*))
    [m2e-1] = montgomery2edwards 
    assert [segmentsIn] = [[m2e-1]]
    assert [segmentsIn+1] = [[m2e-1]+1]
    let (segmentoutput) = SegmentMulAny(
      e=e,
      p=segmentsIn,
      n=n
    )
    assert [segments] = segmentoutput

    if index==1:
      let (xout2, yout2) = BabyAdd(
        x1=[[segments-SegmentOut.SIZE].out],
        y1=[[segments-SegmentOut.SIZE].out+1],
        x2=[[segments].out],
        y2=[[segments].out+1]
      )
      local babyaddout: (felt, felt) = (xout2, yout2)
      let (__fp__, _) = get_fp_and_pc()
      assert [adders-1] = cast(&babyaddout, felt*)
    else:
      let xout = [[adders-2]]
      let yout = [[adders-2]+1]
      let (xout2, yout2) = BabyAdd(
        x1=xout,
        y1=yout,
        x2=[[segments].out],
        y2=[[segments].out+1]
      )
      local babyaddout: (felt, felt) = (xout2, yout2)
      let (__fp__, _) = get_fp_and_pc()
      assert [adders-1] = cast(&babyaddout, felt*)
    end
  end

  let range_check_ptr = range_check_ptr1
  if n_steps != 1:
    EscalarMulAny_iter(
      segments+SegmentOut.SIZE,
      doublers+1,
      m2e+1,
      adders+1,
      e+148,
      p,
      zeropointout,
      nsegments,
      nlastsegment,
      n_steps-1,
      index+1
    )
  end
  let range_check_ptr = range_check_ptr1
  return ()
end

func EscalarMulAny{range_check_ptr}(e: felt*, p: felt*, n: felt) -> (out: felt*):

  alloc_locals
  let (local out: felt*) = alloc()

  [ap] = n-1; ap++
  let (quot, rem) = unsigned_div_rem([ap-1], 148)
  local range_check_ptr = range_check_ptr
  let nsegments = ap
  [nsegments] = quot+1; ap++ # nsegments

  [ap] = [nsegments]-1; ap++
  [ap] = [ap-1]*148; ap++
  let nlastsegment = ap
  [nlastsegment] = n - [ap-1]; ap++

  local nsegmentsLocal = [nsegments]
  local nlastsegmentLocal = [nlastsegment]
  let (zeropointout) = IsZero([p])
  [ap] = zeropointout; ap++

  local zeropointoutLocal = zeropointout
  let (local segments: SegmentOut*) = alloc()
  let (doublers: felt*) = alloc()
  let (m2e: felt*) = alloc()
  let (adders: felt**) = alloc()

  local segmentsLocal: SegmentOut* = segments
  local doublersLocal: felt* = doublers
  local m2eLocal: felt* = m2e
  local addersLocal: felt** = adders
  EscalarMulAny_iter(
    segments,
    doublers,
    m2e,
    adders,
    e,
    p,
    zeropointout,
    nsegmentsLocal,
    nlastsegmentLocal,
    nsegmentsLocal,
    0
  )
  local range_check_ptr = range_check_ptr
  let segments: SegmentOut* = segmentsLocal
  let doublers: felt* = doublersLocal
  let m2e: felt* = m2eLocal
  let adders: felt** = addersLocal

  let b = [[segments].out]
  let c = [[adders]]

  if nsegmentsLocal == 1:
    assert [out] = [[segments].out]*(1-zeropointoutLocal)
    assert [out+1] = [[segments].out+1]+(1-[[segments].out+1])*zeropointoutLocal
  else:
    assert [out] = [[adders+nsegmentsLocal-2]]*(1-zeropointoutLocal)
    assert [out+1] = [[adders+nsegmentsLocal-2]+1]+(1-[[adders+nsegmentsLocal-2]+1])*zeropointoutLocal
  end

  return (out)
end

func IsZero(in: felt) -> (out: felt):
  alloc_locals
  
  if in != 0:
    #let (quot, rem) = unsigned_div_rem(1, 2)
    [ap] = 0; ap++
    [ap] = 0; ap++
  else:
    [ap] = 0; ap++
    [ap] = 0; ap++
  end

  [ap] = [ap-1] - 1; ap++
  let out = ap
  #[out] = [ap-1] - [ap-3]
  [out] = 0 
  #assert in*[out] = 0

  return (out=[out])
end

