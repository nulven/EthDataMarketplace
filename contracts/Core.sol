pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import "./verifiers/EncryptionVerifier.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract Core is ERC721URIStorage {

  DarkForestCore private immutable darkForestCore;
  address public darkForestCoreAddress;

  constructor(
    address _darkForestCoreAddress
  ) ERC721("test", "test") public {
    darkForestCoreAddress = _darkForestCoreAddress;
    darkForestCore = DarkForestCore(_darkForestCoreAddress);
    string memory hash = "hash";
    string memory blur = "blur";
    string memory df = "df";
    createProperty(hash);
    createProperty(blur);
    createProperty(df);
  }

  function getAddress() public view returns (address) {
    return darkForestCoreAddress;
  }

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  Counters.Counter private _propertyIds;

  mapping(string => EnumerableSet.UintSet) private _urlTokens;
  mapping(uint256 => string) private tokenUrl;

  mapping(string => address) private _urlCreators;

  mapping(uint256 => uint256[2]) private tokenToCiphertext;
  mapping(uint256 => uint256) private redeemed;
  mapping(string => uint256) prices;

  mapping(string => uint256) public properties;
  mapping(uint256 => string) public _idProperties;
  mapping(string => string) private urlToProperty;
  mapping(string => uint256) private urlToHash;

  mapping(address => uint256[2]) public publicKeys;
  string[] public urls;


  function getPublicKey(address _address) public view returns (uint256[2] memory publicKey) {
    return publicKeys[_address];
  }

  function getCiphertext(uint256 tokenId) public view returns (uint256[2] memory) {
    uint256[2] memory ciphertext = tokenToCiphertext[tokenId];
    require(redeemed[tokenId] == 1, 'Ciphertext not posted yet');
    return ciphertext;
  }

  function getUrls() public view returns (string[] memory) {
    return urls;
  }

  struct Url {
    string url;
    string property;
    uint256 price;
  }

  function getHashSalt() public view returns (uint256) {
    DarkForestCore.SnarkConstants memory s = darkForestCore.snarkConstants();
    return s.PLANETHASH_KEY;
  }

  function checkHash(uint256 hash, uint256 salt) public view returns (DarkForestCore.Planet memory) {
    uint256 dfSalt = getHashSalt();
    DarkForestCore.Planet memory planet;
    if (dfSalt == salt) {
      planet = darkForestCore.planets(hash);
    }
    return planet;
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

  function getProperties() public view returns (string[] memory) {
    uint length = _propertyIds.current();
    string[] memory _properties = new string[](length);
    for (uint i=1; i<=length; i++) {
      _properties[i-1] = _idProperties[i];
    }
    return _properties;
  }

  function createProperty(string memory property) public returns (uint256 id) {
    require(properties[property] == 0, 'Property already exists');
    _propertyIds.increment();
    uint256 id = _propertyIds.current();
    properties[property] = id;
    _idProperties[id] = property;
    return id;
  }

  function _setProperty(string calldata url, string calldata property) internal returns (bool) {
    uint256 propertyId = properties[property];
    require(propertyId != 0, 'Property does not exist');
    urlToProperty[url] = property;
    return true;
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

  function getCreator(string calldata url) public view returns (address) {
    return _urlCreators[url];
  }

  function postUrl(
    string calldata url,
    uint256[2] memory publicKey,
    uint256 keyHash,
    string calldata property,
    uint256 price
  ) public returns (bool) {
    uint urlExists = 0;
    for (uint i = 0; i < urls.length; i++) {
      if (keccak256(bytes(urls[i])) == keccak256(bytes(url))) {
        urlExists = 1;
      }
    }
    require(urlExists == 0, 'Url already posted');
    urlToHash[url] = keyHash;
    _setProperty(url, property);
    urls.push(url);
    address _seller = msg.sender;
    _urlCreators[url] = _seller;
    addPublicKey(_seller, publicKey);
    prices[url] = price;
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

  function buyToken(
    string calldata url,
    uint256[2] memory publicKey
  ) public payable returns (bool) {
    uint256 price = prices[url];
    require(msg.value >= price, "Not enough money");
    address _buyer = _msgSender();
    addPublicKey(_buyer, publicKey);
    _mintToken(_buyer, url);
    return true;
  }

  function checkRedeem(
    uint256 tokenId
  ) internal returns (bool) {
    string storage url = tokenUrl[tokenId];
    address _creator = _urlCreators[url];
    require(_creator == msg.sender, 'You are not the seller');
    require(redeemed[tokenId] != 1, 'ETH already redeemed');

    return true;
  }

  function redeem(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[5] memory input,
    uint256 tokenId
  ) public returns (bool) {
    checkRedeem(tokenId);
    string storage url = tokenUrl[tokenId];
    address payable _seller = payable(msg.sender);
    address _buyer = ownerOf(tokenId);
    uint256[2] memory _publicKey = publicKeys[_buyer];
    uint256 hash = urlToHash[url];

    require(input[2] == hash, 'Incorrect hash');
    require(input[3] == _publicKey[0], 'Used wrong public key');
    require(input[4] == _publicKey[1], 'Used wrong public key');
    require(
      EncryptionVerifier.verifyProof(a, b, c, input),
      "Proof invalid!"
    );

    uint256 price = prices[url];
    _seller.transfer(price);

    // alert/send ciphertext to buyer
    uint256[2] memory tokenCiphertext;
    tokenCiphertext[0] = input[0];
    tokenCiphertext[1] = input[1];
    tokenToCiphertext[tokenId] = tokenCiphertext;
    redeemed[tokenId] = 1;
    return true;
  }
}

abstract contract DarkForestCore {
  enum PlanetType {PLANET, SILVER_MINE, RUINS, TRADING_POST, SILVER_BANK}
  struct Planet {
    address owner;
    bool isHomePlanet;
  }

  struct SnarkConstants {
    uint256 PLANETHASH_KEY;
  }

  struct GameStorage {
    mapping(uint256 => Planet) planets;
    SnarkConstants snarkConstants;
  }

  GameStorage public s;

  function planets(uint256 key) public view virtual returns (Planet memory);
  function snarkConstants() public view virtual returns (SnarkConstants memory);
}
