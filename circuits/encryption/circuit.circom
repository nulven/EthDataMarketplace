include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/bitify.circom"

include "../utils/encrypt.circom";
include "../utils/ecdh.circom";

template Main() {
  signal private input key;
  signal private input private_key;
  signal input public_key[2];
  signal output hash;
  signal output out[2];

  component mimc = MultiMiMC7(1, 91);
  mimc.in[0] <== key;
  mimc.k <== 0;
  mimc.out ==> hash;

  // encrypt preimage
  component ecdh = Ecdh();
  signal shared_key;

  ecdh.private_key <== private_key;
  ecdh.public_key[0] <== public_key[0];
  ecdh.public_key[1] <== public_key[1];

  shared_key <== ecdh.shared_key;

  component encrypt = Encrypt();
  encrypt.plaintext <== key;
  encrypt.shared_key <== shared_key;
  out[0] <== encrypt.out[0];
  out[1] <== encrypt.out[1];
}

component main = Main();
