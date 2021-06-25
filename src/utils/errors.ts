class CustomError extends Error {
  constructor(json: { name: string, message: string }) {
    super(json.message);
    this.name = json.name;
  }
}

enum Errors {
}

const ErrorNames = {
};

const ErrorMessages = {
};

function createErrors(): Record<Errors, (any) => CustomError> {
  const errors = {};
  for (const error in Errors) {
    errors[error] = (...args) => {
      new CustomError({
        name,
        message: ErrorMessages[error](...args),
      });
    };
  }
  // @ts-ignore
  return errors;
}

export default createErrors();
