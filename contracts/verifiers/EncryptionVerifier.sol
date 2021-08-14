//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.6; // >=0.5.16 <=
pragma experimental ABIEncoderV2;
import "./Pairing.sol";

library EncryptionVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            19642524115522290447760970021746675789341356000653265441069630957431566301675,
            15809037446102219312954435152879098683824559980020626143453387822004586242317
        );

        vk.beta2 = Pairing.G2Point(
            [6402738102853475583969787773506197858266321704623454181848954418090577674938,
             3306678135584565297353192801602995509515651571902196852074598261262327790404],
            [15158588411628049902562758796812667714664232742372443470614751812018801551665,
             4983765881427969364617654516554524254158908221590807345159959200407712579883]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [11078114351411396302492606863995638386506537365844689646898417550998267219414,
             2528491300866434509699704412642731178102268865012248785813458721505586631446],
            [7646900014588577959937375249841784560277351960820231527167492175864420231155,
             17448560587075395769884970409122010185777125947946128673908172602768905142360]
        );
        vk.IC = new Pairing.G1Point[](6);
        
        vk.IC[0] = Pairing.G1Point( 
            6696830915188811222805337860434242118015796195504552362503772065564241004793,
            14168315932310402745458233483865755546062824270218045859290041083862651822454
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            12825695449222102458107202619290306302498842450161295807600628974902327329523,
            12674690686533547212082419332699424747516844528424786610448189399297672267984
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            17879919804316531427524842358680420614921010653303956586198382587838944672273,
            21761812114738150671276896348580093737824324064927865099222972980718725490128
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            3752775423249653345951175014578820283443843094443934292703590427117777407200,
            19225162483163668934700843843644137964321573897488263481197966018672771705235
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            13116752893921034560348126282679915303501261626202282210808233325523938302596,
            8014465560771828168190678410134247897388632687630536200036146352367517129204
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            6268772482625100927397258823484197390170769634851849637235756810655726976365,
            18548977206527417647915185397219583535313858552278826900129808792864343191398
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[5] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
