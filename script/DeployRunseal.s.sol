// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {RunsealRegistry} from '../contracts/RunsealRegistry.sol';

interface Vm {
    function envBool(string calldata) external returns (bool);
    function startBroadcast() external;
    function stopBroadcast() external;
}

abstract contract Script { Vm internal constant vm = Vm(address(uint160(uint256(keccak256('hevm cheat code'))))); }

contract DeployRunseal is Script {
    function run() external returns (RunsealRegistry deployed) {
        require(block.chainid == 968, 'BOT testnet only');
        require(vm.envBool('RUNSEAL_DEPLOY_APPROVED'), 'dry-run: approval required');
        vm.startBroadcast();
        deployed = new RunsealRegistry();
        vm.stopBroadcast();
    }
}
