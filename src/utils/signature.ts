import BN from 'bn.js';
import hash from 'hash.js';
import { curves as eCurves, ec as EllipticCurve } from 'elliptic';
import assert from 'assert';
import constantPointsHex from './constant_points.json';

// Equals 2**251 + 17 * 2**192 + 1.
const prime = new BN('800000000000011000000000000000000000000000000000000000000000001', 16);
// Equals 2**251. This value limits msgHash and the signature parts.
const maxEcdsaVal =
    new BN('800000000000000000000000000000000000000000000000000000000000000', 16);

// Generate BN of used constants.
const zeroBn = new BN('0', 16);
const oneBn = new BN('1', 16);
const twoBn = new BN('2', 16);
const twoPow22Bn = new BN('400000', 16);
const twoPow31Bn = new BN('80000000', 16);
const twoPow63Bn = new BN('8000000000000000', 16);

// Create a curve with stark curve parameters.
const starkEc = new EllipticCurve(
    new eCurves.PresetCurve({
        type: 'short',
        prime: null,
        p: prime,
        a: '00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000001',
        b: '06f21413 efbe40de 150e596d 72f7a8c5 609ad26c 15c915c1 f4cdfcb9 9cee9e89',
        n: '08000000 00000010 ffffffff ffffffff b781126d cae7b232 1e66a241 adc64d2f',
        hash: hash.sha256,
        gRed: false,
        g: constantPointsHex[1]
    })
);

const constantPoints = constantPointsHex.map(coords => (
    starkEc.curve.point(new BN(coords[0], 16), new BN(coords[1], 16))));
const shiftPoint = constantPoints[0];


const EC_ORDER = 3618502788666131213697322783095070105526743751716087489154079457884512865583;

function getRandomPrivateKey() {
  return BigInt(Math.random() * (EC_ORDER - 1));
}

function privateKeyToECPointOnStarkCurve(privateKey) {
  return constantPoints[1].mul(new BN(privateKey, 10));
}

export function genKeypair() {
  const privKey = getRandomPrivateKey();
  const pubKey = privateKeyToECPointOnStarkCurve(privKey);
  return { privKey, pubKey };
}

export function genSharedKey() {
  const key1 = genKeypair();
  const key2 = genKeypair();
  return computeSharedKey(key1.privKey, key2.pubKey);
}

export function computeSharedKey(privateKey, publicKey) {
  const publicKeyPoint = starkEc.curve.point(new BN(publicKey[0], 10), new BN(publicKey[1], 10))
  return publicKeyPoint.mul(new BN(privateKey, 10)).getX().toString(10);
}

export function pedersen(input) {
    let point = shiftPoint;
    for (let i = 0; i < input.length; i++) {
        let x = new BN(input[i], 16);
        assert(x.gte(zeroBn) && x.lt(prime), 'Invalid input: ' + input[i]);
        for (let j = 0; j < 252; j++) {
            const pt = constantPoints[2 + i * 252 + j];
            assert(!point.getX().eq(pt.getX()));
            if (x.and(oneBn).toNumber() !== 0) {
                point = point.add(pt);
            }
            x = x.shrn(1);
        }
    }
    return point.getX().toString(16);
}
