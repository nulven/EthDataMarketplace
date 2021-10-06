%lang starknet

from starkware.starknet.common.storage import Storage
from starkware.cairo.common.cairo_builtins import HashBuiltin

@storage_var
func _owners(token_id: felt) -> (owners: felt):
end

@storage_var
func _balances(address: felt) -> (balance: felt):
end

@storage_var
func _tokenApprovals(token_id: felt) -> (address: felt):
end

@storage_var
func _operatorApprovals(address1: felt, address2:  felt) -> (bool: felt):
end

func balanceOf{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(owner: felt) -> (balance: felt):
  #require(owner != address(0), "ERC721: balance query for the zero address");
  let (balance) = _balances.read(owner)
  return (balance)
end

func ownerOf{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(token_id: felt) -> (address: felt):
  let (owner) = _owners.read(token_id)
  #require(owner != address(0), "ERC721: owner query for nonexistent token");
  return (owner)
end

func tokenURI(token_id: felt) -> (uri: felt):
  #require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

  #string memory baseURI = _baseURI();
  #return bytes(baseURI).length > 0
    #? string(abi.encodePacked(baseURI, tokenId.toString()))
    #: '';
end

func _mint{storage_ptr: Storage*, pedersen_ptr: HashBuiltin*, range_check_ptr}(to: felt, token_id: felt):
  #require(to != address(0), "ERC721: mint to the zero address");
  #require(!_exists(tokenId), "ERC721: token already minted");

  let (balance) = _balances.read(to)
  _balances.write(to, balance+1)
  _owners.write(token_id, to)

  return ()
end
