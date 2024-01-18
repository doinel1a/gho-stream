// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAToken } from "@aave/core-v3/contracts/interfaces/IAToken.sol";

import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { Broker, LockupLinear } from "@sablier/types/DataTypes.sol";
import { ud60x18 } from "@prb/math/src/UD60x18.sol";

import { IGhoToken } from "./interfaces/IGhoToken.sol";
import { MockAToken } from "./mocks/MockAToken.sol";

/**
 * @dev Excessively simplified version of the Aave Pool contract.
 */
contract AaveMiniMarket {
    using EnumerableSet for EnumerableSet.UintSet;

    // Sepolia Addresses
    IGhoToken public immutable GHO = IGhoToken(0x78aB1A9C913107D0f989f7802c5981123Fb9ba4F);
    ISablierV2LockupLinear public immutable SABLIER_LOCKUP_LINEAR =
        ISablierV2LockupLinear(0x7a43F8a888fa15e68C103E18b0439Eb1e98E4301);

    mapping(IERC20 token => IAToken aToken) public aTokenOf;

    // Streaming
    mapping(address borrower => EnumerableSet.UintSet streamIds) private _borrowerStreamIds;
    mapping(uint256 streamId => address borrower) private _borrowerOfStreamId;

    constructor(IERC20[] memory tokens, IAToken[] memory aTokens) {
        require(tokens.length == aTokens.length, "Length mismatch");

        for (uint256 i = 0; i < tokens.length; i++) {
            aTokenOf[tokens[i]] = aTokens[i];
        }
    }

    function deposit(IERC20 token, uint256 amount) external {
        MockAToken(address(aTokenOf[token])).mint(msg.sender, msg.sender, amount, 0);
        token.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(IERC20 token, uint256 amount) external {
        aTokenOf[token].burn(msg.sender, msg.sender, amount, 0);
        token.transfer(msg.sender, amount);
    }

    function borrowGhoThroughStream(uint128 amount, uint40 streamDuration, address streamRecipient) external {
        uint256 nextStreamId = SABLIER_LOCKUP_LINEAR.nextStreamId();

        _borrowerStreamIds[msg.sender].add(nextStreamId);
        _borrowerOfStreamId[nextStreamId] = msg.sender;

        GHO.mint(address(this), amount);
        GHO.approve(address(SABLIER_LOCKUP_LINEAR), amount);
        uint256 streamId = _createGhoStream(amount, streamDuration, streamRecipient);

        require(streamId == nextStreamId, "StreamId mismatch");
    }

    function cancelGhoStream(uint256 streamId) external {
        require(_borrowerOfStreamId[streamId] == msg.sender, "Not borrower");

        SABLIER_LOCKUP_LINEAR.cancel(streamId);
        LockupLinear.Stream memory stream = SABLIER_LOCKUP_LINEAR.getStream(streamId);

        GHO.burn(stream.amounts.refunded);
    }

    function getBorrowerStreamIds(address borrower) external view returns (uint256[] memory streamIds) {
        streamIds = _borrowerStreamIds[borrower].values();
    }

    function _createGhoStream(
        uint128 totalAmount,
        uint40 duration,
        address recipient
    )
        internal
        returns (uint256 streamId)
    {
        // Approve the Sablier contract to spend GHO
        GHO.approve(address(SABLIER_LOCKUP_LINEAR), totalAmount);

        // Declare the params struct
        LockupLinear.CreateWithDurations memory params = LockupLinear.CreateWithDurations({
            sender: address(this),
            recipient: recipient,
            totalAmount: totalAmount,
            asset: GHO,
            cancelable: true, // Whether the stream will be cancelable or not
            transferable: true, // Whether the stream will be transferable or not
            durations: LockupLinear.Durations({ cliff: 0, total: duration }),
            broker: Broker(address(0), ud60x18(0)) // TODO: send funds to gho treasury
         });

        streamId = SABLIER_LOCKUP_LINEAR.createWithDurations(params);
    }
}
