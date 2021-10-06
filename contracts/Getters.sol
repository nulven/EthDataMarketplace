pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import "./Core.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";


interface ICore {
  function postUrl(
    string calldata url,
    uint256[2] memory publicKey,
    uint256 keyHash,
    string calldata property,
    uint256 price
  ) external returns (bool);

  function buyToken(
    uint256 contentId,
    uint256[2] memory publicKey
  ) payable external returns (bool);

  function redeem_snark(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[5] memory input,
    uint256 tokenId
  ) external returns (bool);

  function redeem_stark(
    uint256[5] memory input,
    uint256 tokenId
  ) external returns (bool);

  function getPublicKey(address _address) view external returns (uint256[2] memory publicKey);

  function getContent(uint256 contentId) view external returns (ContractStorage.Content memory);

  function contentCount() view external returns (uint256);

  function getToken(uint id) view external returns (ContractStorage.Token memory);

  function getTokenIds(uint256 contentId) view external returns (uint256[] memory);

  function getNumOfProperties() view external returns (uint256 length);

  function incrementProperty() external returns (bool);

  function getProperty(uint256 id) view external returns (string memory);
}

contract Getters {

  ICore coreContract;

  function initialize(
    address _coreContractAddress
  ) public {
    coreContract = ICore(_coreContractAddress);
  }

  function getPublicKey(address _address) public view returns (uint256[2] memory publicKey) {
    return coreContract.getPublicKey(_address);
  }

  function getContents() public view returns (ContractStorage.Content[] memory) {
    ContractStorage.Content[] memory ret =
      new ContractStorage.Content[](coreContract.contentCount());

    for (uint256 i = 0; i < coreContract.contentCount(); i++) {
      ret[i] = coreContract.getContent(i);
    }

    return ret;
  }

  function getCreator(uint256 id) public view returns (address) {
    return coreContract.getContent(id).creator;
  }

  function getCiphertext(uint256 tokenId) public view returns (uint256[2] memory) {
    ContractStorage.Token memory token = coreContract.getToken(tokenId);
    // require(token.redeemed == true, 'Ciphertext not posted yet');
    require(token.redeemed == true, '');
    uint256[2] memory ciphertext;
    ciphertext[0] = token.ciphertext1;
    ciphertext[1] = token.ciphertext2;
    return ciphertext;
  }

  function getProperty(uint256 id) public view returns (string memory) {
    return coreContract.getContent(id).property;
  }

  function getProperties() public view returns (string[] memory) {
    uint256 length = coreContract.getNumOfProperties();
    string[] memory _properties = new string[](length);
    for (uint i=1; i<=length; i++) {
      _properties[i-1] = coreContract.getProperty(i);
    }
    return _properties;
  }

  function getToken(uint256 tokenId) public view returns (ContractStorage.Token memory) {
    return coreContract.getToken(tokenId);
  }

  function getTokens(uint256 contentId) public view returns (ContractStorage.Token[] memory) {
    uint256[] memory tokenIds = coreContract.getTokenIds(contentId);
    uint tokenCount = tokenIds.length;
    ContractStorage.Token[] memory ret =
      new ContractStorage.Token[](tokenCount);

    for (uint256 i = 0; i < tokenCount; i++) {
      ret[i] = coreContract.getToken(tokenIds[i]);
    }

    return ret;
  }

  function getHashSalt() public view returns (uint256) {
    // DarkForestCore.SnarkConstants memory s = darkForestCore.snarkConstants();
    return 0;
  }
}
