// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ud60x18 } from "@prb/math/src/UD60x18.sol";
import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { Broker, LockupLinear } from "@sablier/types/DataTypes.sol";

contract GhoStreamFacilitator {
    using EnumerableSet for EnumerableSet.UintSet;

    // Sepolia Addresses
    IERC20 public immutable GHO = IERC20(0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D);
    ISablierV2LockupLinear public immutable SABLIER_LOCKUP_LINEAR =
        ISablierV2LockupLinear(0x7a43F8a888fa15e68C103E18b0439Eb1e98E4301);

    mapping(address borrower => EnumerableSet.UintSet streamIds) private _borrowerStreamIds;

    function createGhoStream(
        uint256 totalAmount,
        uint40 duration,
        address recipient
    )
        external
        returns (uint256 streamId)
    {
        // TODO: mint GHO
        GHO.transferFrom(msg.sender, address(this), totalAmount);

        // Approve the Sablier contract to spend GHO
        GHO.approve(address(SABLIER_LOCKUP_LINEAR), totalAmount);

        // Declare the params struct
        LockupLinear.CreateWithDurations memory params = LockupLinear.CreateWithDurations({
            sender: address(this),
            recipient: recipient,
            totalAmount: uint128(totalAmount), // Total amount is the amount inclusive of all fees
            asset: GHO, // The streaming asset
            cancelable: true, // Whether the stream will be cancelable or not
            transferable: true, // Whether the stream will be transferable or not
            durations: LockupLinear.Durations({ cliff: 0, total: duration }),
            broker: Broker(address(0), ud60x18(0)) // TODO: send funds to gho treasury
         });

        streamId = SABLIER_LOCKUP_LINEAR.createWithDurations(params);

        _borrowerStreamIds[msg.sender].add(streamId);
    }

    function getBorrowerStreamIds(address borrower) external view returns (uint256[] memory streamIds) {
        streamIds = _borrowerStreamIds[borrower].values();
    }
}
