module.exports = {
  verbose: false,
  silent: false,
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  roots: ['test/'],
  testTimeout: 100000000,
};
