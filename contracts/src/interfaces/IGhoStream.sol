// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

interface IGhoStream {
    function getBorrowerStreamIds(address borrower) external view returns (uint256[] memory);
}
