library DarkForestUtils {
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

  function getGameStorage() public pure returns (GameStorage storage ret) {
    bytes32 position = bytes32(uint256(1));
      assembly {
          ret.slot := position
      }
  }
}
