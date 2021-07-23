include "../../node_modules/circomlib/circuits/mimc.circom"
include "../ecdh.circom";
include "../../node_modules/circomlib/circuits/bitify.circom"

include "../encrypt.circom";

template Main() {
  signal private input private_key;
  signal private input key;
  signal input public_key[2];
  signal output ciphertext[2];
  signal output hash;

  // proof of correct key
  component mimc = MultiMiMC7(1, 91);
  mimc.in[0] <== key;
  mimc.k <== 0;
  hash <== mimc.out;

  // encryption of key
  signal shared_key;
  component ecdh = Ecdh();
  ecdh.private_key <== private_key;
  ecdh.public_key[0] <== public_key[0];
  ecdh.public_key[1] <== public_key[1];
  shared_key <== ecdh.shared_key;

  component encryptKey = Encrypt();
  encryptKey.plaintext <== key;
  encryptKey.shared_key <== shared_key;
  ciphertext[0] <== encryptKey.out[0];
  ciphertext[1] <== encryptKey.out[1];
}

component main = Main();
