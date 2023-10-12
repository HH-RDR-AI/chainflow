contract ProcessDefinition {
    address public factory;
    // Mapping of started process instance IDs to their statuses.
    mapping(string => ProcessInstanceStatus) public startedProcessInstances;
    // Mapping of started process instance IDs to their owners.
    mapping(string => address) public processInstanceOwners;
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

    event ProcessInstanceStarted(string processInstanceId);
    event ProcessInstanceCompleted(string processInstanceId);
    event ProcessInstanceFailed(string processInstanceId);

    // Set owner of ProcessDefinition. Can be called by factory only.
    function setOwner(address _newOwner) external {
        require(msg.sender == factory, "Only factory can set onwer");
        require(owner == address(0), "Contract already has owner");
        owner = _newOwner;
    }

    // Starts a new process instance.
    function start(string memory processInstanceId) external {
        require(startedProcessInstances[processInstanceId] == ProcessInstanceStatus.Created, "Process instance already started.");

        startedProcessInstances[processInstanceId] = ProcessInstanceStatus.InProgress;
        list.push(processInstanceId);
        processInstanceOwners[processInstanceId] = msg.sender;
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