pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import "./ContractStorage.sol";

contract Getters is ERC721URIStorage, ContractStorage {

  function getAddress() public view returns (address) {
    return darkForestCoreAddress;
  }

  function getPublicKey(address _address) public view returns (uint256[2] memory publicKey) {
    return publicKeys[_address];
  }

  function getUrls() public view returns (string[] memory) {
    return urls;
  }

  function getUrlData() public view returns (Url[] memory) {
    uint length = urls.length;
    Url[] memory data = new Url[](length);
    for (uint i=0; i<length; i++) {
      string memory url = urls[i];
      Url memory object = getUrl(url);
      data[i] = object;
    }
    return data;
  }
  
  function getUrl(string memory url) public view returns (Url memory) {
    Url memory object;
    object.url = url;
    object.property = urlToProperty[url];
    object.price = prices[url];
    return object;
  }

  function getCreator(string calldata url) public view returns (address) {
    return _urlCreators[url];
  }

  function getCiphertext(uint256 tokenId) public view returns (uint256[2] memory) {
    uint256[2] memory ciphertext = tokenToCiphertext[tokenId];
    require(redeemed[tokenId] == 1, 'Ciphertext not posted yet');
    return ciphertext;
  }

  function getProperties() public view returns (string[] memory) {
    uint length = _propertyIds.current();
    string[] memory _properties = new string[](length);
    for (uint i=1; i<=length; i++) {
      _properties[i-1] = _idProperties[i];
    }
    return _properties;
  }

  function getProperty(string calldata url) public view returns (string memory) {
    return urlToProperty[url];
  }

  function getTokens(string calldata url) public view returns (uint256[] memory) {
    uint256 length = EnumerableSet.length(_urlTokens[url]);
    uint256[] memory tokenIds = new uint256[](length);
    for (uint i = 0; i < length; i++) {
      tokenIds[i] = EnumerableSet.at(_urlTokens[url], i);
    }
    return tokenIds;
  }

  function getHashSalt() public view returns (uint256) {
    DarkForestCore.SnarkConstants memory s = darkForestCore.snarkConstants();
    return s.PLANETHASH_KEY;
  }
}
