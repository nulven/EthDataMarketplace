include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/bitify.circom"

include "../utils/encrypt.circom";
include "../utils/ecdh.circom";

template Main() {
  signal private input key;
  signal private input seller_private_key;
  signal input buyer_public_key[2];
  signal output hash;
  signal output out[2];

  component mimc = MultiMiMC7(1, 91);
  mimc.in[0] <== key;
  mimc.k <== 0;
  mimc.out ==> hash;

  // encrypt preimage
  component ecdh = Ecdh();

  ecdh.private_key <== seller_private_key;
  ecdh.public_key[0] <== buyer_public_key[0];
  ecdh.public_key[1] <== buyer_public_key[1];

  signal shared_key;
  shared_key <== ecdh.shared_key;

  component encrypt = Encrypt();
  encrypt.plaintext <== key;
  encrypt.shared_key <== shared_key;
  out[0] <== encrypt.out[0];
  out[1] <== encrypt.out[1];

  /*
  component decrypt = Decrypt();
  decrypt.message[0] <== out[0];
  decrypt.message[1] <== out[1];
  decrypt.shared_key <== shared_key;
  signal output m;
  m <== decrypt.out;
  */
}

component main = Main();
