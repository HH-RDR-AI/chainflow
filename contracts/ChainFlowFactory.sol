// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.20 and less than 0.9.0
pragma solidity ^0.8.20;


contract ProcessDefinition {
    address public factory;
    // Mapping of started process instance IDs to their statuses.
    mapping(string => ProcessInstanceStatus) public startedProcessInstances;
    // List of all started process instance IDs.
    string[] private list;
    address public owner;

    enum ProcessInstanceStatus {
        Created,
        InProgress,
        Completed,
        Failed
    }

    constructor() {
        factory = msg.sender;
    }

    function setOwner(address _newOwner) external {
        require(msg.sender == factory, "Only factory can set onwer");
        require(owner == address(0), "Contract already has owner");
        owner = _newOwner;
    }

    event ProcessInstanceStarted(string processInstanceId);
    event ProcessInstanceCompleted(string processInstanceId);
    event ProcessInstanceFailed(string processInstanceId);

    // Starts a new process instance.
    function start(string memory processInstanceId) external {
        require(startedProcessInstances[processInstanceId] == ProcessInstanceStatus.Created, "Process instance already started.");

        startedProcessInstances[processInstanceId] = ProcessInstanceStatus.InProgress;
        list.push(processInstanceId);
        emit ProcessInstanceStarted(processInstanceId);
    }

    // Updates the status of a process instance.
    function update(string memory processInstanceId, ProcessInstanceStatus status) external {
        require(startedProcessInstances[processInstanceId] != ProcessInstanceStatus.Created, "Process instance not started.");
        startedProcessInstances[processInstanceId] = status;

        if (status == ProcessInstanceStatus.Completed) {
            emit ProcessInstanceCompleted(processInstanceId);
        } else if (status == ProcessInstanceStatus.Failed) {
            emit ProcessInstanceFailed(processInstanceId);
        }
    }

    // Gets the status of a process instance.
    function getStatus(string memory processInstanceId) public view returns (ProcessInstanceStatus) {
        return startedProcessInstances[processInstanceId];
    }

    // Gets the list of all started process instance IDs.
    function getList() public view returns (string[] memory) {
        return list;
    }
}

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

    function createDefinition(bytes memory _hash) external {
        require(deployedDefinitions[bytes32(_hash)] == address(0), "Process definition already created!");
        bytes memory bytecode = type(ProcessDefinition).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_hash));
        address newProcessDefinition;
        assembly {
            newProcessDefinition := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ProcessDefinition(newProcessDefinition).setOwner(msg.sender);
        deployedDefinitions[bytes32(_hash)] = newProcessDefinition;
        allDefinitions.push(bytes32(_hash));
        emit ProcessDefinitionCreated(bytes32(_hash), newProcessDefinition);
    }
}