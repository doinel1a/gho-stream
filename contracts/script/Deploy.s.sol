// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { Script, console2 } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAToken } from "@aave/core-v3/contracts/interfaces/IAToken.sol";
import { MockAToken } from "src/mocks/MockAToken.sol";
import { AaveMiniMarket } from "src/AaveMiniMarket.sol";
import { console } from "forge-std/console.sol";

contract DeployScript is Script {
    address public deployer;

    IERC20 public WETH = IERC20(0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c);
    IERC20 public DAI = IERC20(0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357);
    IERC20 public USDC = IERC20(0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8);

    IERC20[] public tokens;
    IAToken[] public aTokens;

    function setUp() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.rememberKey(privateKey);

        tokens.push(WETH);
        tokens.push(DAI);
        tokens.push(USDC);
    }

    function run() public {
        vm.startBroadcast(deployer);
        aTokens.push(IAToken(address(new MockAToken("AWETH", "AWETH", 18))));
        aTokens.push(IAToken(address(new MockAToken("ADAI", "ADAI", 18))));
        aTokens.push(IAToken(address(new MockAToken("AUSDC", "AUSDC", 6))));

        AaveMiniMarket market = new AaveMiniMarket(tokens, aTokens);

        vm.stopBroadcast();

        console.log("AaveMiniMarket deployed at", address(market));
    }
}
