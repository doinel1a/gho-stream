// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGhoToken is ERC20 {
    constructor() ERC20("GHO", "GHO") { }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
