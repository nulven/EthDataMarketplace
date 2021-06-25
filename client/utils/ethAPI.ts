require("dotenv").config({ path: process.cwd() + '/.env' });
import { Contract, ContractFactory, providers, Wallet } from 'ethers';
import { modPBigIntNative } from './mimc';
import fetch from 'node-fetch';
import fs from 'fs';

const projectId = process.env.PROJECT_ID;
const network_url = process.env.NODE_ENV === "production" ? `https://ropsten.infura.io/v3/${projectId}` : 'http://localhost:8545';
const provider = new providers.JsonRpcProvider(network_url);

const mnemonic = process.env.MNEMONIC;
const path = process.env.WALLET_PATH;
const folder = process.env.NODE_ENV === "production" ? 'deploy' : 'json';
const walletMnemonic = Wallet.fromMnemonic(mnemonic, path).connect(provider);
var signer;
if (process.env.NODE_ENV === 'production') {
  signer = walletMnemonic;
} else {
  signer = provider.getSigner();
}

const options = { gasPrice: 1000000000, gasLimit: 85000000 };

async function connect(contractName) {
  const location = __dirname + `/../contracts/${folder}/` + contractName + ".json";
  const contractJSON = JSON.parse(fs.readFileSync(location)); // .json
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
}

async function runTests() {
  await this.coreValidator.createGroup("asdf", 1);
  const sig_check_proof_json = JSON.parse(
    fs.readFileSync("json/sigCheckProof.json")
  );
  const sig_check_public_json = JSON.parse(
    fs.readFileSync("json/sigCheckPublic.json")
  );
  const hash_proof_json = JSON.parse(
    fs.readFileSync("json/sigCheckProof.json")
  );
  const hash_public_json = JSON.parse(
    fs.readFileSync("json/sigCheckPublic.json")
  );
  const pollName = "myPoll";
  const answerValid = await this.coreValidator.verifyAndStoreRegistration(
    ...callArgsFromProofAndSignals(hash_proof_json, hash_public_json),
    ...callArgsFromProofAndSignals(sig_check_proof_json, sig_check_public_json),
    pollName
  );

  const addedMessage = await this.coreValidator.verifyAndAddMessage(
    ...callArgsFromProofAndSignals(hash_proof_json, hash_public_json),
    "message"
  );
  const isRegistered = await this.coreValidator.checkIfHashRegisteredForPoll(
    pollName,
    hash_public_json[0]
  );
  assert(isRegistered == 1); // Pass
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function randpassword() {
  return Math.floor(Math.random() * 100000000000);
}

const processProof = (snarkProof, publicSignals) => {
  return [
    snarkProof.pi_a.slice(0, 2), // pi_a
    [
      snarkProof.pi_b[0].slice(0).reverse(),
      snarkProof.pi_b[1].slice(0).reverse(),
    ], // pi_b
    snarkProof.pi_c.slice(0, 2), // pi_c
    publicSignals.map((signal) => signal.toString(10)), // input
  ];
};

async function postHash(hash: string) {
  try {
    const contract = await connect('Core');
    await contract.postHash(hash);
  } catch (error) {
    console.log(`postHash Failed: ${error}`);
  }
}

async function buyToken(hash: string) {
  try {
    const contract = await connect('Core');
    await contract.buyToken(hash);
    // sending eth
  } catch (error) {
    console.log(`buyToken Failed: ${error}`);
  }
}

async function redeem(tokenId, proof, publicSignals) {
  try {
    const contract = await connect('Core');
    const proofAsCircuitInput = processProof(
      proof,
      publicSignals.map(x => modPBigIntNative(x))
    );
    await contract.redeem(...proofAsCircuitInput, tokenId); 
  } catch (error) {
    console.log(`redeem Failed: ${error}`);
  }
}

exports = {
  postHash,
  buyToken,
  redeem
};
