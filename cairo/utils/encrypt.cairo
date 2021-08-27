from starkware.cairo.common.hash import hash2
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math_cmp import is_in_range

struct Ciphertext:
  member a : felt
  member b : felt
end

func get_hash_pedersen{pedersen_ptr: HashBuiltin*}(x, y) -> (hash: felt):
    let (hash) = hash2{hash_ptr=pedersen_ptr}(x, y)
    return (hash)
end

func Encrypt{pedersen_ptr: HashBuiltin*}(plaintext: felt, shared_key: felt) -> (out: Ciphertext):
  let (hash1) = get_hash_pedersen(plaintext, 0)

  let (hash2) = get_hash_pedersen(shared_key, hash1)

  let b = plaintext + hash2
  let out = Ciphertext(a=hash1, b=b)
  return (out)
end

func Decrypt{pedersen_ptr: HashBuiltin*}(ciphertext: Ciphertext, shared_key: felt) -> (out: felt):
  let (hash) = get_hash_pedersen(shared_key, ciphertext.a)
  let out = ciphertext.b - hash
  return (out)
end
