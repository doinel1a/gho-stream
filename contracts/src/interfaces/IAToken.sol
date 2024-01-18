// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAToken is IERC20 {
    function transferUnderlyingTo(address target, uint256 amount) external;

    function handleRepayment(address user, address onBehalfOf, uint256 amount) external;

    function mint(address account, address, uint256 amount, uint256) external;

    function burn(address account, address, uint256 amount, uint256) external;
}
