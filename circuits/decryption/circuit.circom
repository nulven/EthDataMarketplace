include "../ecdh.circom";
include "../encrypt.circom";

template Main() {
  var N=10;
  signal private input message[N+1];
  signal private input private_key;
  signal input public_key[2];
  signal output out[N];

  // decrypt message
  component ecdh = Ecdh();
  signal shared_key;

  ecdh.private_key <== private_key;
  ecdh.public_key[0] <== public_key[0];
  ecdh.public_key[1] <== public_key[1];

  shared_key <== ecdh.shared_key;

  component decrypt = Decrypt(N);
  for (var i=0; i<N+1; i++) {
    decrypt.message[i] <== message[i];
  }
  decrypt.shared_key <== shared_key;

  for(var i=0; i<N; i++) {
    out[i] <== decrypt.out[i];
  }
}

component main = Main();
