// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.20 and less than 0.9.0
pragma solidity ^0.8.20;


contract ProcessDefinition {
    // draft
    address public factory;
    constructor() {
        factory = msg.sender;
    }
}

contract RapidMundaFactory {
    mapping(string => address) private deployedDefinitions;
    string[] private allDefinitions;

    function getContractAddressOfDefinition(string memory _defHash) public view returns (address) {
        return deployedDefinitions[_defHash];
    }

    function getDefinitionCount() public view returns(uint) {
        return allDefinitions.length;
    }

    function getAllDefinitions() public view returns (string[] memory) {
        // copy needs to prevent modifying
        string[] memory copyOfAllDefinitions = new string[](allDefinitions.length);
        for (uint i = 0; i < allDefinitions.length; i++) {
            copyOfAllDefinitions[i] = allDefinitions[i];
        }
        return copyOfAllDefinitions;
    }

    function createDefinition(string calldata _hash) external returns (address newProcessDefinition) {
        bytes memory bytecode = type(ProcessDefinition).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_hash));
        assembly {
            newProcessDefinition := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        deployedDefinitions[_hash] = newProcessDefinition;
        allDefinitions.push(_hash);
        return address(newProcessDefinition);
    }
}