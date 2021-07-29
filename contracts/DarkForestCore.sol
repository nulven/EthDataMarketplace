pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import "./DarkForestUtils.sol";

contract DarkForestCore {
  DarkForestUtils.GameStorage public s;

  constructor() public {
    DarkForestUtils.Planet memory planet = DarkForestUtils.Planet({
      owner: msg.sender,
      isHomePlanet: true
    });

    uint256 location = 5228530872000388647816463285860870411975878209802611613611963004792914824074;
    s.planets[location] = planet;

    s.snarkConstants = DarkForestUtils.SnarkConstants({
      PLANETHASH_KEY: 2149252641268674884343858554091843927095993520400352350070838229268101760471
    });
  }

  function planets(uint256 key) public view returns (DarkForestUtils.Planet memory) {
    return s.planets[key];
  }

  function snarkConstants() public view returns (DarkForestUtils.SnarkConstants memory) {
    return s.snarkConstants;
  }

}
