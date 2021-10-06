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

struct EncryptionOutput:
  member hash : felt

  member encryption_1 : felt
  member encryption_2 : felt

  member public_key_1 : felt
  member public_key_2 : felt
end

func main{output_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, bitwise_ptr: BitwiseBuiltin*}() -> ():
  alloc_locals

  local key
  local seller_private_key
  local buyer_public_key: PublicKey*

  %{
    ids.key = program_input['key']
    ids.seller_private_key = program_input['seller_private_key']

    _buyer_public_key = program_input['buyer_public_key']
    ids.buyer_public_key = buyer_public_key = segments.add()
    for i, val in enumerate(_buyer_public_key):
      memory[buyer_public_key + i] = val
  %}

  let output = cast(output_ptr, EncryptionOutput*)
  let output_ptr = output_ptr + EncryptionOutput.SIZE
  local output_ptr: felt* = output_ptr

  assert output.public_key_1 = buyer_public_key.a
  assert output.public_key_2 = buyer_public_key.b

  # output key hash
  let (hash_out) = get_hash_pedersen(key, 0)
  assert output.hash = hash_out
  local pedersen_ptr: HashBuiltin* = pedersen_ptr

  # generate shared key
  let public_key_point = Point(x=buyer_public_key.a, y=buyer_public_key.b)
  let (point: Point) = ec_mult(seller_private_key, public_key_point)
  let shared_key = point.x

  # encrypt key
  let (encryption: Ciphertext) = Encrypt(key, shared_key)

  assert output.encryption_1 = encryption.a
  assert output.encryption_2 = encryption.b

  return ()
end
