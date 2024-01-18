// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAToken } from "@aave/core-v3/contracts/interfaces/IAToken.sol";

/**
 * @dev Excessively simplified version of the Aave Pool contract.
 */
contract AaveMiniMarket {
    mapping(IERC20 token => IAToken aToken) public aTokenOf;

    constructor(IERC20[] memory tokens, IAToken[] memory aTokens) {
        require(tokens.length == aTokens.length, "AaveMiniMarket: length mismatch");

        for (uint256 i = 0; i < tokens.length; i++) {
            aTokenOf[tokens[i]] = aTokens[i];
        }
    }

    function deposit(IERC20 token, uint256 amount) external {
        aTokenOf[token].mint(msg.sender, msg.sender, amount, 0);
        token.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(IERC20 token, uint256 amount) external {
        aTokenOf[token].burn(msg.sender, msg.sender, amount, 0);
        token.transfer(msg.sender, amount);
    }
}
