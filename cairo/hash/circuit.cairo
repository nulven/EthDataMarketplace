%builtins output pedersen range_check bitwise

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.serialize import serialize_word

from cairo.utils.encrypt import (Encrypt, Decrypt, Ciphertext, get_hash_pedersen)


func main{output_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, bitwise_ptr: BitwiseBuiltin*}() -> ():
  alloc_locals

  local preimage: felt
  local key: felt
  local hash: felt
  local salt: felt
 
  %{
    ids.preimage = program_input['preimage']
    ids.key = program_input['key']
    ids.hash = program_input['hash']
    ids.salt = program_input['salt']
  %}

  # hash of key
  let (key_hash) = get_hash_pedersen(key, 0)

  # proof of property (hash)
  let (preimage_hash) = get_hash_pedersen(preimage, salt)

  # encryption of message
  let (ciphertext: Ciphertext) = Encrypt(preimage, key)

  serialize_word(preimage_hash)
  serialize_word(ciphertext.a)
  serialize_word(ciphertext.b)

  return ()
end
