// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ud60x18 } from "@prb/math/src/UD60x18.sol";
import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { Broker, LockupLinear } from "@sablier/types/DataTypes.sol";

contract GhoStreamFacilitator {
    IERC20 public immutable GHO = IERC20(0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D);
    ISablierV2LockupLinear public immutable SABLIER_LOCKUP_LINEAR;

    constructor(ISablierV2LockupLinear sablier) {
        SABLIER_LOCKUP_LINEAR = sablier;
    }

    function createGhoStream(
        uint256 totalAmount,
        uint40 cliff,
        uint40 totalDuration
    )
        external
        returns (uint256 streamId)
    {
        // TODO: mint GHO
        GHO.transferFrom(msg.sender, address(this), totalAmount);

        // Approve the Sablier contract to spend GHO
        GHO.approve(address(SABLIER_LOCKUP_LINEAR), totalAmount);

        // Declare the params struct
        LockupLinear.CreateWithDurations memory params;

        // Declare the function parameters
        params.sender = address(this);
        params.recipient = msg.sender;
        params.totalAmount = uint128(totalAmount); // Total amount is the amount inclusive of all fees
        params.asset = GHO; // The streaming asset
        params.cancelable = true; // Whether the stream will be cancelable or not
        params.transferable = true; // Whether the stream will be transferable or not
        params.durations = LockupLinear.Durations({ cliff: cliff, total: totalDuration });
        // TODO: Implement a GHO treasury fee
        params.broker = Broker(address(0), ud60x18(0)); // Optional parameter for charging a fee

        // Create the Sablier stream using a function that sets the start time to `block.timestamp`
        streamId = SABLIER_LOCKUP_LINEAR.createWithDurations(params);
    }
}
