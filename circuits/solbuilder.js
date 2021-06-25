require("dotenv").config();

const { execSync } = require("child_process");
const fs = require("fs");

const circuitName = process.argv[2];

if (process.argv.length !== 3) {
  console.log("usage");
  console.log(
    "builder circuits"
  );
  process.exit(1);
}

const cwd = process.cwd();

process.chdir(cwd + "/circuits/keys/" + circuitName);

function camelCase(str) {
  return str.split('-').map(_ => {
    return _[0].toUpperCase() + _.slice(1);
  }).join('');
}

try {
  execSync("npx snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol", {
    stdio: "inherit",
  });
  execSync("mkdir -p " + cwd + "/contracts/verifiers/" + circuitName, {
    stdio: "inherit",
  });
  const data = fs.readFileSync("verifier.sol").toString();
  const split = 'pragma solidity';
  const split1 = 'contract Verifier {';
  const start = data.split(split)[0];
  const end = data.split(split1)[1];
  const header = "pragma solidity 0.7.6; // >=0.5.16 <=\npragma experimental ABIEncoderV2;\nimport './Pairing.sol';\n\n"
  const contract = start + header + "library " + camelCase(circuitName) + "Verifier {" + end;
  fs.writeFileSync(cwd + "/contracts/" + camelCase(circuitName) + "Verifier.sol", contract);
  execSync("rm " + "verifier.sol", {
    stdio: "inherit",
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
