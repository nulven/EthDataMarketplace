%lang starknet

from starkware.starknet.common.storage import Storage
from starkware.cairo.common.cairo_builtins import (HashBuiltin, SignatureBuiltin)
from cairo.contracts.ERC721 import (ownerOf, _mint)
from cairo.contracts.ERC721URIStorage import (_setTokenURI, tokenURI)
from cairo.contracts.Storage import (
  Ciphertext, PublicKey,
  publicKeys, urlIndex, urls, _urlCreators, prices, urlToHash, urlToProperty,
  numOfTokens, _tokenIds, _urlTokens, tokenUrl, tokenToCiphertext, redeemed,
  numOfProperties, _propertyIds, properties, _idProperties
)


func _setProperty{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  url1: felt,
  url2: felt,
  property: felt
) -> (bool: felt):

  let (propertyId) = properties.read(property)
  # assert that property exists

  urlToProperty.write(url1, url2, property)

  return (bool=1)
end

func _mintToken{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  to: felt,
  url1: felt,
  url2: felt
) -> ():

  let (tokenId) = _tokenIds.read()
  let url: (felt, felt) = (url1, url2)
  let (length) = numOfTokens.read(url[0], url[1])

  _urlTokens.write(url[0], url[1], length, tokenId)
  numOfTokens.write(url[0], url[1], length+1)
  _tokenIds.write(tokenId+1)
  tokenUrl.write(tokenId, url)

  _mint(to, tokenId)
  _setTokenURI(tokenId, url[0], url[1])

  return ()
end

func addPublicKey{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  address: felt,
  public_key_a: felt,
  public_key_b: felt
) -> (bool: felt):

  # assert public key is not recorded
  let (public_key_a) = publicKeys.read(address, 0)
  assert public_key_a = 0

  publicKeys.write(address, 0, public_key_a)
  publicKeys.write(address, 1, public_key_b)
  
  return (bool=1)
end

func checkRedeem{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  seller: felt,
  tokenId: felt
) -> (bool: felt):

  let (url) = tokenUrl.read(tokenId)
  let (creator) = _urlCreators.read(url[0], url[1])
  assert seller = creator

  # assert coin is not redeemed
  let (redeem) = redeemed.read(tokenId)
  assert redeem = 0

  return (bool=1)
end
