// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { Script, console2 } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAToken } from "@aave/core-v3/contracts/interfaces/IAToken.sol";
import { MockAToken } from "src/mocks/MockAToken.sol";
import { AaveMiniMarket, TokenData } from "src/AaveMiniMarket.sol";
import { console } from "forge-std/console.sol";
import { GhoDebtToken } from "src/GhoDebtToken.sol";

contract DeployScript is Script {
    address public deployer;

    address public WETH = 0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c;
    address public DAI = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357;
    address public USDC = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8;

    GhoDebtToken public debtToken;

    TokenData[] public tokenData;

    function setUp() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.rememberKey(privateKey);

        tokenData.push(TokenData({ token: WETH, aToken: 0xaC775C0b34c50Ba68bBC0e4F3c9aCCaf34123eda, price: 2500e18 }));
        tokenData.push(TokenData({ token: DAI, aToken: 0x72CB9080841acB75E5AB9d83E5F78a3d20326e6A, price: 1e18 }));
        tokenData.push(TokenData({ token: USDC, aToken: 0x915790Fe8cc10Acf844CB77F8DC3299d4E3be78a, price: 1e18 }));
    }

    function run() public {
        vm.startBroadcast(deployer);

        AaveMiniMarket market = new AaveMiniMarket(tokenData);

        debtToken = new GhoDebtToken(address(market));
        vm.stopBroadcast();

        console.log("AaveMiniMarket deployed at", address(market));
        console.log("GhoDebtToken deployed at", address(debtToken));
    }
}
