include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../ecdh.circom";
include "../../node_modules/circomlib/circuits/bitify.circom"

include "../encrypt.circom";

template Main() {
  signal private input x;
  signal private input y;
  signal private input key;
  signal input hash;
  signal input salt;
  signal output key_hash;
  signal output ciphertext[3];

  // hash of key
  component mimcKey = MultiMiMC7(1, 91);
  mimcKey.in[0] <== key;
  mimcKey.k <== 0;
  key_hash <== mimcKey.out;

  // proof of property (hash)
  component mimc = MiMCSponge(2, 220, 1);
  mimc.ins[0] <== x;
  mimc.ins[1] <== y;
  mimc.k <== salt;
  mimc.outs[0] === hash;

  // encryption of message
  component encrypt = EncryptBits(2);
  encrypt.plaintext[0] <== x;
  encrypt.plaintext[1] <== y;
  encrypt.shared_key <== key;
  ciphertext[0] <== encrypt.out[0];
  ciphertext[1] <== encrypt.out[1];
  ciphertext[2] <== encrypt.out[2];

}

component main = Main();
