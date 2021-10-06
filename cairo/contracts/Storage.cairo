%lang starknet


struct Ciphertext:
  member a: felt
  member b: felt
end

struct PublicKey:
  member a: felt
  member b: felt
end

struct Account:
  member public_key: felt
  member token_balance: felt
end

struct State:
  member token_balance: felt
end

### USERS ###
@storage_var
func publicKeys(address: felt, index: felt) -> (public_key: felt):
end


### URLS ###
@storage_var
func urlIndex() -> (index: felt):
end
@storage_var
func urls(index: felt) -> (url: (felt, felt)):
end
@storage_var
func _urlCreators(url1: felt, url2: felt) -> (creator: felt):
end
@storage_var
func prices(url1: felt, url2: felt) -> (price: felt):
end
@storage_var
func urlToHash(url1: felt, url2: felt) -> (hash: felt):
end
@storage_var
func urlToProperty(url1: felt, url2: felt) -> (property: felt):
end


### TOKENS ###
@storage_var
func numOfTokens(url1: felt, url2: felt) -> (index: felt):
end
@storage_var
func _tokenIds() -> (res: felt):
end
@storage_var
func _urlTokens(url1: felt, url2: felt, index: felt) -> (token: felt):
end
@storage_var
func tokenUrl(token_id: felt) -> (url: (felt, felt)):
end
@storage_var
func tokenToCiphertext(token_id: felt, index: felt) -> (ciphertext: felt):
end
@storage_var
func redeemed(token_id: felt) -> (bool: felt):
end


### PROPERTIES ###
@storage_var
func numOfProperties() -> (int: felt):
end
@storage_var
func _propertyIds() -> (res: felt):
end
@storage_var
func properties(property: felt) -> (id: felt):
end
@storage_var
func _idProperties(id: felt) -> (property: felt):
end
