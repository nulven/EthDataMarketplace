include "../utils/ecdh.circom"

template Main() {
  signal private input private_key;
  signal private input public_key[2];
  signal output out;

  component ecdh = Ecdh();

  ecdh.private_key <== private_key;
  ecdh.public_key[0] <== public_key[0];
  ecdh.public_key[1] <== public_key[1];

  out <== ecdh.shared_key;
}

component main = Main();
