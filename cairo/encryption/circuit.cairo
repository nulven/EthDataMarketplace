%builtins output pedersen range_check bitwise

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.serialize import serialize_word

from cairo.utils.ec_math import ec_mult, Point
from cairo.utils.encrypt import (Encrypt, Decrypt, Ciphertext, get_hash_pedersen)


struct PublicKey:
  member a : felt
  member b : felt
end

func main{output_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, bitwise_ptr: BitwiseBuiltin*}() -> ():
  alloc_locals

  local key: felt
  local private_key: felt
  local hash: felt
  local public_key: PublicKey*

  %{
    ids.key = program_input['key']
    ids.private_key = program_input['private_key']
    ids.hash = program_input['hash']

    public_key1 = program_input['public_key']
    ids.public_key = public_key = segments.add()
    for i, val in enumerate(public_key1):
      memory[public_key + i] = val
  %}

  serialize_word(key)

  local output_ptr: felt* = output_ptr

  # check key hash
  let (hash_out) = get_hash_pedersen(key, 0)
  local pedersen_ptr: HashBuiltin* = pedersen_ptr
  assert hash_out = hash

  # generate shared key
  let point0 = Point(x=public_key.a, y=public_key.b)
  let (point: Point) = ec_mult(private_key, point0)
  let shared_key = point.x

  # encrypt key
  let (encryption: Ciphertext) = Encrypt(key, shared_key)
  serialize_word(encryption.a)
  serialize_word(encryption.b)

  return ()
end
