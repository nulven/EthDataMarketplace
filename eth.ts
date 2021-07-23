import EthConnection;


function retrieveCiphertext(publicKey: BigInt[], property: string, snark: Snark) {
  const privKey = new PrivKey(EthConnection.privateKey);
  const pubKey = new PubKey(publicKey);
  const sharedKey = Keypair.genEcdhSharedKey(privKey, pubKey);

  const _key = decryptKeyCiphertext(_keyCiphertext, sharedKey);
  setKey(_key);

  const { publicSignals } = snark;
  if (property === ContentProperties.HASH) {
    const _hashCiphertext = {
      iv: BigInt(publicSignals[1]),
      data: [BigInt(publicSignals[2])],
    };
    return _hashCiphertext;
  } else if (property === ContentProperties.BLUR) {
    const _blurredImage = publicSignals.slice(1, 17).map(Number);
    return _blurredImage;
  }
}
