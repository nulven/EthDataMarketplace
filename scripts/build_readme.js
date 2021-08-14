const fs = require('fs');

const circuitName = process.argv[2];

const readme = fs.readFileSync('./README.md').toString();
const sections = readme.split('\n## ').map((_, index) => {
  if (index !== 0) {
    return `## ${_}`;
  } else {
    return _;
  }
});
const circuitsSection = sections.filter(_ => {
  return _.split('\n')[0] === '## Circuits';
})[0];

const circuit = fs.readFileSync(`./circuits/${circuitName}/circuit.circom`).toString();
const lines = circuit.split('\n').map(_ => {
  let firstChar;
  _.split('').forEach((char, index) => {
    if (char !== ' ' && typeof firstChar !== 'number') {
      firstChar = index;
    }
  });
  return _.slice(firstChar);
});
const signals = lines.filter(_ => _.slice(0, 6) === 'signal');
const inputs = [];
const outputs = [];
signals.forEach(_ => {
  const modifiers = _.split(' ');
  const variable = modifiers[modifiers.length-1];
  let type;
  let name;
  if (variable[variable.length-2] === ']') {
    const size = variable[variable.length-3];
    type = `Array[${size}]`;
    name = variable.slice(0, variable.length-4);
  } else {
    type = 'BigInt';
    name = variable.slice(0, variable.length-1);
  }
  switch (modifiers[1]) {
    case 'private':
      inputs.push({ name, 'private': true, type  });
      break;
    case 'input': 
      inputs.push({ name, 'private': false, type });
      break;
    case 'output': 
      return outputs.push({ name, type });
      break;
  }
});

const header = `#### ${circuitName}`;
const inputHeader = '##### Inputs';
const inputTableHeader = '| signal | private | type | description |\n|-|-|-|-|';
const inputTableBody = inputs.map(({ name, private, type }) => {
  return `| ${name} | ${private} | ${type} | |`;
}).join('\n');
const inputTable = `${inputTableHeader}\n${inputTableBody}`;
const outputHeader = '##### Outputs';
const outputTableHeader = '| signal | type | description |\n|-|-|-|';
const outputTableBody = outputs.map(({ name, type }) => {
  return `| ${name} | ${type} | |`;
}).join('\n');
const outputTable = `${outputTableHeader}\n${outputTableBody}`;
const inputsSubsection = `${inputHeader}\n${inputTable}`;
const outputsSubsection = `${outputHeader}\n${outputTable}`;
const circuitSubsection = `${header}\n\n${inputsSubsection}\n\n${outputsSubsection}\n\n\n`;
const subsection = `${circuitsSection}\n${circuitSubsection}`;
const newReadme = sections.map(_ => {
  if (_.split('\n')[0] === '## Circuits') {
    return subsection;
  } else {
    return _;
  }
}).join('\n');

fs.writeFileSync('./README.md', newReadme);
