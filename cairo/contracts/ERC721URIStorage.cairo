%lang starknet

from starkware.starknet.common.storage import Storage
from starkware.cairo.common.cairo_builtins import HashBuiltin

@storage_var
func _tokenURIs(token: felt) -> (uri: (felt, felt)):
end

func _setTokenURI{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(token_id: felt, _token_uri1: felt, _token_uri2: felt):
  #require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
  let _token_uri: (felt, felt) = (_token_uri1, _token_uri2)
  _tokenURIs.write(token_id, _token_uri)

  return ()
end

func tokenURI{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(token_id: felt) -> (uri: (felt, felt)):
  #require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");
  
  let (_tokenURI) = _tokenURIs.read(token_id)
  return (uri=_tokenURI)
  #let (base) = _baseURI()

  #if (bytes(base).length == 0):
    #return _tokenURI
  #end

  #if (bytes(_tokenURI).length > 0):
    #return string(abi.encodePacked(base, _tokenURI))
  #end

  #return tokenURI(token_id)
end
