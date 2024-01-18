// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { DebtTokenBase } from "@aave/core-v3/contracts/protocol/tokenization/base/DebtTokenBase.sol";
import { IVariableDebtToken } from "@aave/core-v3/contracts/interfaces/IVariableDebtToken.sol";
import { ScaledBalanceTokenBase } from "@aave/core-v3/contracts/protocol/tokenization/base/ScaledBalanceTokenBase.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IAaveIncentivesController } from "@aave/core-v3/contracts/interfaces/IAaveIncentivesController.sol";
import { Errors } from "@aave/core-v3/contracts/protocol/libraries/helpers/Errors.sol";
import { WadRayMath } from "@aave/core-v3/contracts/protocol/libraries/math/WadRayMath.sol";

import { IGhoToken } from "./interfaces/IGhoToken.sol";

contract GhoStreamVariableDebtToken is ScaledBalanceTokenBase, DebtTokenBase, IVariableDebtToken {
    using WadRayMath for uint256;

    IGhoToken public immutable GHO = IGhoToken(0xc4bF5CbDaBE595361438F8c6a187bDc330539c60);
    address internal _ghoAToken;

    modifier onlyAToken() {
        require(_ghoAToken == msg.sender, "CALLER_NOT_A_TOKEN");
        _;
    }

    constructor(IPool pool)
        DebtTokenBase()
        ScaledBalanceTokenBase(pool, "GHO_STREAM_VARIABLE_DEBT_TOKEN_IMPL", "GHO_STREAM_VARIABLE_DEBT_TOKEN_IMPL", 0)
    {
        // Intentionally left blank
    }

    function initialize(
        IPool initializingPool,
        address underlyingAsset,
        IAaveIncentivesController incentivesController,
        uint8 debtTokenDecimals,
        string memory debtTokenName,
        string memory debtTokenSymbol,
        bytes calldata
    )
        external
        override
        initializer
    {
        require(initializingPool == POOL, Errors.POOL_ADDRESSES_DO_NOT_MATCH);
        _setName(debtTokenName);
        _setSymbol(debtTokenSymbol);
        _setDecimals(debtTokenDecimals);

        _underlyingAsset = underlyingAsset;
        _incentivesController = incentivesController;

        _domainSeparator = _calculateDomainSeparator();
    }

    function balanceOf(address user) public view virtual override returns (uint256) {
        uint256 scaledBalance = super.balanceOf(user);

        if (scaledBalance == 0) {
            return 0;
        }

        uint256 index = POOL.getReserveNormalizedVariableDebt(_underlyingAsset);
        uint256 previousIndex = _userState[user].additionalData;
        uint256 balance = scaledBalance.rayMul(index);
        if (index == previousIndex) {
            return balance;
        }

        // uint256 discountPercent = _ghoUserState[user].discountPercent;
        // if (discountPercent != 0) {
        //     uint256 balanceIncrease = balance - scaledBalance.rayMul(previousIndex);
        //     balance -= balanceIncrease.percentMul(discountPercent);
        // }

        return balance;
    }

    function mint(
        address user,
        address onBehalfOf,
        uint256 amount,
        uint256 index
    )
        external
        virtual
        override
        onlyPool
        returns (bool, uint256)
    {
        if (user != onBehalfOf) {
            _decreaseBorrowAllowance(onBehalfOf, user, amount);
        }
        return (_mintScaled(user, onBehalfOf, amount, index), scaledTotalSupply());
    }

    function burn(address from, uint256 amount, uint256 index) external virtual override onlyPool returns (uint256) {
        _burnScaled(from, address(0), amount, index);
        return scaledTotalSupply();
    }

    function totalSupply() public view virtual override returns (uint256) {
        return super.totalSupply().rayMul(POOL.getReserveNormalizedVariableDebt(_underlyingAsset));
    }

    function UNDERLYING_ASSET_ADDRESS() external view returns (address) {
        return address(GHO);
    }

    function getRevision() internal pure override returns (uint256) {
        return 0x1;
    }

    function _EIP712BaseId() internal view override returns (string memory) {
        return name();
    }

    /**
     * UNSUPPORTED OPERATIONS
     */
    function transfer(address, uint256) external virtual override returns (bool) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function allowance(address, address) external view virtual override returns (uint256) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function approve(address, uint256) external virtual override returns (bool) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function transferFrom(address, address, uint256) external virtual override returns (bool) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function increaseAllowance(address, uint256) external virtual override returns (bool) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }

    function decreaseAllowance(address, uint256) external virtual override returns (bool) {
        revert(Errors.OPERATION_NOT_SUPPORTED);
    }
}
