pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import "./ContractStorage.sol";

contract utils is ERC721URIStorage, ContractStorage {
  function checkHash(uint256 hash, uint256 salt) public view returns (DarkForestCore.Planet memory) {
    uint256 dfSalt = getHashSalt();
    DarkForestCore.Planet memory planet;
    if (dfSalt == salt) {
      planet = darkForestCore.planets(hash);
    }
    return planet;
  }

  function _setProperty(string calldata url, string calldata property) internal returns (bool) {
    uint256 propertyId = properties[property];
    require(propertyId != 0, 'Property does not exist');
    urlToProperty[url] = property;
    return true;
  }

  function _mintToken(
    address to,
    string calldata url
  ) internal returns (uint256) {
    _tokenIds.increment();
    uint256 id = _tokenIds.current();
    EnumerableSet.add(_urlTokens[url], id);
    tokenUrl[id] = url;
    _mint(to, id);
    _setTokenURI(id, url);
  }

  function addPublicKey(address _address, uint256[2] memory publicKey) internal returns (bool) {
    if (publicKeys[_address][0] == 0) {
      publicKeys[_address] = publicKey;
    }
    return true;
  }

}
