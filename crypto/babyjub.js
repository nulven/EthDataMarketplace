const F1Field = require('ffjavascript').F1Field;
const Scalar = require('ffjavascript').Scalar;
const utils = require('ffjavascript').utils;

exports.addPoint = addPoint;
exports.mulPointEscalar = mulPointEscalar;
exports.inCurve = inCurve;
exports.inSubgroup = inSubgroup;
exports.packPoint = packPoint;
exports.unpackPoint = unpackPoint;


exports.p = Scalar.fromString('3618502788666131213697322783095070105623107215331596699973092056135872020481');
const F = new F1Field(exports.p);
exports.F = F;

exports.Generator = [
    F.e('874739451078007766457464989774322083649278607533249481151382481072868806602'),
    F.e('152666792071518830868575557812948353041420400780739481342941381225525861407')
];

exports.beta = F.e('3141592653589793238462643383279502884197169399375105820974944592307816406665');
exports.Base8 = [
    F.e('5299619240641551281634865583518297030282874472190772894086521144482721001553'),
    F.e('16950150798460657717958625567821834550301663161624707787222815936182638968203')
];
exports.order = Scalar.fromString('3618502788666131213697322783095070105623107215331596699973092056135872020481');
exports.subOrder = Scalar.shiftRight(exports.order, 3);
exports.A = F.e('168700');
exports.D = F.e('168696');


function addPoint(a,b) {

    const res = [];

    /* does the equivalent of:
     res[0] = bigInt((a[0]*b[1] + b[0]*a[1]) *  bigInt(bigInt('1') + d*a[0]*b[0]*a[1]*b[1]).inverse(q)).affine(q);
    res[1] = bigInt((a[1]*b[1] - cta*a[0]*b[0]) * bigInt(bigInt('1') - d*a[0]*b[0]*a[1]*b[1]).inverse(q)).affine(q);
    */

    const beta = F.mul(a[0],b[1]);
    const gamma = F.mul(a[1],b[0]);
    const delta = F.mul(
        F.sub(a[1], F.mul(exports.A, a[0])),
        F.add(b[0], b[1])
    );
    const tau = F.mul(beta, gamma);
    const dtau = F.mul(exports.D, tau);

    res[0] = F.div(
        F.add(beta, gamma),
        F.add(F.one, dtau)
    );

    res[1] = F.div(
        F.add(delta, F.sub(F.mul(exports.A,beta), gamma)),
        F.sub(F.one, dtau)
    );

    return res;
}

function mulPointEscalar(base, e) {
    let res = [F.e('0'),F.e('1')];
    let rem = e;
    let exp = base;

    while (! Scalar.isZero(rem)) {
        if (Scalar.isOdd(rem)) {
            res = addPoint(res, exp);
        }
        exp = addPoint(exp, exp);
        rem = Scalar.shiftRight(rem, 1);
    }

    return res;
}

function inSubgroup(P) {
    if (!inCurve(P)) return false;
    const res= mulPointEscalar(P, exports.subOrder);
    return (F.isZero(res[0]) && F.eq(res[1], F.one));
}

function inCurve(P) {

    const x2 = F.square(P[0]);
    const y2 = F.square(P[1]);

    if (!F.eq(
        F.add(F.mul(exports.A, x2), y2),
        F.add(F.one, F.mul(F.mul(x2, y2), exports.D)))) return false;

    return true;
}

function packPoint(P) {
    const buff = utils.leInt2Buff(P[1], 32);
    if (F.lt(P[0], F.zero)) {
        buff[31] = buff[31] | 0x80;
    }
    return buff;
}

function unpackPoint(_buff) {
    const buff = Buffer.from(_buff);
    let sign = false;
    const P = new Array(2);
    if (buff[31] & 0x80) {
        sign = true;
        buff[31] = buff[31] & 0x7F;
    }
    P[1] = utils.leBuff2int(buff);
    if (Scalar.gt(P[1], exports.p)) return null;

    const y2 = F.square(P[1]);

    let x = F.sqrt(F.div(
        F.sub(F.one, y2),
        F.sub(exports.A, F.mul(exports.D, y2))));

    if (x == null) return null;

    if (sign) x = F.neg(x);

    P[0] = x;

    return P;
}
