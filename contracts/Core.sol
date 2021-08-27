pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import "./verifiers/EncryptionVerifier.sol";
import "./ContractStorage.sol";
import "./Getters.sol";
import "./utils.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract Core is ERC721URIStorage, Getters, ContractStorage, utils {

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

  function createProperty(string memory property) public returns (uint256 id) {
    require(properties[property] == 0, 'Property already exists');
    _propertyIds.increment();
    uint256 id = _propertyIds.current();
    properties[property] = id;
    _idProperties[id] = property;
    return id;
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
