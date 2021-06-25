include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../ecdh.circom";
include "../encrypt.circom";

template Main() {
  var N=10;
  signal private input pre_image[N];
  signal private input private_key;
  signal input hash;
  signal input public_key[2];
  signal output out[N+1];

  // verify preimage is correct
  component mimc = MultiMiMC7(N, 91);
  for(var i=0; i<N; i++) {
    mimc.in[i] <== pre_image[i];
  }
  mimc.k <== 0;

  mimc.out === hash;

  // encrypt preimage
  component ecdh = Ecdh();
  signal output shared_key;

  ecdh.private_key <== private_key;
  ecdh.public_key[0] <== public_key[0];
  ecdh.public_key[1] <== public_key[1];

  shared_key <== ecdh.shared_key;

  component encrypt = Encrypt(N);
  for (var i=0; i<N; i++) {
    encrypt.plaintext[i] <== pre_image[i];
  }
  encrypt.shared_key <== shared_key;

  for(var i=0; i<N+1; i++) {
    out[i] <== encrypt.out[i];
  }
}

component main = Main();
