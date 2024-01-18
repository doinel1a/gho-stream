// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDebtToken is IERC20 {
    function mint(address user, address onBehalfOf, uint256 amount, uint256 index) external returns (bool, uint256);

    function burn(address from, uint256 amount, uint256 index) external returns (uint256);
}
