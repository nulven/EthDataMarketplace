pragma solidity 0.7.6; // >=0.5.16 <=
pragma experimental ABIEncoderV2;

import "openzeppelin/contracts/token/ERC721/ERC721.sol";
import "openzeppelin/contracts/math/SafeMath.sol";
import "openzeppelin/contracts/BaseRelayRecipient.sol";

contract HashNFT is BaseRelayRecipient, ERC721 {

  constructor() ERC721('Test', 'Test') public {
  }

  function buyToken(uint256 _tokenId) public payable {
    uint256 _price = tokenPrice[_tokenId];
    require(_price > 0, "this token is not for sale");
    require(msg.value >= _price, "Amount sent too small");
    address _buyer = _msgSender();
    address payable _seller = address(uint160(ownerOf(_tokenId)));
    _transfer(_seller, _buyer, _tokenId);
    //Note: a pull mechanism would be safer here: https://docs.openzeppelin.com/contracts/2.x/api/payment#PullPayment

    (, address payable _artist, , , , , ) = niftyInk().inkInfoByInkUrl(_inkUrl);

    _artist.transfer(_artistTake);
    _seller.transfer(_sellerTake);

    emit boughtInk(_tokenId, _inkUrl, _buyer, msg.value);
  }

  function _msgSender() internal override(BaseRelayRecipient, Context) view returns (address payable) {
    return BaseRelayRecipient._msgSender();
  }

  function _msgData() internal override(BaseRelayRecipient, Context) view returns (bytes memory ret) {
    return BaseRelayRecipient._msgData();
  }

}
