// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.20 and less than 0.9.0
pragma solidity ^0.8.20;

import "./ProcessDefinition.sol";


contract ChainFlowFactory {
    mapping(string => address) private deployedDefinitions;
    string[] private allDefinitions;
    address public owner;
    address private _chainlinkRouter;

    constructor(address chainlinkRouter) {
        owner = msg.sender;
        _chainlinkRouter = chainlinkRouter;
    }

    event ProcessDefinitionCreated(string indexed definitionId, address processAddress);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    function getContractAddressOfDefinition(string memory definitionId) public view returns (address) {
        return deployedDefinitions[definitionId];
    }

    function getDefinitionCount() public view returns (uint) {
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

    function createDefinition(
        string memory definitionId,
        uint feeBps
    ) external {
        require(deployedDefinitions[definitionId] == address(0), "Process definition already created!");
        require(bytes(definitionId).length > 0, "Process definition id cannot be empty!");
        bytes memory bytecode = type(ProcessDefinitionToken).creationCode;
        bytes memory constructorArgs = abi.encode(
            msg.sender,
            definitionId,
            definitionId,
            owner,
            definitionId,
            feeBps,
            _chainlinkRouter
        );
        bytes32 salt = keccak256(abi.encodePacked(
            definitionId,
            block.timestamp,
            block.prevrandao
        ));
        bytes memory deploymentBytecode = abi.encodePacked(bytecode, constructorArgs);
        address newProcessDefinition;
        assembly {
            newProcessDefinition := create2(0, add(deploymentBytecode, 32), mload(deploymentBytecode), salt)
        }
        require(newProcessDefinition != address(0), "Failed to deploy process definition!");
        deployedDefinitions[definitionId] = newProcessDefinition;
        allDefinitions.push(definitionId);
        emit ProcessDefinitionCreated(definitionId, newProcessDefinition);
    }

    function changeOwner(address _newOwner) external {
        require(msg.sender == owner, "Only owner can call this function.");
        owner = _newOwner;
        emit OwnerChanged(msg.sender, _newOwner);
    }
}
