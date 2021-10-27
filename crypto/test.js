const BN = require('bn.js');
const hash = require('hash.js');
const { curves: eCurves, ec: EllipticCurve } = require('elliptic');
const assert = require('assert');
const { constantPoints, pedersen } = require('./signature.js');

const LOW_PART_BITS = 248
const LOW_PART_MASK = 2**248-1
const N_ELEMENT_BIT_HASH = 250;
function processSingleElement(element, p1, p2) {
  const highNibble = element >> LOW_PART_BITS;
  console.log(p1);
  const lowPart = element & LOW_PART_MASK;
  return lowPart * p1 + highNibble * p2;
}

const shiftPoint = constantPoints[0];
const P_0 = constantPoints[2]
const P_1 = constantPoints[2 + LOW_PART_BITS]
const P_2 = constantPoints[2 + N_ELEMENT_BIT_HASH]
const P_3 = constantPoints[2 + N_ELEMENT_BIT_HASH + LOW_PART_BITS]

console.log(BigInt(`0x${pedersen([BigInt(1), BigInt(2)])}`));
