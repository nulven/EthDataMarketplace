# EthDataMarketplace

## How it works

1. Creator generates a (property) SNARK proof which:
 - asserts they have some content which satisfies a particular property (`f(data) = property`)
 - outputs the encryption of the data with a randomly generated key (`Enc(key, pk)`)
 - outputs the hash of the randomly generated key (`H(key)`)
2. The creator publishes the proof on IPFS and registers the IPFS URI and the key hash on a smart contract
3. Using the IPFS URI on the contract, the buyer sees the property and verifies that:
  - the (property) proof is valid
  - the output key hash in the proof matches the key hash stored on the contract (if this is unchecked the creator could maliciously submit two different keys to the smart contract and the (property) proof, so the buyer won't be able to successfully retrieve the content)
4. if valid, the buyer will purchase the token and lock ETH in the contract
5. the creator will generate an (encryption) proof which:
  - asserts that they have the preimage to the key hash stored on the contract (`H(preimage) = H(key)`)
  - outputs the encryption of the preimage with the buyer's public key (`Enc(preimage, pk)`)
if the proof is valid, the ETH is redeemed from the contract

6. the buyer retrieves the encrypted key (`Enc(key, pk)`) from the contract computes
  - `Dec(Enc(key, pk), sk) => key`
  - `Dec(Enc(data, key), key) => data`

## Circuits

### Encryption Proof

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

#### hash

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


## Adding content
