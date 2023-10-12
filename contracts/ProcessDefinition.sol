// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.20 and less than 0.9.0
pragma solidity ^0.8.20;


contract ProcessDefinition {
    address public factory;
    // Mapping of started process instance IDs to their statuses.
    mapping(string => ProcessInstanceStatus) public startedProcessInstances;
    // Mapping of started process instance IDs to their owners.
    mapping(string => address) public processInstanceOwners;
    // List of all started process instance IDs.
    string[] private list;

    address public owner;
    uint public processPrice;

    address public feeClaimer;
    // 5% fee
    uint public fee = 5;

    enum ProcessInstanceStatus {
        Created,
        InProgress,
        Completed,
        Failed
    }

    constructor() {
        factory = msg.sender;
    }

    event ProcessInstanceStarted(string processInstanceId);
    event ProcessInstanceCompleted(string processInstanceId);
    event ProcessInstanceFailed(string processInstanceId);
    event TransferOwnership(address newOwner);
    event ChangeFeeClaimer(address newFeeClaimer);
    event Deposit(address from, uint amount);
    event Withdraw(address to, uint amount);
    event Transfer(address to, uint amount);


    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    // Set owner of ProcessDefinition. Can be called by factory only.

    function initialize(address _owner, address _feeClaimer, uint _price) external {
        require(msg.sender == factory, "Only factory can set onwer");
        require(owner == address(0), "Contract already has owner");
        owner = _owner;
        feeClaimer = _feeClaimer;
        processPrice = _price;
    }

    function changeFeeClaimer(address _feeClaimer) external {
        require(msg.sender == feeClaimer, "Only feeClaimer can change feeClaimer");
        feeClaimer = _feeClaimer;
        emit ChangeFeeClaimer(_feeClaimer);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        owner = _newOwner;
        emit TransferOwnership(_newOwner);
    }

    // Starts a new process instance.
    function start(string memory processInstanceId) external payable {
        require(startedProcessInstances[processInstanceId] == ProcessInstanceStatus.Created, "Process instance already started.");
        // deposit before starting process instance
        require(msg.value > processPrice, "Deposit must be greater than process price");
        // send fee to feeClaimer
        uint feeAmount = msg.value * fee / 100;
        (bool success, ) = payable(feeClaimer).call{value: feeAmount}("");
        require(success, "Failed to send fee to feeClaimer");
        emit Transfer(feeClaimer, feeAmount);

        startedProcessInstances[processInstanceId] = ProcessInstanceStatus.InProgress;
        list.push(processInstanceId);
        processInstanceOwners[processInstanceId] = msg.sender;

        emit ProcessInstanceStarted(processInstanceId);
    }

    // Updates the status of a process instance.
    function update(string memory processInstanceId, ProcessInstanceStatus status) external onlyOwner {
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
        string[] memory copyOfList = new string[](list.length);
        for (uint i = 0; i < list.length; i++) {
            copyOfList[i] = list[i];
        }
        return copyOfList;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
        emit Withdraw(msg.sender, address(this).balance);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

}