import { Snark, Stark, ZKTypes } from '../types';

interface InputProps {
  preimage: string;
  setPreimage: (value: string) => void;
}

interface DisplayProps {
  property: any;
  message?: any;
}

interface ContentSkeleton {
  display: (props: DisplayProps) => JSX.Element;
  input: (props: InputProps) => JSX.Element;
  list: (props: DisplayProps) => JSX.Element;
  decrypt: (zk: ZKTypes, ciphertext: any, key: BigInt) => any;
  computeProperty: (preimage: any, key?: BigInt) => any[];
  prover: Record<ZKTypes, (args: any[]) => Promise<Snark | Stark>>;
  verifier: Record<ZKTypes, (proof: Snark | Stark) => Promise<boolean>>;
  assertProofInputs: (args: any[]) => void;
  assertContent: (content: any) => void;
  assertMessage: (message: any) => void;
}

export {
  InputProps,
  ContentSkeleton,
};
