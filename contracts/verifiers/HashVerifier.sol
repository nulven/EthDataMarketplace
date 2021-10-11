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

library HashVerifier {
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
            6649706228940092214024537715615750974782507177962522143585713102098252140507,
            8600012682628506602820352378092933216847589691662499915982120618606494269693
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            11890359990516516306620937012547994802495225911011046267065388026614930788971,
            7640518447137566552605716762042533071088153492924720917575059134719958960794
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            13240033539492298308581903484700265342341622504201213204034038067339035592231,
            2085478624939869822204404203546372376628476589570140288168203331015267633255
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            17074828529152127823096532362911641732470042415519965643143486759850463393976,
            19176684664061417791363598996003389146087993907369817080564093102545749703925
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            3487870124006761499757286140356040193039885261060458946754054319861912246688,
            14227488130452521732880752674651927713352840101996664468289157682022926222454
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            17243644912270822364454898995391259659202910174472139797545967979755313574588,
            18321263016295783859814954531795102538581144887377749037991635164191301750260
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
