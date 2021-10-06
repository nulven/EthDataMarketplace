from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.math_cmp import is_nn
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.bitwise import bitwise_and
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.alloc import alloc
from cairo.utils.math import (MontgomeryDouble, Montgomery2Edwards, Edwards2Montgomery, MontgomeryAdd, BabyAdd)


struct Point:
  member x: felt
  member y: felt
end

func div_mod{range_check_ptr}(n: felt, m: felt) -> (out: felt):
  alloc_locals

  let _m = m

  local a: felt
  local b: felt
  local c: felt
  %{
    from sympy.core.numbers import igcdex
    from starkware.crypto.signature.signature import FIELD_PRIME
    _a, _b, _c = igcdex(ids._m, FIELD_PRIME)
    ids.a = _a % FIELD_PRIME
    ids.b = _b % FIELD_PRIME
    ids.c = _c % FIELD_PRIME
  %}
  let num = n*a
  return (out=num)
end

func ec_add{range_check_ptr}(point1: Point, point2: Point) -> (out: Point):
  let a = point1.y - point2.y
  let b = point1.x - point2.x
  let (m) = div_mod(a, b)

  let m_squared = m*m
  let c = m_squared - point1.x
  let x = c - point2.x

  let d = point1.x - x
  let e = m*d
  let y = e - point1.y

  tempvar out = Point(x=x, y=y)
  return (out)
end

func ec_double{range_check_ptr}(point: Point, alpha: felt) -> (out: Point):
  let point_squared = point.x*point.x
  let a1 = 3*point_squared
  let a2 = a1 + alpha
  let b = 2*point.y
  let (m) = div_mod(a2, b)
  let m_squared = m*m
  let c = 2*point.x
  let x = m_squared - c

  let d = point.x-x
  let e = m*d
  let y = e-point.y

  tempvar out = Point(x=x, y=y)
  return (out)
end

func ec_mult{range_check_ptr, bitwise_ptr: BitwiseBuiltin*}(
  m: felt,
  point: Point
) -> (out: Point):
  alloc_locals

  if m == 1:
    return (out=point)
  end
  let (rem) = bitwise_and(m, 1)
  if rem == 0:
    let (dbl) = ec_double(point, 1)
    let m_over_2 = m/2
    let (out) = ec_mult(m_over_2, dbl)
    return (out)
  end
  let (mult) = ec_mult(m-1, point)
  let (add) = ec_add(mult, point)
  return (out=add)
end
