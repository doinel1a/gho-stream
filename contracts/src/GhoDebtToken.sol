// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { LockupLinear } from "@sablier/types/DataTypes.sol";

import { AaveMiniMarket } from "./AaveMiniMarket.sol";

contract GhoDebtToken is ERC20 {
    AaveMiniMarket public immutable AAVE_MARKET;
    ISablierV2LockupLinear public immutable SABLIER_LOCKUP_LINEAR;

    constructor(address aaveMarket) ERC20("GHO Debt Token", "GHO-DEBT") {
        AAVE_MARKET = AaveMiniMarket(aaveMarket);
        SABLIER_LOCKUP_LINEAR = AAVE_MARKET.SABLIER_LOCKUP_LINEAR();
    }

    function balanceOf(address account) public view override returns (uint256) {
        uint256[] memory streamIds = AAVE_MARKET.getBorrowerStreamIds(account);

        uint256 realTimeBalance = 0;
        for (uint256 i = 0; i < streamIds.length; i++) {
            uint128 streamedAmount = SABLIER_LOCKUP_LINEAR.streamedAmountOf(streamIds[i]);

            realTimeBalance += streamedAmount;
        }

        return realTimeBalance;
    }
}
