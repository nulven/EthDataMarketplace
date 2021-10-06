pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ContractStorage {
  struct Content {
    uint256 id;
    string url;
    string property;
    uint256 keyHash;
    address creator;
    uint256 price;
  }

  struct Token {
    uint256 id;
    uint256 contentId;
    uint256 ciphertext1;
    uint256 ciphertext2;
    bool redeemed;
  }

  using Counters for Counters.Counter;

  // URLS
  mapping(string => uint256) public contentIds;
  Content[] public contents;

  // TOKENS
  Counters.Counter public _tokenIds;
  Token[] public tokens;
  mapping(uint256 => EnumerableSet.UintSet) internal contentTokenIds;

  // PROPERTIES
  Counters.Counter public _propertyIds;
  mapping(string => uint256) public properties;
  mapping(uint256 => string) public _idProperties;

  // USERS
  mapping(address => uint256[2]) public publicKeys;

  function getPublicKey(address _address) public view returns (uint256[2] memory publicKey) {
    return publicKeys[_address];
  }

  function getContent(uint256 contentId) public view returns (Content memory) {
    return contents[contentId];
  }

  function contentCount() public view returns (uint256) {
    return contents.length;
  }

  function getToken(uint id) public view returns (Token memory) {
    return tokens[id];
  }

  function getTokenIds(uint256 contentId) public view returns (uint256[] memory) {
    EnumerableSet.UintSet storage _tokenIds = contentTokenIds[contentId];
    uint tokenCount = EnumerableSet.length(_tokenIds);
    uint256[] memory tokenIds = new uint256[](tokenCount);
    for (uint256 i = 0; i < tokenCount; i++) {
      tokenIds[i] = EnumerableSet.at(_tokenIds, i);
    }
    return tokenIds;
  }

  function getNumOfProperties() public view returns (uint256 length) {
    return _propertyIds.current();
  }

  function incrementProperty() public returns (bool) {
    _propertyIds.increment();
    return true;
  }

  function getProperty(uint256 id) public view returns (string memory) {
    return _idProperties[id];
  }
}
