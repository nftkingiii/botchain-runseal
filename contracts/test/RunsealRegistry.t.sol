// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '../RunsealRegistry.sol';

contract RunsealRegistryTest {
    function testSealAndReadBack() public {
        RunsealRegistry r = new RunsealRegistry();
        bytes32 id = keccak256('run-1'); bytes32 intent = keccak256('intent-1');
        r.sealIntent(id, intent);
        (address who, bytes32 got, uint64 at) = r.seals(id);
        require(who == address(this) && got == intent && at > 0, 'bad readback');
    }
}
