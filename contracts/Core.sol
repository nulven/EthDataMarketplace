pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;
import "./EncryptionVerifier.sol";
import "./Pairing.sol";
//import "./HashNFT.sol";
//import "./ContractStorage.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Core is ERC721 {

  string private _test;
  constructor() ERC721("test", "test") public {
    _test = "test";
  }

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  
  uint256 public constant MAX_NFTS = 10;
  uint256 public constant MAX_HASHES = 10;
  uint256 public constant price = 10;

  mapping (uint256 => EnumerableSet.UintSet) private tokens;
  mapping (uint256 => uint256) private token2Hash;
  mapping (address => uint256[2]) public publicKeys;
  string[] public hashes;

  function postHash(string memory hash) public returns (bool) {
    // assert hash is not posted
    // tokens[hash] = [];
    hashes.push(hash);
    return true;
  }

  function _mintToken(
    address to,
    uint256 hash
  ) internal returns (uint256) {
    _tokenIds.increment();
    uint256 id = _tokenIds.current();
    EnumerableSet.add(tokens[hash], id);
    token2Hash[id] = hash;
    _mint(to, id);
  }

  function buyToken(uint256 hash) public payable returns (bool) {
    require(msg.value >= price, "Not enough money");
    address _buyer = _msgSender();
    uint256 _tokenId = _mintToken(_buyer, hash);
    return true;
  }

  function redeem(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[15] memory input,
    uint256 tokenId
  ) public returns (bool) {
    address payable _seller = payable(msg.sender);
    uint256 hash = token2Hash[tokenId];
    address _buyer = ownerOf(tokenId);
    uint256[2] memory _publicKey = publicKeys[_buyer];
    require(input[12] == hash, 'Used wrong hash');
    require(input[13] == _publicKey[0], 'Used wrong public key');
    require(input[14] == _publicKey[1], 'Used wrong public key');
    require(
      EncryptionVerifier.verifyProof(a, b, c, input),
      "Proof invalid!"
    );
    _seller.transfer(price);
    // alert/send ciphertext to buyer
    return true;
  }
}
