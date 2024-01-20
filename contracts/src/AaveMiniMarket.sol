// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { Broker, LockupLinear } from "@sablier/types/DataTypes.sol";
import { ud60x18 } from "@prb/math/src/UD60x18.sol";

import { IGhoFacilitator } from "./interfaces/IGhoFacilitator.sol";
import { IGhoToken } from "./interfaces/IGhoToken.sol";
import { MockAToken } from "./mocks/MockAToken.sol";

struct TokenData {
    address token;
    address aToken;
    uint256 price;
}

contract AaveMiniMarket is IGhoFacilitator, Ownable {
    // Sepolia Addresses
    IGhoToken public immutable GHO = IGhoToken(0x78aB1A9C913107D0f989f7802c5981123Fb9ba4F);
    ISablierV2LockupLinear public immutable SABLIER_LOCKUP_LINEAR =
        ISablierV2LockupLinear(0x7a43F8a888fa15e68C103E18b0439Eb1e98E4301);

    address internal _ghoTreasury;
    TokenData[] internal _tokenData;
    mapping(address token => address aToken) internal _aTokenOf;

    // Streaming
    mapping(address borrower => uint256[] streamIds) private _borrowerStreamIds;
    mapping(uint256 streamId => address borrower) private _borrowerOfStreamId;

    constructor(TokenData[] memory tokenData) Ownable(msg.sender) {
        _ghoTreasury = msg.sender;

        for (uint256 i = 0; i < tokenData.length; i++) {
            _aTokenOf[tokenData[i].token] = tokenData[i].aToken;
            _tokenData.push(tokenData[i]);
        }
    }

    function deposit(address token, uint256 amount) external {
        MockAToken(_aTokenOf[token]).mint(msg.sender, msg.sender, amount, 0);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(address token, uint256 amount) external {
        MockAToken(_aTokenOf[token]).burn(msg.sender, msg.sender, amount, 0);
        IERC20(token).transfer(msg.sender, amount);
    }

    function borrowGhoThroughStream(
        uint128 amount,
        uint40 streamDuration,
        address streamRecipient
    )
        external
        returns (uint256 streamId)
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= getMaxBorrowAmount(msg.sender), "Exceeds max borrow amount");

        uint256 nextStreamId = SABLIER_LOCKUP_LINEAR.nextStreamId();

        _borrowerStreamIds[msg.sender].push(nextStreamId);
        _borrowerOfStreamId[nextStreamId] = msg.sender;

        GHO.mint(address(this), amount);
        GHO.approve(address(SABLIER_LOCKUP_LINEAR), amount);
        streamId = _createGhoStream(amount, streamDuration, streamRecipient);

        require(streamId == nextStreamId, "StreamId mismatch");
    }

    function cancelGhoStream(uint256 streamId) external {
        require(_borrowerOfStreamId[streamId] == msg.sender, "Not borrower");

        SABLIER_LOCKUP_LINEAR.cancel(streamId);
        LockupLinear.Stream memory stream = SABLIER_LOCKUP_LINEAR.getStream(streamId);

        GHO.burn(stream.amounts.refunded);
    }

    function getBorrowerStreamIds(address borrower) external view returns (uint256[] memory streamIds) {
        streamIds = _borrowerStreamIds[borrower];
    }

    function getNetWorth(address user) public view returns (uint256) {
        return getDepositValue(user) - getRealTimeDebt(user);
    }

    function getRealTimeDebt(address user) public view returns (uint256) {
        uint256[] memory streamIds = _borrowerStreamIds[user];

        uint256 realTimeBalance = 0;
        for (uint256 i = 0; i < streamIds.length; i++) {
            uint128 streamedAmount = SABLIER_LOCKUP_LINEAR.streamedAmountOf(streamIds[i]);

            realTimeBalance += streamedAmount;
        }

        return realTimeBalance;
    }

    function getDepositValue(address user) public view returns (uint256) {
        uint256 tokenLength = _tokenData.length;
        uint256 depositValue = 0;
        for (uint256 i = 0; i < tokenLength; i++) {
            IERC20Metadata token = IERC20Metadata(_tokenData[i].aToken);
            uint256 userBalance = token.balanceOf(user);

            depositValue += userBalance * _tokenData[i].price / 10 ** token.decimals();
        }
        return depositValue;
    }

    function getMaxBorrowAmount(address user) public view returns (uint256) {
        uint256 netWorth = getNetWorth(user);
        return netWorth * 80 / 100;
    }

    function distributeFeesToTreasury() external virtual {
        uint256 balance = GHO.balanceOf(address(this));
        GHO.transfer(_ghoTreasury, balance);
        emit FeesDistributedToTreasury(_ghoTreasury, address(GHO), balance);
    }

    function updateGhoTreasury(address newGhoTreasury) external onlyOwner {
        require(newGhoTreasury != address(0), "ZERO_ADDRESS_NOT_VALID");
        address oldGhoTreasury = _ghoTreasury;
        _ghoTreasury = newGhoTreasury;
        emit GhoTreasuryUpdated(oldGhoTreasury, newGhoTreasury);
    }

    function getGhoTreasury() external view returns (address) {
        return _ghoTreasury;
    }

    function _createGhoStream(
        uint128 totalAmount,
        uint40 duration,
        address recipient
    )
        internal
        returns (uint256 streamId)
    {
        // Declare the params struct
        LockupLinear.CreateWithDurations memory params = LockupLinear.CreateWithDurations({
            sender: address(this),
            recipient: recipient,
            totalAmount: totalAmount,
            asset: GHO,
            cancelable: true,
            transferable: true,
            durations: LockupLinear.Durations({ cliff: 0, total: duration }),
            broker: Broker(_ghoTreasury, ud60x18(0.01e18)) // 1% fee to treasury
         });

        streamId = SABLIER_LOCKUP_LINEAR.createWithDurations(params);
    }
}
