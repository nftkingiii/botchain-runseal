// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RunsealRegistry {
    struct Seal { address submitter; bytes32 intentSeal; uint64 createdAt; }
    mapping(bytes32 => Seal) public seals;
    event IntentSealed(bytes32 indexed sealId, bytes32 indexed intentSeal, address indexed submitter);

    function sealIntent(bytes32 sealId, bytes32 intentSeal) external {
        require(sealId != bytes32(0) && intentSeal != bytes32(0), 'empty seal');
        require(seals[sealId].createdAt == 0, 'already sealed');
        seals[sealId] = Seal(msg.sender, intentSeal, uint64(block.timestamp));
        emit IntentSealed(sealId, intentSeal, msg.sender);
    }
}
