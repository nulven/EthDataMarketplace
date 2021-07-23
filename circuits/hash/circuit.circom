include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../ecdh.circom";
include "../../node_modules/circomlib/circuits/bitify.circom"

include "../encrypt.circom";

template Main() {
  signal private input pre_image;
  signal private input key;
  signal input hash;
  signal output key_hash;
  signal output ciphertext[2];

  // hash of key
  component mimcKey = MultiMiMC7(1, 91);
  mimcKey.in[0] <== key;
  mimcKey.k <== 0;
  key_hash <== mimcKey.out;

  // proof of property (hash)
  component mimc = MultiMiMC7(1, 91);
  mimc.in[0] <== pre_image;
  mimc.k <== 0;
  mimc.out === hash;

  // encryption of message
  component encrypt = Encrypt();
  encrypt.plaintext <== pre_image;
  encrypt.shared_key <== key;
  ciphertext[0] <== encrypt.out[0];
  ciphertext[1] <== encrypt.out[1];

}

component main = Main();
