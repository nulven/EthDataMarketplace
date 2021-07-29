class CustomError extends Error {
  constructor(json: { name: string, message: string }) {
    super(json.message);
    this.name = json.name;
  }
}

enum Errors {
  HashIsPosted = 'HashIsPosted',
  EthIsRedeemed = 'EthIsRedeemed',
  CiphertextNotReady = 'CiphertextNotReady',
  InvalidProof = 'InvalidProof',
  IncorrectHash = 'IncorrectHash',
  IncorrectPublicKey = 'IncorrectPublicKey',
  SolidityError = 'SolidityError',
  PropertyDoesNotExist = 'PropertyDoesNotExist',
}

const ErrorNames = {
  [Errors.HashIsPosted]: 'HASH_IS_POSTED',
  [Errors.EthIsRedeemed]: 'ETH_IS_REDEEMED',
  [Errors.CiphertextNotReady]: 'CIPHERTEXT_NOT_READY',
  [Errors.InvalidProof]: 'INVALID_PROOF',
  [Errors.IncorrectHash]: 'INCORRECT_HASH',
  [Errors.IncorrectPublicKey]: 'INCORRECT_PUBLIC_KEY',
  [Errors.PropertyDoesNotExist]: 'PROPERTY_DOES_NOT_EXIST',
  [Errors.SolidityError]: 'SOLIDITY_ERROR',
};

const ErrorMessages = {
  [Errors.HashIsPosted]: () => 'The hash has already been posted.',
  [Errors.EthIsRedeemed]:
    () => 'The Eth for this token has already been redeemed.',
  [Errors.CiphertextNotReady]:
    () => 'The Ciphertext for this token has not been posted yet.',
  [Errors.InvalidProof]: () => 'Invalid ZK proof.',
  [Errors.IncorrectHash]: () => 'Proof created using the incorrect hash.',
  [Errors.IncorrectPublicKey]:
    () => 'Proof created using the incorrect public key.',
  [Errors.PropertyDoesNotExist]: () => 'Property does not exist.',
  [Errors.SolidityError]: (error: string) => `Solidity error: ${error}`,
};

const SolidityErrors = {
  'revert Hash already posted': Errors.HashIsPosted,
  'revert ETH already redeemed': Errors.EthIsRedeemed,
  'revert Ciphertext not posted yet': Errors.CiphertextNotReady,
  'revert Proof invalid!': Errors.InvalidProof,
  'revert Incorrect hash': Errors.IncorrectHash,
  'revert Used wrong public key': Errors.IncorrectPublicKey,
  'revert Property does not exist': Errors.PropertyDoesNotExist,
};

function createErrors(): Record<Errors, (any) => CustomError> {
  const errors = {};
  for (const error in Errors) {
    errors[error] = (...args) => {
      return new CustomError({
        name: ErrorNames[error],
        message: ErrorMessages[error](...args),
      });
    };
  }
  // @ts-ignore
  return errors;
}

const OurErrors = createErrors();

export {
  OurErrors,
  SolidityErrors,
};
