// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { Test } from "forge-std/Test.sol";
import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import { console } from "forge-std/console.sol";

import { AaveMiniMarket, TokenData } from "src/AaveMiniMarket.sol";
import { MockAToken } from "src/mocks/MockAToken.sol";
import { GhoDebtToken } from "src/GhoDebtToken.sol";

contract BaseTest is Test {
    address public deployer;
    AaveMiniMarket public aaveMiniMarket;

    address public WETH = 0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c;
    address public DAI = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357;
    address public USDC = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8;

    TokenData[] public tokenData;

    GhoDebtToken public debtToken;

    function setUp() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.rememberKey(privateKey);
        vm.startPrank(deployer);

        tokenData.push(TokenData({ token: WETH, aToken: 0xaC775C0b34c50Ba68bBC0e4F3c9aCCaf34123eda, price: 2500e18 }));
        tokenData.push(TokenData({ token: DAI, aToken: 0x72CB9080841acB75E5AB9d83E5F78a3d20326e6A, price: 1e18 }));
        tokenData.push(TokenData({ token: USDC, aToken: 0x915790Fe8cc10Acf844CB77F8DC3299d4E3be78a, price: 1e18 }));

        aaveMiniMarket = new AaveMiniMarket(tokenData);
        debtToken = new GhoDebtToken(address(aaveMiniMarket));

        deal(address(WETH), deployer, 100e18);
        deal(address(DAI), deployer, 100e18);
        deal(address(USDC), deployer, 100e18);
    }

    function test_aaveMiniMarket() public {
        IERC20(WETH).approve(address(aaveMiniMarket), 100e18);
        IERC20(DAI).approve(address(aaveMiniMarket), 100e18);
        IERC20(USDC).approve(address(aaveMiniMarket), 100e6);

        vm.expectRevert();
        aaveMiniMarket.withdraw(WETH, 100e18);

        aaveMiniMarket.deposit(WETH, 100e18);
        aaveMiniMarket.deposit(DAI, 100e18);
        aaveMiniMarket.deposit(USDC, 100e6);

        aaveMiniMarket.withdraw(WETH, 100e18);
        aaveMiniMarket.withdraw(DAI, 100e18);
        aaveMiniMarket.withdraw(USDC, 100e6);
    }

    function test_streamBorrow() public {
        aaveMiniMarket.borrowGhoThroughStream(100e18, 1 days, deployer);

        skip(12 hours);

        uint256 debtBalance = debtToken.balanceOf(deployer);
        assertTrue(debtBalance != 0);
    }

    function test_netWorth() public {
        IERC20(DAI).approve(address(aaveMiniMarket), 100e18);
        IERC20(USDC).approve(address(aaveMiniMarket), 100e18);

        aaveMiniMarket.deposit(DAI, 100e18);
        aaveMiniMarket.deposit(USDC, 100e6);

        uint256 netWorth = aaveMiniMarket.getNetWorth(deployer);

        assertTrue(netWorth == 200e18);

        uint256 maxBorrowAmount = aaveMiniMarket.getMaxBorrowAmount(deployer);

        assertTrue(maxBorrowAmount == 160e18);
    }
}
