%lang starknet
%builtins pedersen range_check ecdsa

from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.storage import Storage
from starkware.cairo.common.cairo_builtins import (HashBuiltin, SignatureBuiltin)
from starkware.cairo.common.signature import (verify_ecdsa_signature)

from cairo.contracts.ERC721 import (ownerOf, _mint)
from cairo.contracts.ERC721URIStorage import (_setTokenURI, tokenURI)
from cairo.contracts.Storage import (
  Ciphertext, PublicKey,
  publicKeys, urlIndex, urls, _urlCreators, prices, urlToHash, urlToProperty,
  numOfTokens, _tokenIds, _urlTokens, tokenUrl, tokenToCiphertext, redeemed,
  numOfProperties, _propertyIds, properties, _idProperties
)
from cairo.contracts.utils import (
  _setProperty, _mintToken, addPublicKey, checkRedeem
)


##########
## VIEW ##
##########

## USERS
@view
func getPublicKey{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(address: felt) -> (a: felt, b: felt):
  let (a) = publicKeys.read(address, 0)
  let (b) = publicKeys.read(address, 1)
  return (a, b)
end


## URLS
@view
func getUrl{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(index: felt) -> (url1: felt, url2: felt):
  let (url) = urls.read(index)
  return (url[0], url[1])
end
@view
func getUrlData{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt) -> (url1: felt, url2: felt, property: felt, price: felt):
  let (property) = urlToProperty.read(url1, url2)
  let (price) = prices.read(url1, url2)
  return (url1, url2, property, price)
end
@view
func getUrlIndex{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (index: felt):
  let (index) = urlIndex.read()
  return (index)
end
@view
func getCreator{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt) -> (address: felt):
  let (creator) = _urlCreators.read(url1, url2)
  return (address=creator)
end


## TOKENS
@view
func getNumOfTokens{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt) -> (num: felt):
  let (num) = numOfTokens.read(url1, url2)
  return (num)
end
@view
func getToken{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt, index: felt) -> (token: felt):
  let (token_id) = _urlTokens.read(url1, url2, index)
  return (token=token_id)
end
@view
func getCiphertext{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(token_id: felt) -> (a: felt, b: felt):

  # assert ciphertext is posted
  let (redeem) = redeemed.read(token_id)
  assert redeem = 1

  let (a) = tokenToCiphertext.read(token_id, 0)
  let (b) = tokenToCiphertext.read(token_id, 1)
  return (a, b)
end


## PROPERTIES
@view
func getNumOfProperties{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (num: felt):
  let (num) = numOfProperties.read()
  return (num)
end
@view
func getProperty{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt) -> (property: felt):
  let (property) = urlToProperty.read(url1, url2)
  return (property)
end
@view
func getPropertyId{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(index: felt) -> (property: felt):
  let (property) = _idProperties.read(index)
  return (property)
end



##############
## EXTERNAL ##
##############
@external
func init{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> ():
  numOfProperties.write(0)
  urlIndex.write(0)

  return ()
end

@external
func createProperty{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  property: felt
) -> (id: felt):
  let (property_exists) = properties.read(property) 
  assert property_exists = 0
  let (propertyId) = _propertyIds.read()
  _propertyIds.write(propertyId+1)
  let id = propertyId+1
  properties.write(property, id)
  _idProperties.write(id, property)

  return (id)
end

@external
func postUrl{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  _seller: felt,
  url1: felt,
  url2: felt,
  public_key_a: felt,
  public_key_b: felt,
  key_hash: felt,
  property: felt,
  price: felt
) -> (bool: felt):

  # check if url exists
  let (hash) = urlToHash.read(url1, url2)
  assert hash = 0

  urlToHash.write(url1, url2, key_hash)
  numOfTokens.write(url1, url2, 0)
  let url: (felt, felt) = (url1, url2)
  _setProperty(url[0], url[1], property)

  let (url_index) = urlIndex.read()
  urls.write(url_index, url)
  urlIndex.write(url_index+1)

  addPublicKey(_seller, public_key_a, public_key_b)
  prices.write(url[0], url[1], price)

  return (bool=1)
end

@external
func buyToken{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  buyer: felt,
  url1: felt,
  url2: felt,
  public_key_a: felt,
  public_key_b: felt
) -> (bool: felt):

  let url: (felt, felt) = (url1, url2)
  let (price) = prices.read(url[0], url[1])
  # assert account has enough funds

  # move coin from buyer to contract

  addPublicKey(buyer, public_key_a, public_key_b)
  _mintToken(buyer, url[0], url[1])

  return (bool=1)
end

@external
func buyToken_auth{
  storage_ptr: Storage*,
  pedersen_ptr: HashBuiltin*,
  range_check_ptr,
  ecdsa_ptr: SignatureBuiltin*
}(
  buyer: felt,
  url1: felt,
  url2: felt,
  public_key_a: felt,
  public_key_b: felt,
  sig_r: felt,
  sig_s: felt
) -> (bool: felt):

  # verify buyer 
  verify_ecdsa_signature(
    message=url1,
    public_key=public_key_a,
    signature_r=sig_r,
    signature_s=sig_s)

  let url: (felt, felt) = (url1, url2)
  let (price) = prices.read(url[0], url[1])
  # assert account has enough funds

  # move coin from buyer to contract

  addPublicKey(buyer, public_key_a, public_key_b)
  _mintToken(buyer, url[0], url[1])

  return (bool=1)
end

@external
func redeem{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  seller: felt,
  tokenId: felt
) -> (bool: felt):

  checkRedeem(seller, tokenId)
  let (url) = tokenUrl.read(tokenId)
  let (buyer) = ownerOf(tokenId)
  let (a) = publicKeys.read(buyer, 0)
  let (b) = publicKeys.read(buyer, 1)
  let (hash) = urlToHash.read(url[0], url[1])

  # assert proof used correct hash
  # assert proof used correct public key
  # assert proof is valid

  let (price) = prices.read(url[0], url[1])
  # transfer coin to seller

  # get ciphertext from proof
  tokenToCiphertext.write(tokenId, 0, 0)
  tokenToCiphertext.write(tokenId, 1, 1)
  redeemed.write(tokenId, 1)

  return (bool=1)
end

@external
func redeem_auth{
  storage_ptr: Storage*,
  pedersen_ptr: HashBuiltin*,
  range_check_ptr,
  ecdsa_ptr: SignatureBuiltin*
}(
  seller: felt,
  tokenId: felt,
  sig_r: felt,
  sig_s: felt
) -> (bool: felt):

  # verify seller
  let (public_key) = publicKeys.read(seller, 0)
  verify_ecdsa_signature(
    message=tokenId,
    public_key=public_key,
    signature_r=sig_r,
    signature_s=sig_s)

  checkRedeem(seller, tokenId)
  let (url) = tokenUrl.read(tokenId)
  let (buyer) = ownerOf(tokenId)
  let (a) = publicKeys.read(buyer, 0)
  let (b) = publicKeys.read(buyer, 1)
  let (hash) = urlToHash.read(url[0], url[1])
  
  # assert proof used correct hash
  # assert proof used correct public key
  # assert proof is valid

  let (price) = prices.read(url[0], url[1])
  # transfer price to seller

  # get ciphertext from proof
  tokenToCiphertext.write(tokenId, 0, 0)
  tokenToCiphertext.write(tokenId, 1, 1)
  redeemed.write(tokenId, 1)

  return (bool=1)
end
