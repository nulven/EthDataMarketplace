include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/bitify.circom"

include "../utils/encrypt.circom";
include "../utils/ecdh.circom";

template Main() {
  signal private input preimage;
  signal private input key;
  signal input hash;
  signal input salt;
  signal output key_hash;
  signal output ciphertext[2];

  // hash of key
  component mimcKey = MultiMiMC7(1, 91);
  mimcKey.in[0] <== key;
  mimcKey.k <== 0;
  key_hash <== mimcKey.out;

  // proof of property (hash)
  component mimc = MultiMiMC7(1, 91);
  mimc.in[0] <== preimage;
  mimc.k <== salt;
  mimc.out === hash;

  // encryption of message
  component encrypt = Encrypt();
  encrypt.plaintext <== preimage;
  encrypt.shared_key <== key;
  ciphertext[0] <== encrypt.out[0];
  ciphertext[1] <== encrypt.out[1];

}

component main = Main();
