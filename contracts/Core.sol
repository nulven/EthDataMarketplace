pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "./verifiers/EncryptionVerifier.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./ContractStorage.sol";


contract Core is ERC721URIStorage, ContractStorage {

  uint256 cairoProgramHash_;
  IFactRegistry cairoVerifier_;

  constructor(
    uint256 cairoProgramHash,
    address cairoVerifier
  ) ERC721("test", "test") public {
    cairoProgramHash_ = cairoProgramHash;
    cairoVerifier_ = IFactRegistry(cairoVerifier);

    string memory hash = "hash";
    string memory blur = "blur";
    string memory df = "df";
    createProperty(hash);
    createProperty(blur);
    createProperty(df);
  }

  function createProperty(string memory property) internal returns (uint256 id) {
    require(properties[property] == 0, 'Property already exists');
    incrementProperty();
    uint256 id = getNumOfProperties();
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
    for (uint i = 0; i < contents.length; i++) {
      if (keccak256(bytes(contents[i].url)) == keccak256(bytes(url))) {
        urlExists = 1;
      }
    }
    require(urlExists == 0, 'Url already posted');

    address _seller = msg.sender;
    Content memory content;
    content.id = contents.length;
    content.url = url;
    content.property = property;
    content.creator = _seller;
    content.price = price;
    content.keyHash = keyHash;
    content.property = property;
    // _setProperty(content.id, property);
    contents.push(content);

    addPublicKey(_seller, publicKey);

    return true;
  }

  function buyToken(
    uint256 contentId,
    uint256[2] memory publicKey
  ) public payable returns (bool) {
    Content memory content = contents[contentId];
    require(msg.value >= content.price, 'Not enough money');
    address _buyer = _msgSender();
    addPublicKey(_buyer, publicKey);
    _mintToken(_buyer, contentId);
    return true;
  }

  function checkRedeem(
    uint256 tokenId
  ) internal returns (bool) {
    Token memory token = tokens[tokenId];
    Content memory content = contents[token.contentId];
    // require(content.creator == msg.sender, 'You are not the seller');
    // require(token.redeemed == false, 'ETH already redeemed');
    require(content.creator == msg.sender, '');
    require(token.redeemed == false, '');

    return true;
  }

  function assert_proof_inputs(
    uint256[5] memory input,
    address buyer,
    uint256 contentId 
  ) internal returns (bool) {
    uint256[2] memory publicKey = publicKeys[buyer];
    Content memory content = contents[contentId];

    // require(input[0] == content.keyHash, 'Incorrect hash');
    require(input[3] == publicKey[0], 'Used wrong public key');
    require(input[4] == publicKey[1], 'Used wrong public key');
  }

  function execute_redeem(
    uint256 tokenId,
    uint256 contentId,
    uint256[5] memory input
  ) internal returns (bool) {

    address payable _seller = payable(msg.sender);

    Content memory content = contents[contentId];
    _seller.transfer(content.price);

    // alert/send ciphertext to buyer
    uint256[2] memory tokenCiphertext;
    tokenCiphertext[0] = input[1];
    tokenCiphertext[1] = input[2];

    Token memory token = tokens[tokenId];
    token.redeemed = true;
    token.ciphertext1 = tokenCiphertext[0];
    token.ciphertext2 = tokenCiphertext[1];
    tokens[tokenId] = token;

    return true;
  }

  function redeem_snark(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[5] memory input,
    uint256 tokenId
  ) public returns (bool) {

    checkRedeem(tokenId);
    Token memory token = tokens[tokenId];
    address _buyer = ownerOf(tokenId);

    assert_proof_inputs(input, _buyer, token.contentId);
    require(
      EncryptionVerifier.verifyProof(a, b, c, input),
      'Proof invalid!'
    );

    execute_redeem(tokenId, token.contentId, input);

    return true;
  }

  function redeem_stark(
    uint256[5] memory input,
    uint256 tokenId
  ) public returns (bool) {

    // checkRedeem(tokenId);
    Token memory token = tokens[tokenId];
    address _buyer = ownerOf(tokenId);
    assert_proof_inputs(input, _buyer, token.contentId);
    bytes32 outputHash = keccak256(abi.encodePacked(input));
    bytes32 fact = keccak256(abi.encodePacked(cairoProgramHash_, outputHash));
    // require(cairoVerifier_.isValid(fact), 'MISSING_CAIRO_PROOF');

    execute_redeem(tokenId, token.contentId, input);

    return true;
  }

  function _setProperty(uint256 contentId, string calldata property) internal returns (bool) {
    uint256 propertyId = properties[property];
    require(propertyId != 0, 'Property does not exist');
    Content memory content = contents[contentId];
    content.property = property;
    contents[contentId] = content;
    return true;
  }

  function _mintToken(
    address to,
    uint256 contentId
  ) internal returns (uint256) {
    uint256 id = tokens.length;
    Content memory content = contents[contentId];

    Token memory token;
    token.id = id;
    token.contentId = contentId;
    EnumerableSet.add(contentTokenIds[content.id], id);
    tokens.push(token);
    _mint(to, id);
    _setTokenURI(id, content.url);
  }

  function addPublicKey(address _address, uint256[2] memory publicKey) internal returns (bool) {
    if (publicKeys[_address][0] == 0) {
      publicKeys[_address] = publicKey;
    }

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

abstract contract IFactRegistry {
  function isValid(bytes32 fact)
    external view virtual
    returns (bool);
}
