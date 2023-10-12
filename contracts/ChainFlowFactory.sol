// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.20 and less than 0.9.0
pragma solidity ^0.8.20;

import "./ProcessDefinition.sol";


contract ChainFlowFactory {
    mapping(bytes32 => address) private deployedDefinitions;
    bytes32[] private allDefinitions;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    event ProcessDefinitionCreated(bytes32 indexed bpmnHash, address processAddress);

    function getContractAddressOfDefinition(bytes32 _defHash) public view returns (address) {
        return deployedDefinitions[_defHash];
    }

    function getDefinitionCount() public view returns(uint) {
        return allDefinitions.length;
    }

    function getAllDefinitions() public view returns (bytes32[] memory) {
        // copy needs to prevent modifying
        bytes32[] memory copyOfAllDefinitions = new bytes32[](allDefinitions.length);
        for (uint i = 0; i < allDefinitions.length; i++) {
            copyOfAllDefinitions[i] = allDefinitions[i];
        }
        return copyOfAllDefinitions;
    }

    function createDefinition(bytes32 _hash, uint _processPrice) external {
        require(deployedDefinitions[_hash] == address(0), "Process definition already created!");
        bytes memory bytecode = type(ProcessDefinition).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_hash));
        address newProcessDefinition;
        assembly {
            newProcessDefinition := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ProcessDefinition(newProcessDefinition).initialize(msg.sender, owner, _processPrice);
        deployedDefinitions[_hash] = newProcessDefinition;
        allDefinitions.push(_hash);
        emit ProcessDefinitionCreated(_hash, newProcessDefinition);
    }
}