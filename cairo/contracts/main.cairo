%lang starknet
%builtins pedersen range_check

from cairo.contracts.ERC721 import (ownerOf)
from cairo.contracts.ERC721URIStorage import (_setTokenURI, tokenURI)

from starkware.starknet.common.storage import Storage

@storage_var
func _tokenIds() -> (res: felt):
end
@storage_var
func _propertyIds() -> (res: felt):
end
@storage_var
func url_index() -> (res: felt):
end

@storage_var
func _urlTokens(url: felt) -> (token_set: felt*):
end
@storage_var
func numOfTokens(url: felt) -> (index: felt):
end
@storage_var
func tokenUrl(token_id: felt) -> (url: felt):
end

@storage_var
func _urlCreators(url: felt) -> (creator: felt):
end

@storage_var
func tokenToCiphertext(token_id: felt) -> (ciphertext: Ciphertext):
end
@storage_var
func redeemed(token_id: felt) -> (bool: felt):
end
@storage_var
func prices(url: felt) -> (price: felt):
end

@storage_var
func properties(property: felt) -> (id: felt):
end
@storage_var
func _idProperties(id: felt) -> (property: felt):
end

@storage_var
func urlToProperty(url: felt) -> (property: felt):
end
@storage_var
func urlToHash(url: felt) -> (hash: felt):
end

@storage_var
func publicKeys(address: felt) -> (public_key: PublicKey):
end

@storage_var
func urls(index: felt) -> (url: felt):
end

@view
func getPublicKey{storage_ptr: Storage*}(address: felt) -> (public_key: PublicKey):
  let (res: PublicKey) = publicKeys.read(address)
  return (public_key=res)
end

@view
func getCiphertext{storage_ptr: Storage*}(token_id: felt) -> (ciphertext: Ciphertext):
  let (redeem) = redeemed.read(token_id)
  #assert redeem = 1, 'Ciphertext not posted yet'
  let (ciphertext: Ciphertext) = tokenToCiphertext.read(token_id)
  return (ciphertext)
end

@view 
func getUrls{storage_ptr: Storage*}() -> (urls: felt*):
  let (url_array: felt*) = alloc()
  let (num_urls) = url_index.read()
  let index = 0
  loop:
  let (url) = urls.read(index)
  assert [url_array + index] = url
  let index = index + 1
  if index != num_urls:
    jmp loop

  return (urls=url_array)
end

struct Url:
  member url: felt
  member property: felt
  member price: felt
end

@view
func getUrl{storage_ptr: Storage*}(url: felt) -> (data: Url):
  let (property) = urlToProperty.read(url)
  let (price) = prices.read(url)
  let (data: Url) = Url(url=url, property=property, price=price)
  return (data)
end


@view
func getUrlData{storage_ptr: Storage*}() -> (urls: Url*):
  let (url_array: Url*) = alloc()
  let (num_urls) = url_index.read()
  let index = 0
  loop:
  let (url: Url) = getUrl(url)
  assert [url_array + index] = url
  let index = index + 1
  if index != num_urls:
    jmp loop

  return (urls=url_array)
end

@view
func getProperties{storage_ptr: Storage*}() -> (properties: felt*):
  let (property_array: felt*) = alloc()
  let (propertyIndex) = _propertyIds.read()
  let index = 0
  loop:
  let (property) = _idProperties.read(index)
  assert [propertyIndex+index] = property
  let index = index + 1
  if index != propertyIndex:
    jmp loop

  return (properties=property_array)
end

@external
func createProperty{storage_ptr: Storage*}(property: felt) -> (id: felt):
  let (property_exists) = properties.read(property) 
  assert property_exists = 0
  let (propertyId) = _propertyIds.read()
  _propertyIds.write(propertyId+1)
  let id = propertyId+1
  properties.write(property, id)
  _idProperties.write(id, property)

  return (id)
end

func _setProperty{storage_ptr: Storage*}(url: felt, property: felt) -> (bool: felt):
  let (propertyId) = property.read(property)
  #assert propertyId != 0, 'Property does not exist'
  urlToProperty.write(url, property)

  return (bool=1)
end

@view
func getProperty{storage_ptr: Storage*}(url: felt) -> (property: felt):
  let (property) = urlToProperty.read(url)
  return (property)
end

@view
func getTokens{storage_ptr: Storage*}(url: felt) -> (tokens: felt*):
  let (tokenArray: felt*) = _urlTokens.read(url)
  return (tokens=tokenArray)
end

@view
func getCreator{storage_ptr: Storage*}(url: felt) -> (address: felt):
  let (creator) = _urlCreators.read(url)
  return (address=creator)
end

func postUrl{storage_ptr: Storage*}(
  url: felt,
  public_key: PublicKey,
  key_hash: felt,
  property: felt,
  price: felt
) -> (bool: felt):
  # check if url exists
  urlToHash.write(url, key_hash)
  _setProperty(url, property)
  #urls.push(url)
  #let _seller = msg.sender
  addPublicKey(_seller, public_key)
  prices.write(url, price)

  return (bool=1)
end

func _mintToken{storage_ptr: Storage*}(to: felt, url: felt) -> ():
  let (id) = _tokenIds.read()
  let (length) = numOfTokens.read(url)
  let (tokenArray: felt*) = _urlToTokens.read(url)
  assert [tokenArray + length] = id
  numOfTokens.write(length + 1)
  _tokensIds.write(id + 1)
  tokenUrl.write(id, url)
  _mint(to, id)
  _setTokenURI(id, url)

  return ()
end

func addPublicKey{storage_ptr: Storage*}(address: felt, public_key: PublicKey) -> (bool: felt):
  # check if public key is recorded
  publicKeys.write(address, public_key)
  
  return (bool=1)
end

func buyToken{storage_ptr: Storage*}(url: felt, public_key: PublicKey) -> (bool: felt):
  let (price) = prices.read(url)
  #require(msg.value >= price, "Not enough money");
  #let (_buyer) = _msgSender()
  addPublicKey(_buyer, public_key)
  _mintToken(_buyer, url)

  return (bool=1)
end

func checkRedeem{storage_ptr: Storage*}(tokenId: felt) -> (bool: felt):
  let (url) = tokenId.read(tokenId)
  let (_creator) = _urlCreators.read(url)
  #require(_creator == msg.sender, 'You are not the seller');
  #require(redeemed[tokenId] != 1, 'ETH already redeemed');

  return (bool=1)
end

func redeem{storage_ptr: Storage*}(
  tokenId: felt
) -> (bool: felt):
  checkRedeem(tokenId)
  let (url) = tokenUrl.read(tokenId)
  #let (_seller) = msg.sender
  let (_buyer) = ownerOf(tokenId)
  let (_publicKey: PublicKey) = publicKeys.read(_buyer)
  let (hash) = urlToHash.read(url)


  #require(input[2] == hash, 'Incorrect hash');
  #require(input[3] == _publicKey[0], 'Used wrong public key');
  #require(input[4] == _publicKey[1], 'Used wrong public key');
  #require(
  #  EncryptionVerifier.verifyProof(a, b, c, input),
  #  "Proof invalid!"
  #);

  let (price) = prices.read(url)
  #_seller.transfer(price)

  let (tokenCiphertext) = Ciphertext(a=input[0], b=input[1])
  tokenToCiphertext.write(tokenId, tokenCiphertext)
  redeemed.write(tokenId, 1)

  return (bool=1)
end
