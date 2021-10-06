%builtins output pedersen range_check bitwise

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.serialize import serialize_word

from cairo.utils.encrypt import (Encrypt, Decrypt, Ciphertext, get_hash_pedersen)

struct HashOutput:
  member key_hash : felt

  member ciphertext_1 : felt
  member ciphertext_2 : felt

  member hash : felt
  member salt : felt
end

func main{output_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, bitwise_ptr: BitwiseBuiltin*}() -> ():
  alloc_locals

  local preimage
  local key
 
  %{
    ids.preimage = program_input['preimage']
    ids.key = program_input['key']
  %}

  let output = cast(output_ptr, HashOutput*)
  let output_ptr = output_ptr + HashOutput.SIZE
  local output_ptr: felt* = output_ptr

  # proof of property (hash)
  let (preimage_hash) = get_hash_pedersen(preimage, 0)
  assert output.hash = preimage_hash
  assert output.salt = 0

  # hash of key
  let (key_hash) = get_hash_pedersen(key, 0)
  assert output.key_hash = key_hash

  # encryption of message
  let (ciphertext: Ciphertext) = Encrypt(preimage, key)
  assert output.ciphertext_1 = ciphertext.a
  assert output.ciphertext_2 = ciphertext.b

  return ()
end
