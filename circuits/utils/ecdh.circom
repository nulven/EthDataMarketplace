include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";


template Ecdh() {
  // Note: private key
  // Needs to be hashed, and then pruned before
  // supplying it to the circuit
  signal private input private_key;
  signal input public_key[2];

  signal output shared_key;

  var n = 250

  component privBits = Num2Bits(n);
  privBits.in <== private_key;

  component mulFix = EscalarMulAny(n);
  mulFix.p[0] <== public_key[0];
  mulFix.p[1] <== public_key[1];

  for (var i = 0; i < n; i++) {
    mulFix.e[i] <== privBits.out[i];
  }

  shared_key <== mulFix.out[0];
}
