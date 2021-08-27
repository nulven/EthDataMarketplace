const { execSync } = require('child_process');

const circuitName = process.argv[2];


execSync(`cairo-compile ./cairo/${circuitName}/circuit.cairo --output ./cairo/${circuitName}/output.json`, {
  stdio: 'inherit',
});
execSync(`cairo-run \ --program=./cairo/${circuitName}/output.json --print_output \ --layout=all --program_input=./cairo/${circuitName}/input.json`, {
  stdio: 'inherit',
});
