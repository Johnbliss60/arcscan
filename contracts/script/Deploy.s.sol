// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcScan.sol";

contract DeployArcScan is Script {
    // USDC ERC-20 on Arc Testnet (6 decimals)
    address constant USDC_TESTNET = 0x3600000000000000000000000000000000000000;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        ArcScan arcScan = new ArcScan(USDC_TESTNET);

        vm.stopBroadcast();

        console.log("==============================================");
        console.log("ArcScan deployed to:", address(arcScan));
        console.log("Deployer:           ", deployer);
        console.log("USDC address:       ", USDC_TESTNET);
        console.log("==============================================");
        console.log("Add to frontend/.env:");
        console.log("VITE_ARCSCAN_ADDRESS=", address(arcScan));
    }
}
