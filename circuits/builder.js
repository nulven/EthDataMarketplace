require("dotenv").config();

const { execSync } = require("child_process");
const fs = require("fs");

const wasmOutPath = process.argv[2];
const zkeyOutPath = process.argv[3];
const deterministic = process.argv[4] === "true";
const circuitsList = process.argv[5];
let potFile = process.argv[6];

// TODO: add an option to generate with entropy for production keys

if (process.argv.length !== 7) {
  console.log("usage");
  console.log(
    "builder comma,seperated,list,of,circuits wasm_out_path zkey_out_path [`true` if deterministic / `false` if not] pot_size \n for example, $ node circuits/builder.js . . false sig-check 20"
  );
  process.exit(1);
}

if (!potFile) {
  potFile = "15";
}

const cwd = process.cwd();

for (circuitName of circuitsList.split(",")) {
  if (deterministic && !process.env["beacon"]) {
    console.log("ERROR! Can't find a sourced .env with a beacon variable");
    process.exit(1);
  }

  process.chdir(cwd + "/circuits/" + circuitName);

  // doesnt catch yet
  // https://github.com/iden3/snarkjs/pull/75
  try {
    execSync("npx circom circuit.circom --r1cs --wasm --sym", {
      stdio: "inherit",
    });
    execSync("npx snarkjs r1cs info circuit.r1cs", { stdio: "inherit" });
    execSync(
      'npx snarkjs zkey new circuit.r1cs "' +
        __dirname +
        "/pots/pot" +
        potFile +
        '_final.ptau" circuit_' +
        circuitName +
        ".zkey",
      { stdio: "inherit" }
    );
    if (deterministic) {
      execSync(
        "npx snarkjs zkey beacon circuit_" +
          circuitName +
          ".zkey circuit.zkey " +
          process.env["beacon"] +
          " 10",
        { stdio: "inherit" }
      );
    } else {
      execSync(
        "npx snarkjs zkey contribute circuit_" +
          circuitName +
          ".zkey circuit.zkey " +
          `-e="${Date.now()}"`,
        { stdio: "inherit" }
      );
    }
    execSync(
      "npx snarkjs zkey export verificationkey circuit.zkey verification_key.json",
      { stdio: "inherit" }
    );
    execSync(
      "npx snarkjs wtns calculate circuit.wasm input.json witness.wtns",
      {
        stdio: "inherit",
      }
    );
    execSync(
      "npx snarkjs groth16 prove circuit.zkey witness.wtns proof.json public.json",
      { stdio: "inherit" }
    );
    execSync(
      "npx snarkjs groth16 verify verification_key.json public.json proof.json",
      { stdio: "inherit" }
    );
    execSync("mkdir -p ../circuits-compiled/" + circuitName, {
      stdio: "inherit",
    });
    execSync("mkdir -p ../keys/" + circuitName, { stdio: "inherit" });
    fs.copyFileSync(
      "circuit.wasm",
      cwd + "/circuits/" + wasmOutPath + "/" + circuitName + "/circuit.wasm"
    );
    fs.copyFileSync(
      "circuit.zkey",
      cwd +
        "/circuits/" +
        zkeyOutPath +
        "/" +
        circuitName +
        "/circuit_final.zkey"
    );
    fs.copyFileSync(
      "verification_key.json",
      cwd +
        "/circuits/" +
        zkeyOutPath +
        "/" +
        circuitName +
        "/verification_key.json"
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
