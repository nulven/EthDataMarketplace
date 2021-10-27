require('dotenv').config();

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { camelCase, upperCase } from './utils';

const cwd = process.cwd();
const compiledCircuitsDirectory = path.resolve(`${cwd}/compiledCircuits`);
const outputDirectory = path.resolve(`${cwd}/contracts`);

try {
  const header = 
  `pragma solidity >=0.7.6;\n` + 
  `pragma abicoder v2;\n` + 
  `import "./Pairing.sol";\n`;
  const verify = `
  using Pairing for *;
  struct VerifyingKey {
      Pairing.G1Point alfa1;
      Pairing.G2Point beta2;
      Pairing.G2Point gamma2;
      Pairing.G2Point delta2;
      Pairing.G1Point[] IC;
  }
  struct Proof {
      Pairing.G1Point A;
      Pairing.G2Point B;
      Pairing.G1Point C;
  }
  function verify(
    uint[] memory input,
    Proof memory proof,
    VerifyingKey memory vk
  ) internal view returns (uint) {
    uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    require(input.length + 1 == vk.IC.length,"verifier-bad-input");
    // Compute the linear combination vk_x
    Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
    for (uint i = 0; i < input.length; i++) {
        require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
        vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
    }
    vk_x = Pairing.addition(vk_x, vk.IC[0]);
    if (!Pairing.pairingProd4(
        Pairing.negate(proof.A), proof.B,
        vk.alfa1, vk.beta2,
        vk_x, vk.gamma2,
        proof.C, vk.delta2
    )) return 1;
    return 0;
  }
  function verifyProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[] memory input,
    VerifyingKey memory vk
  ) public view returns (bool) {
    Proof memory proof;
    proof.A = Pairing.G1Point(a[0], a[1]);
    proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
    proof.C = Pairing.G1Point(c[0], c[1]);
    if (verify(input, proof, vk) == 0) {
        return true;
    } else {
        return false;
    }
  }`;
  const circuits = fs.readdirSync(`${compiledCircuitsDirectory}`);
  const verifiers = circuits.map(circuit => buildVerifier(circuit.split('.')[0])).join('\n');
  const contract = 
`${header}
library Verifier {
  ${verify}

  ${verifiers}}`;
  fs.writeFileSync(`${outputDirectory}/Verifier.sol`, contract);
} catch (error) {
  console.log(error);
  process.exit(1);
}

function buildVerifier(circuitName) {
  execSync(`npx snarkjs zkey export solidityverifier ${compiledCircuitsDirectory}/${circuitName}/circuit.zkey verifier.sol`, {
    stdio: 'inherit',
  });
  const data = fs.readFileSync('verifier.sol').toString();
  execSync('rm ' + 'verifier.sol', { stdio: 'inherit' });
  const strList = data.match('(?<=VerifyingKey memory vk.*{\n    )(.*\n)*(?=\n*    }\n.*function)');
  const pairings = strList[0];

  const numInputs = parseInt(pairings.match('(?<=vk.IC = new Pairing\.G1Point[\[\]]).*(?=;)')[0].match('\(([^()]+)\)')[0]) - 1;
  const body = 
    `function ${camelCase(circuitName)}VerifyingKey() internal pure returns (VerifyingKey memory vk) {
    ${pairings}
  }
  function verify${upperCase(circuitName)}Proof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[${numInputs}] memory input
  ) public view returns (bool) {
    uint256[] memory inputValues = new uint256[](input.length);
    for (uint256 i = 0; i < input.length; i++) {
      inputValues[i] = input[i];
    }
    return verifyProof(a, b, c, inputValues, ${camelCase(circuitName)}VerifyingKey());
  }\n`;

  return body;
}
