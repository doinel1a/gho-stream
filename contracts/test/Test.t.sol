// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import { Test } from "forge-std/Test.sol";
import { ISablierV2LockupLinear } from "@sablier/interfaces/ISablierV2LockupLinear.sol";
import { GhoStreamFacilitator } from "../src/GhoStreamFacilitator.sol";

contract BaseTest is Test {
    GhoStreamFacilitator public ghoStreamFacilitator;

    function setUp() public {
        ghoStreamFacilitator =
            new GhoStreamFacilitator(ISablierV2LockupLinear(0x7a43F8a888fa15e68C103E18b0439Eb1e98E4301));
    }
}
