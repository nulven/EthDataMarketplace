# EthDataMarketplace

## How it works

1. Creator generates a [Property Proof](### Property Proofs) which:
   - asserts they have some content which satisfies a particular property (`f(data) = property`)
   - outputs the encryption of the data with a randomly generated key (`Enc(key, pk)`)
   - outputs the hash of the randomly generated key (`H(key)`)
2. The creator publishes the proof on IPFS and registers the IPFS URI and the key hash on a smart contract
3. Using the IPFS URI on the contract, the buyer sees the property and verifies that:
   - the [Property Proof](### Property Proofs) is valid
   - the output key hash in the proof matches the key hash stored on the contract (if this is unchecked the creator could maliciously submit two different keys to the smart contract and the [Property Proof](### Property Proofs), so the buyer won't be able to successfully retrieve the content)
4. if valid, the buyer will purchase the token and lock ETH in the contract
5. the creator will generate an [Encryption Proof](### Encryption Proof) which:
   - asserts that they have the preimage to the key hash stored on the contract (`H(preimage) = H(key)`)
   - outputs the encryption of the preimage with the buyer's public key (`Enc(preimage, pk)`)
if the proof is valid, the ETH is redeemed from the contract

6. the buyer retrieves the encrypted key (`Enc(key, pk)`) from the contract computes
   - `Dec(Enc(key, pk), sk) => key`
   - `Dec(Enc(data, key), key) => data`

## Circuits

The circuits are divided into two types [Encryption Proofs](### Encryption Proof) and [Property Proofs](### Property Proofs). The *Encryption Proof* is the proof sent over the contract by the seller to verify the decryption key exchange. The *Property Proofs* are the proofs published on IPFS by the seller to commit to the property of the content.

### Encryption Proof

The proof sent by the seller in step 5, which
   - asserts that they have the preimage to the key hash stored on the contract (`H(preimage) = H(key)`)
   - outputs the encryption of the preimage with the buyer's public key (`Enc(preimage, pk)`)

#### encryption

##### Inputs
| signal | private | type | description |
|-|-|-|-|
| key | true | BigInt | |
| private_key | true | BigInt | |
| hash | false | BigInt | |
| public_key | false | Array[2] | |

##### Outputs
| signal | type | description |
|-|-|-|
| out | Array[2] | |

### Property Proofs

The proof published by the seller on IPFS in step 1-2, which
   - asserts they have some content which satisfies a particular property (`f(data) = property`)
   - outputs the encryption of the data with a randomly generated key (`Enc(key, pk)`)
   - outputs the hash of the randomly generated key (`H(key)`)

Below are possible properties that can be committed and verified.

#### hash

Commits the MiMC hash of the content.
```f(data) = H(data)```

##### Inputs
| signal | private | type | description |
|-|-|-|-|
| preimage | true | BigInt | |
| key | true | BigInt | |
| hash | false | BigInt | |
| salt | false | BigInt | |

##### Outputs
| signal | type | description |
|-|-|-|
| key_hash | BigInt | |
| ciphertext | Array[2] | |

#### dark-forest

Commits the MiMC hash of the `x` and `y` coordinates of a Dark Forest planet.

##### Inputs
| signal | private | type | description |
|-|-|-|-|
| x | true | BigInt | |
| y | true | BigInt | |
| key | true | BigInt | |
| hash | false | BigInt | |
| salt | false | BigInt | |

##### Outputs
| signal | type | description |
|-|-|-|
| key_hash | BigInt | |
| ciphertext | Array[3] | |

#### blur-image

Commits the XOR of a bitmap with a `key`.

> Note: Obviously, this means the property is nothing more than a random bitmap that is non-unique to the content and  doesn't give any indication to the buyer of what they are purchasing. This was made as a quick example of another property and an early attempt at proving a property of an image. Hopefully, this can be improved in the future to be more applicable.

##### Inputs
| signal | private | type | description |
|-|-|-|-|
| preimage | true | Array[N] | |
| key | true | BigInt | |
| blurred_image | false | Array[N] | |

##### Outputs
| signal | type | description |
|-|-|-|
| hash | BigInt | |
| computed_image | Array[N] | |
