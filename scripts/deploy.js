require('dotenv').config({ path: __dirname + '/../.env' });
const { ContractFactory, Contract, providers, Wallet } = require('ethers');
const { execSync } = require('child_process');
const linker = require('solc/linker');
const solc = require('solc');
const fs = require('fs');
const path = require('path');
const contracts = require('@darkforest_eth/contracts');

const isProd = process.env.NODE_ENV === 'production';
const projectId = process.env.INFURA_ID;
const privateKey = process.env.PRIVATE_KEY;
const eth_network = process.env.ETH_NETWORK;
const network_url = isProd ? `https://${eth_network}.infura.io/v3/${projectId}` : 'http://localhost:8545';
const provider = new providers.JsonRpcProvider(network_url);
const signer = isProd ?
  new Wallet(privateKey).connect(provider) : provider.getSigner();

const cwd = process.cwd();
const directory = path.resolve(`${cwd}/public/contracts`);

const folder = process.env.NODE_ENV === 'production' ?
  'prod' : 'dev';

async function deploy(fileName, constructors=[], libraries = []) {
  try {
    const file = getFile(`${fileName}.sol`);

    const input = {
      language: 'Solidity',
      sources: {
        [fileName]: {
          content: file,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };

    function getFile(name) {
      return fs.readFileSync(`./contracts/${name}`).toString();
    }

    function getModule(name) {
      return fs.readFileSync(`./node_modules/${name}`).toString();
    }

    function findImports(path) {
      if (path[0] === '@') {
        return { contents: getModule(path) };
      } else {
        return { contents: getFile(path) };
      }
    }

    const output = JSON.parse(
      solc.compile(JSON.stringify(input), { import: findImports })
    );
    if (output.errors.filter(x => x.type !== 'Warning').length > 0) {
      console.log(output.errors.filter(x => x.type !== 'Warning'));
      throw Error('Solidity error');
    }

    let files = Object.entries(output.contracts);
    files = files.filter(([name, object]) => {
      const filePath = name.split('/');
      const fileName = filePath[filePath.length - 1];
      return (name.slice(name.length-3) !== 'sol' ||
              libraries.includes(fileName.slice(0, fileName.length-4)));
    });
    const contracts = [];
    const deployedContracts = [];

    // flatten the solidity files so each contract is at depth 1
    files.forEach(([file, values]) => {
      contracts.push(...Object.entries(values));
    });

    // sort with libraries first and contract last,
    // so that it deploys the libraries first
    contracts.sort(
      (file1, file2) =>
        libraries.includes(file2[0]) - libraries.includes(file1[0])
    );
    const filteredContracts = contracts.filter(contract => libraries.includes(contract[0]) || contract[0] === fileName);
    const librariesAddresses = {};
    const linkReferences = {};

    for (contract of filteredContracts) {
      const deployedContract = await createContract(contract);
      deployedContracts.push(deployedContract);
    }

    async function createContract([name, contract]) {
      var bytecode = contract.evm.bytecode.object;
      const abi = contract.abi;

      // iterate through the link references
      Object.entries(contract.evm.bytecode.linkReferences).forEach(
        ([link, references]) => {
          Object.entries(references).forEach(([libraryName, [location]]) => {
            // get the hex placeholder in the bytecode from the reference
            const hex = bytecode.slice(
              location.start * 2 + 2,
              (location.start + location.length) * 2 - 2,
            );
            linkReferences[hex] = librariesAddresses[libraryName];
          });
        });
      bytecode = linker.linkBytecode(bytecode, linkReferences);

      try {
        const factory = await new ContractFactory(abi, bytecode, signer);
        let inputs = [];
        if (name === 'Core' || name === 'Getters') {
          inputs = [...constructors];
        }
        const contractObject = await factory.deploy(...inputs);
        librariesAddresses[name] = contractObject.address;

        execSync(`mkdir -p ${directory}/${folder}`, { stdio: 'inherit' });
        fs.writeFileSync(`${directory}/${folder}/${name}.json`,
          JSON.stringify({
            abi: abi,
            address: contractObject.address,
          }),
        );

        console.log(name, contractObject.address);
        return { name, bytecode, abi, address: contractObject.address };
      } catch (err) {
        console.log(err.message);
      }

    }

    const contractJSON = JSON.parse(fs.readFileSync(`${directory}/${folder}/${fileName}.json`).toString());

    return contractJSON;
  } catch (err) {
    console.log(`ERROR: ${err}`);
  }
}

const args = process.argv.slice(2);

switch (args[0]) {
  case 'Core':
    const contractJSON = require('../public/contracts/dev/DarkForestCore.json');
    let dfCoreContractAddress;
    if (process.env.NODE_ENV === 'production') {
      dfCoreContractAddress = contracts.CORE_CONTRACT_ADDRESS;
    } else {
      dfCoreContractAddress = contractJSON.address;
    }
    deploy(
      'Core',
      [
        '1141005542993923374493036937263227815234315019152226250678688752414333038841',
        '0xAB43bA48c9edF4C2C4bB01237348D1D7B28ef168',
      ],
      ['EncryptionVerifier', 'Pairing'],
    ).then(coreJSON => {
      deploy('Getters', [coreJSON.address], []);
    });
    break;
  case 'DarkForestCore':
    deploy('DarkForestCore',
      [],
      ['DarkForestUtils'],
    );
    break;
}
