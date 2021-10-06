%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.storage import Storage
from starkware.cairo.common.cairo_builtins import HashBuiltin
from cairo.contracts.ERC721 import (ownerOf, _mint)
from cairo.contracts.ERC721URIStorage import (_setTokenURI, tokenURI)

@storage_var
func _tokenIds() -> (res: felt):
end
@storage_var
func _propertyIds() -> (res: felt):
end

@storage_var
func urls(index: felt) -> (url: (felt, felt)):
end
@storage_var
func _urlTokens(url1: felt, url2: felt, index: felt) -> (token: felt):
end
@storage_var
func numOfTokens(url1: felt, url2: felt) -> (index: felt):
end
@storage_var
func tokenUrl(token_id: felt) -> (url: (felt, felt)):
end
@storage_var
func urlIndex() -> (index: felt):
end

@storage_var
func _urlCreators(url1: felt, url2: felt) -> (creator: felt):
end

struct Ciphertext:
  member a: felt
  member b: felt
end

struct PublicKey:
  member a: felt
  member b: felt
end

@storage_var
func tokenToCiphertext(token_id: felt, index: felt) -> (ciphertext: felt):
end
@storage_var
func redeemed(token_id: felt) -> (bool: felt):
end
@storage_var
func prices(url1: felt, url2: felt) -> (price: felt):
end

@storage_var
func properties(property: felt) -> (id: felt):
end
@storage_var
func _idProperties(id: felt) -> (property: felt):
end
@storage_var
func numOfProperties() -> (int: felt):
end

@storage_var
func urlToProperty(url1: felt, url2: felt) -> (property: felt):
end
@storage_var
func urlToHash(url1: felt, url2: felt) -> (hash: felt):
end

@storage_var
func publicKeys(address: felt, index: felt) -> (public_key: felt):
end


@external
func init{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> ():
  numOfProperties.write(0)
  urlIndex.write(0)

  return ()
end

@view
func getPublicKey{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(address: felt) -> (a: felt, b: felt):
  let (a) = publicKeys.read(address, 0)
  let (b) = publicKeys.read(address, 1)
  return (a, b)
end

@view
func getCiphertext{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(token_id: felt) -> (a: felt, b: felt):
  let (redeem) = redeemed.read(token_id)
  #assert redeem = 1, 'Ciphertext not posted yet'
  let (a) = tokenToCiphertext.read(token_id, 0)
  let (b) = tokenToCiphertext.read(token_id, 1)
  return (a, b)
end

@view
func getUrl{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(index: felt) -> (url1: felt, url2: felt):
  let (url) = urls.read(index)
  return (url[0], url[1])
end
@view
func getUrlData{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt) -> (url1: felt, url2: felt, property: felt, price: felt):
  let (property) = urlToProperty.read(url1, url2)
  let (price) = prices.read(url1, url2)
  #let (data: Url) = Url(url=url, property=property, price=price)
  return (url1, url2, property, price)
end
@view
func getUrlIndex{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (index: felt):
  let (index) = urlIndex.read()
  return (index)
end

@external
func createProperty{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(property: felt) -> (id: felt):
  let (property_exists) = properties.read(property) 
  assert property_exists = 0
  let (propertyId) = _propertyIds.read()
  _propertyIds.write(propertyId+1)
  let id = propertyId+1
  properties.write(property, id)
  _idProperties.write(id, property)

  return (id)
end

func _setProperty{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt, property: felt) -> (bool: felt):
  let (propertyId) = properties.read(property)
  #assert propertyId != 0, 'Property does not exist'
  urlToProperty.write(url1, url2, property)

  return (bool=1)
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

@view
func getNumOfProperties{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (num: felt):
  let (num) = numOfProperties.read()
  return (num)
end

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
func getCreator{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(url1: felt, url2: felt) -> (address: felt):
  let (creator) = _urlCreators.read(url1, url2)
  return (address=creator)
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
  urlToHash.write(url1, url2, key_hash)
  numOfTokens.write(url1, url2, 0)
  let url: (felt, felt) = (url1, url2)
  _setProperty(url[0], url[1], property)
  let (url_index) = urlIndex.read()
  urls.write(url_index, url)
  urlIndex.write(url_index+1)
  let public_key = PublicKey(a=public_key_a, b=public_key_b)
  addPublicKey(_seller, public_key_a, public_key_b)
  prices.write(url[0], url[1], price)

  return (bool=1)
end

func _mintToken{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(to: felt, url1: felt, url2: felt) -> ():
  let (id) = _tokenIds.read()
  let url: (felt, felt) = (url1, url2)
  let (length) = numOfTokens.read(url[0], url[1])
  _urlTokens.write(url[0], url[1], length, id)
  numOfTokens.write(url[0], url[1], length + 1)
  _tokenIds.write(id + 1)
  tokenUrl.write(id, url)
  _mint(to, id)
  _setTokenURI(id, url[0], url[1])

  return ()
end

func addPublicKey{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(address: felt, public_key_a: felt, public_key_b: felt) -> (bool: felt):
  # check if public key is recorded
  publicKeys.write(address, 0, public_key_a)
  publicKeys.write(address, 1, public_key_b)
  
  return (bool=1)
end

@external
func buyToken{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(buyer: felt, url1: felt, url2: felt, public_key_a: felt, public_key_b: felt) -> (bool: felt):
  let url: (felt, felt) = (url1, url2)
  let (price) = prices.read(url[0], url[1])
  #require(msg.value >= price, "Not enough money");
  let public_key = PublicKey(a=public_key_a, b=public_key_b)
  addPublicKey(buyer, public_key_a, public_key_b)
  _mintToken(buyer, url[0], url[1])

  return (bool=1)
end

func checkRedeem{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(tokenId: felt) -> (bool: felt):
  let (url) = tokenUrl.read(tokenId)
  let (_creator) = _urlCreators.read(url[0], url[1])
  #require(_creator == msg.sender, 'You are not the seller');
  #require(redeemed[tokenId] != 1, 'ETH already redeemed');

  return (bool=1)
end

@external
func redeem{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
  tokenId: felt
) -> (bool: felt):
  checkRedeem(tokenId)
  let (url) = tokenUrl.read(tokenId)
  #let (_seller) = msg.sender
  let (_buyer) = ownerOf(tokenId)
  #let (_publicKey: PublicKey) = publicKeys.read(_buyer)
  let (a) = publicKeys.read(_buyer, 0)
  let (b) = publicKeys.read(_buyer, 1)
  let (hash) = urlToHash.read(url[0], url[1])

  #require(input[2] == hash, 'Incorrect hash');
  #require(input[3] == _publicKey[0], 'Used wrong public key');
  #require(input[4] == _publicKey[1], 'Used wrong public key');
  #require(
  #  EncryptionVerifier.verifyProof(a, b, c, input),
  #  "Proof invalid!"
  #);

  let (price) = prices.read(url[0], url[1])
  #_seller.transfer(price)

  #let (tokenCiphertext) = Ciphertext(a=input[0], b=input[1])
  #let (tokenCiphertext) = Ciphertext(a=0, b=0)
  tokenToCiphertext.write(tokenId, 0, 0)
  tokenToCiphertext.write(tokenId, 1, 1)
  redeemed.write(tokenId, 1)

  return (bool=1)
end
