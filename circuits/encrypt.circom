include "../node_modules/circomlib/circuits/mimc.circom"

template Encrypt(N) {
  signal private input plaintext[N];
  signal input shared_key;
  signal output out[N+1];

  component mimc = MultiMiMC7(N, 91);
  for (var i=0; i<N; i++) {
    mimc.in[i] <== plaintext[i];
  }
  mimc.k <== 0;
  out[0] <== mimc.out;

  component hasher[N];
  for(var i=0; i<N; i++) {
    hasher[i] = MiMC7(91);
    hasher[i].x_in <== shared_key;
    hasher[i].k <== out[0] + i;
    out[i+1] <== plaintext[i] + hasher[i].out; 
  }
}


template Decrypt(N) {
  signal input message[N+1];
  signal input shared_key;
  signal output out[N];

  component hasher[N];

  // iv is message[0]
  for(var i=0; i<N; i++) {
    hasher[i] = MiMC7(91);
    hasher[i].x_in <== shared_key;
    hasher[i].k <== message[0] + i;
    out[i] <== message[i+1] - hasher[i].out;
  }
}
