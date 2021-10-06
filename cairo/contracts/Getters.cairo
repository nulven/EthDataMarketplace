
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

