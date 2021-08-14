include "../../node_modules/circomlib/circuits/bitify.circom"
include "../../node_modules/circomlib/circuits/mimc.circom"

template Main() {
  var N = 16;
  signal private input preimage[N];
  signal private input key;
  signal input blurred_image[N];
  signal output hash;
  signal output computed_image[N];

  // hash of key
  component mimc = MultiMiMC7(1, 91);
  mimc.in[0] <== key;
  mimc.k <== 0;
  hash <== mimc.out;

  // proof of property & encryption of message (blur)
  component num2bits = Num2Bits(256);
  num2bits.in <== key;
  signal key_bits[N];
  for (var i=0; i<N; i++) {
    key_bits[i] <== num2bits.out[i];
  }

  for (var i=0; i<N; i++) {
    computed_image[i] <-- (preimage[i] == key_bits[i]) ? 0 : 1;
    computed_image[i] === blurred_image[i];
  }
}

component main = Main();
