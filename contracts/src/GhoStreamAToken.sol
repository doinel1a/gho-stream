// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ud60x18 } from "@prb/math/src/UD60x18.sol";

import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { Broker, LockupLinear } from "@sablier/types/DataTypes.sol";

import { Errors } from "@aave/core-v3/contracts/protocol/libraries/helpers/Errors.sol";
import { IAToken, IInitializableAToken } from "@aave/core-v3/contracts/interfaces/IAToken.sol";
import { ScaledBalanceTokenBase } from "@aave/core-v3/contracts/protocol/tokenization/base/ScaledBalanceTokenBase.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IAaveIncentivesController } from "@aave/core-v3/contracts/interfaces/IAaveIncentivesController.sol";
import { EIP712Base } from "@aave/core-v3/contracts/protocol/tokenization/base/EIP712Base.sol";

import { GhoStreamVariableDebtToken } from "./GhoStreamVariableDebtToken.sol";
import { IGhoToken } from "./IGhoToken.sol";
import { IGhoFacilitator } from "./IGhoFacilitator.sol";

contract GhoStreamAToken is IAToken, IGhoFacilitator, EIP712Base, ScaledBalanceTokenBase {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;

    // Sepolia Addresses
    IERC20 public immutable GHO = IERC20(0xc4bF5CbDaBE595361438F8c6a187bDc330539c60);
    ISablierV2LockupLinear public immutable SABLIER_LOCKUP_LINEAR =
        ISablierV2LockupLinear(0x7a43F8a888fa15e68C103E18b0439Eb1e98E4301);

    mapping(address borrower => EnumerableSet.UintSet streamIds) private _borrowerStreamIds;

    address internal _treasury;
    address internal _underlyingAsset;

    // Gho Storage
    GhoStreamVariableDebtToken internal _ghoVariableDebtToken;
    address internal _ghoTreasury;

    constructor(IPool pool) ScaledBalanceTokenBase(pool, "GHO_STREAM_ATOKEN_IMPL", "GHO_STREAM_ATOKEN_IMPL", 0) {
        // Intentionally left blank
    }

    /// @inheritdoc IInitializableAToken
    function initialize(
        IPool initializingPool,
        address treasury,
        address underlyingAsset,
        IAaveIncentivesController incentivesController,
        uint8 aTokenDecimals,
        string calldata aTokenName,
        string calldata aTokenSymbol,
        bytes calldata
    )
        external
    {
        require(initializingPool == POOL, Errors.POOL_ADDRESSES_DO_NOT_MATCH);
        _setName(aTokenName);
        _setSymbol(aTokenSymbol);
        _setDecimals(aTokenDecimals);

        _treasury = treasury;
        _underlyingAsset = underlyingAsset;
        _incentivesController = incentivesController;
    }

    /// @inheritdoc IAToken
    function transferUnderlyingTo(address target, uint256 amount) external {
        // TODO: take 40 bits from amount and decode duration
        IGhoToken(_underlyingAsset).mint(address(this), amount);

        _createGhoStream(uint128(amount), 1 weeks, target);
    }

    /// @inheritdoc IAToken
    function handleRepayment(address user, address onBehalfOf, uint256 amount) external {
        // TODO: handle repayment
        // uint256 balanceFromInterest = _ghoVariableDebtToken.getBalanceFromInterest(onBehalfOf);
        // if (amount <= balanceFromInterest) {
        //     _ghoVariableDebtToken.decreaseBalanceFromInterest(onBehalfOf, amount);
        // } else {
        //     _ghoVariableDebtToken.decreaseBalanceFromInterest(onBehalfOf, balanceFromInterest);
        //     IGhoToken(_underlyingAsset).burn(amount - balanceFromInterest);
        // }
    }

    /// @inheritdoc IAToken
    function rescueTokens(address token, address to, uint256 amount) external {
        require(token != _underlyingAsset, Errors.UNDERLYING_CANNOT_BE_RESCUED);
        IERC20(token).safeTransfer(to, amount);
    }

    function getBorrowerStreamIds(address borrower) external view returns (uint256[] memory streamIds) {
        streamIds = _borrowerStreamIds[borrower].values();
    }

    /// @inheritdoc IAToken
    function UNDERLYING_ASSET_ADDRESS() external view returns (address) {
        return _underlyingAsset;
    }

    /// @inheritdoc IAToken
    function RESERVE_TREASURY_ADDRESS() external view returns (address) {
        return _treasury;
    }

    /// @inheritdoc EIP712Base
    function DOMAIN_SEPARATOR() public view override(IAToken, EIP712Base) returns (bytes32) {
        return super.DOMAIN_SEPARATOR();
    }

    /// @inheritdoc EIP712Base
    function _EIP712BaseId() internal view override returns (string memory) {
        return name();
    }

    /// @inheritdoc EIP712Base
    function nonces(address owner) public view override(IAToken, EIP712Base) returns (uint256) {
        return super.nonces(owner);
    }

    /// @inheritdoc IGhoFacilitator
    function distributeFeesToTreasury() external virtual {
        uint256 balance = IERC20(_underlyingAsset).balanceOf(address(this));
        IERC20(_underlyingAsset).transfer(_ghoTreasury, balance);
        emit FeesDistributedToTreasury(_ghoTreasury, _underlyingAsset, balance);
    }

    /// @inheritdoc IGhoFacilitator
    function updateGhoTreasury(address newGhoTreasury) external onlyPoolAdmin {
        require(newGhoTreasury != address(0), "ZERO_ADDRESS_NOT_VALID");
        address oldGhoTreasury = _ghoTreasury;
        _ghoTreasury = newGhoTreasury;
        emit GhoTreasuryUpdated(oldGhoTreasury, newGhoTreasury);
    }

    /// @inheritdoc IGhoFacilitator
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
        // Approve the Sablier contract to spend GHO
        GHO.approve(address(SABLIER_LOCKUP_LINEAR), totalAmount);

        // Declare the params struct
        LockupLinear.CreateWithDurations memory params = LockupLinear.CreateWithDurations({
            sender: address(this),
            recipient: recipient,
            totalAmount: totalAmount, // Total amount is the amount inclusive of all fees
            asset: GHO,
            cancelable: true, // Whether the stream will be cancelable or not
            transferable: true, // Whether the stream will be transferable or not
            durations: LockupLinear.Durations({ cliff: 0, total: duration }),
            broker: Broker(address(0), ud60x18(0)) // TODO: send funds to gho treasury
         });

        streamId = SABLIER_LOCKUP_LINEAR.createWithDurations(params);

        _borrowerStreamIds[msg.sender].add(streamId);
    }

    /**
     * UNSUPPORTED FUNCTIONS
     */
    function mint(address, address, uint256, uint256) external returns (bool) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function burn(address, address, uint256, uint256) external {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function mintToTreasury(uint256, uint256) external {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function transferOnLiquidation(address, address, uint256) external {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function permit(address, address, uint256, uint256, uint8, bytes32, bytes32) external {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function _transfer(address, address, uint128) internal override {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }
}
