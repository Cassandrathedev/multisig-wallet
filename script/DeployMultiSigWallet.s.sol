// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MultiSigWallet.sol";

contract DeployMultiSigWallet is Script {
    function run() external {
        // Replace these with real owner wallet addresses before deploying
        address[] memory owners = new address[](3);
        owners[0] = vm.envAddress("OWNER_1");
        owners[1] = vm.envAddress("OWNER_2");
        owners[2] = vm.envAddress("OWNER_3");

        uint256 required = 2; // 2 of 3 required

        vm.startBroadcast();
        MultiSigWallet wallet = new MultiSigWallet(owners, required);
        console.log("MultiSigWallet deployed to:", address(wallet));
        console.log("Owners:", owners[0], owners[1], owners[2]);
        console.log("Required approvals:", required);
        vm.stopBroadcast();
    }
}
