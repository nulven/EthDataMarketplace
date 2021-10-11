import { ContentProperties, ZKTypes, Snark, Stark } from '../types';


const hashParser = (outputs): Output => {
  const _hash = BigInt(outputs[3]);
  const _ciphertext = {
    iv: BigInt(outputs[1]),
    data: [BigInt(outputs[2])],
  };

  return { contentProperty: _hash, ciphertext: _ciphertext };
};

const dfParser = (outputs): Output => {
  const _hash = BigInt(outputs[4]);
  const _ciphertext = {
    iv: BigInt(outputs[1]),
    data: [
      BigInt(outputs[2]),
      BigInt(outputs[3]),
    ],
  };
  return { contentProperty: _hash, ciphertext: _ciphertext };
};

const blurParser = (outputs): Output => {
  const _blurredImage =
    outputs.slice(1, 17).map(Number);
  return {
    contentProperty: _blurredImage,
    ciphertext: _blurredImage,
  };
};

interface Output {
  contentProperty: any;
  ciphertext: any;
}


const snarkParser =
  (parser: (outputs: BigInt[]) => Output) => (proof: Snark): Output => {
    return parser(proof.publicSignals);
  };

const starkParser = (parser: (proof: BigInt[]) => Output) => (proof: Stark) => {
  return parser(proof.programOutputs);
};

const SnarkParsers = {
  [ContentProperties.HASH]: snarkParser(hashParser),
  [ContentProperties.DF]: snarkParser(dfParser),
  [ContentProperties.BLUR]: snarkParser(blurParser),
};

const StarkParsers = {
  [ContentProperties.HASH]: starkParser(hashParser),
  [ContentProperties.DF]: starkParser(dfParser),
  [ContentProperties.BLUR]: starkParser(blurParser),
};

export const Parsers = {
  [ZKTypes.SNARK]: SnarkParsers,
  [ZKTypes.STARK]: StarkParsers,
};
