// ctrll pagedn pageup
pragma solidity 0.7.6; // >=0.5.16 <=
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";

contract ContractStorage {

  struct Url {
    string url;
    string property;
    uint256 price;
  }
  DarkForestCore private immutable darkForestCore;
  address public darkForestCoreAddress;

  using Counters for Counters.Counter;

  // URLS
  string[] public urls;
  mapping(string => string) private urlToProperty;
  mapping(string => uint256) private urlToHash;
  mapping(string => address) private _urlCreators;
  mapping(string => uint256) prices;

  // TOKENS
  Counters.Counter private _tokenIds;
  mapping(string => EnumerableSet.UintSet) private _urlTokens;
  mapping(uint256 => string) private tokenUrl;
  mapping(uint256 => uint256[2]) private tokenToCiphertext;
  mapping(uint256 => uint256) private redeemed;

  // PROPERTIES
  Counters.Counter private _propertyIds;
  mapping(string => uint256) public properties;
  mapping(uint256 => string) public _idProperties;

  // USERS
  mapping(address => uint256[2]) public publicKeys;
}
