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
import './Pairing.sol';

library BlurImageVerifier {
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
        vk.IC = new Pairing.G1Point[](17);
        
        vk.IC[0] = Pairing.G1Point( 
            958215222914161618873825103185372215026838545968156774716357960503686314557,
            3500820067651827131995688475763381322325211027491424140037839057865686383226
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            19942935124957785877362020491700359795314202127431915277889949617996181854138,
            13478521773634753619109581133276836487290729962669640923128602144591970677013
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            6305117901711020411146101494260028934369090743408413027881700364463346568954,
            17416903574922942694190226364008716046743505811425067011834407956166044396946
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            7827722157241208047580751963594343058696313093924344242819515389682634942979,
            13633870735570360033953272128220557273846241922255859195669508760095811616333
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            4014726167124588842691141863111838230532725269366126200291849120121440624168,
            3354709966304741834109464759214643585907533567329450295933664829357926460681
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            8984380022794842931164561782175557142493139297332939596135967267147296961891,
            19864299261533508731871470177507749129603009015598882923523181848059312766729
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            6483343358062870405072437696951486914956356365168287717850941940463780347078,
            797018863055164713177496348735511201719430118872713661430856724216306374050
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            16031644243526579157446561611486528384277955157612249824056536251441259569981,
            12696047070094896760776867449931863895599299738636952612577354445057524973582
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            16052862063589886116392225104791299426264760280877782864393594378406645724120,
            21185645511330666483825534591747222377045655490973267257357229790058777861977
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            18650476750607448122231904664933816976146493876857314314070053769117168559525,
            14478586143497321462594198997682687697769869518604224735249437102678333661650
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            19373597890753116559508970307182205993737586716273528655231724892083176571555,
            11414891939459825431804216075003348282216119964554968500179865841251552594514
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            1855625083643755336412549977731865588687312134370857393651298645667274684275,
            15903555879069478903238070309022982645329908437696884872534207387157695945865
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            21187785454514998440583141992401308414206183329621485271133715199650629961752,
            17104044952426806929599744976712129658349384905452340032364427813446674952073
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            9034822778992578150860896595439337533735986840720214954564473268543473330724,
            1327166458599124406029364114495110361981559712177347991197586294758160777866
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            20087989645302522737721944175768708811573186340031616531715317166781923374514,
            804962914893193664060329574982285473839227412143052083163652127038650112837
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            3205323012446762087712057518828484896230495470452620361490476958263117145708,
            4303568373391662626566463756497858423691406741565401052468668526968575161817
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            4605900633472127255221618471035897089680352664997231072451565404112239159594,
            2113143197224402788411764240003040929274419759705825607686458765812395200726
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
            uint[16] memory input
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
