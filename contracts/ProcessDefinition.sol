// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@5.0/token/ERC20/ERC20.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";


contract ProcessDefinitionToken is ERC20, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    /// declare state variables
    address private _factory;
    address private _feeClaimer;
    address private _owner;
    string private _processDefinitionId;
    // fee in basis points (1% = 100 bps)
    uint private _feeBps = 500;

    // all started process instances
    string[] private _startedProcessInstancesList;

    struct ProcessInstance {
        string processInstanceId;
        ProcessInstanceStatus status;
        uint claimedAmount;
        uint neededAmount;
        uint revenue;
        address[] participants;
    }
    mapping(string => ProcessInstance) private _processInstances;

    enum ProcessInstanceStatus {
        NotCreated,
        Created,
        InProgress,
        Completed,
        Failed
    }

    constructor(
        address initialOwner,
        string memory _name,
        string memory _symbol,
        address __feeClaimer,
        string memory __processDefinitionId,
        uint __feeBps,
        address chainlinkRouter
    ) ERC20(_name, _symbol) FunctionsClient(chainlinkRouter)
    {
        _factory = msg.sender;
        _feeClaimer = __feeClaimer;
        _owner = initialOwner;
        _processDefinitionId = __processDefinitionId;
        _mint(address(this), type(uint256).max);
        _feeBps = __feeBps;
    }

    /// declare modifiers

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert("Function can be called by owner only");
        }
        _;
    }

    modifier processInstanceCreated(string memory _processInstanceId) {
        if (_processInstances[_processInstanceId].status != ProcessInstanceStatus.Created) {
            revert("Process instance not created!");
        }
        _;
    }

    modifier processInstanceCompleted(string memory _processInstanceId) {
        if (_processInstances[_processInstanceId].status >= ProcessInstanceStatus.Completed) {
            revert("Process instance not completed!");
        }
        _;
    }

    /// declare view functions

    function owner() public view returns (address) {
        return _owner;
    }

    function processDefinitionId() public view returns (string memory) {
        return _processDefinitionId;
    }

    function feeClaimer() public view returns (address) {
        return _feeClaimer;
    }

    function factory() public view returns (address) {
        return _factory;
    }

    function startedProcessInstances() public view returns (string[] memory) {
        return _startedProcessInstancesList;
    }

    function processInstance(string memory _processInstanceId) public view returns (ProcessInstance memory) {
        return _processInstances[_processInstanceId];
    }

    /// declare events

    event ProcessInstanceCreated(string processInstanceId, uint neededAmount);
    event ProcessInstanceStarted(string processInstanceId, uint claimedAmount);
    event ProcessInstanceCompleted(string processInstanceId, uint revenue);
    event ProcessInstanceFailed(string processInstanceId, string reason);
    event TransferOwnership(address newOwner);
    event ChangeFeeClaimer(address newFeeClaimer);
    event Deposit(address from, uint amount);
    event Withdraw(address to, uint amount);
    event TransferFee(address to, uint amount);
    error UnexpectedInstanceID(string instanceId);
    event Response(bytes32 indexed requestId, bytes response, bytes err);

    /// declare owner's functions

    function sendFee(string memory _processInstanceId) private onlyOwner processInstanceCompleted(_processInstanceId) {
        // send fee to feeClaimer
        if (_processInstances[_processInstanceId].revenue == 0) {
            // no revenue, nothing to send
            return;
        }
        if (_processInstances[_processInstanceId].revenue * _feeBps <= 10000) {
            // fee amount is 0
            return;
        }

        uint feeAmount = _processInstances[_processInstanceId].revenue * _feeBps / 10000;
        require(address(this).balance >= feeAmount, "Not enough funds!");

        _processInstances[_processInstanceId].revenue -= feeAmount;
        (bool success, ) = payable(_feeClaimer).call{value: feeAmount}("");
        if (!success) {
            revert("Transfer failed.");
        }
        emit TransferFee(_feeClaimer, feeAmount);
    }

    function changeFeeClaimer(address _newFeeClaimer) external {
        require(msg.sender == _feeClaimer, "Only fee claimer can call this function.");
        _feeClaimer = _newFeeClaimer;
        emit ChangeFeeClaimer(_newFeeClaimer);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        _owner = _newOwner;
        emit TransferOwnership(_newOwner);
    }

    function createProcessInstance(string memory _processInstanceId, uint _neededAmount) onlyOwner external {
        require(_processInstances[_processInstanceId].status == ProcessInstanceStatus.NotCreated, "Process instance already created!");
        _processInstances[_processInstanceId] = ProcessInstance(
            _processInstanceId,
            ProcessInstanceStatus.Created,
            0,
            _neededAmount,
            0,
            new address[](0)
        );
        emit ProcessInstanceCreated(_processInstanceId, _neededAmount);
    }

    function _startProcessInstance(string memory _processInstanceId) internal onlyOwner processInstanceCreated(_processInstanceId) {
        require(_processInstances[_processInstanceId].neededAmount <= _processInstances[_processInstanceId].claimedAmount, "Not enough funds!");
        require(address(this).balance >= _processInstances[_processInstanceId].claimedAmount, "Not enough funds!");

        _processInstances[_processInstanceId].status = ProcessInstanceStatus.InProgress;
        // transfer native token to owner
        (bool success, ) = payable(_owner).call{value: _processInstances[_processInstanceId].claimedAmount}("");
        if (!success) {
            revert("Transfer failed.");
        }

        emit ProcessInstanceStarted(_processInstanceId, _processInstances[_processInstanceId].claimedAmount);
    }

    function completeProcessInstance(string memory _processInstanceId) external payable onlyOwner {
        // get native token from owner and complete process instance
        require(_processInstances[_processInstanceId].status == ProcessInstanceStatus.InProgress, "Process instance not in progress!");
        require(msg.value > 0, "No value sent!");

        _processInstances[_processInstanceId].status = ProcessInstanceStatus.Completed;
        _processInstances[_processInstanceId].revenue += msg.value;
        sendFee(_processInstanceId);
        emit ProcessInstanceCompleted(_processInstanceId, _processInstances[_processInstanceId].revenue);
    }

    function failProcessInstance(string memory _processInstanceId, string calldata _reason) external onlyOwner {
        require(_processInstances[_processInstanceId].status == ProcessInstanceStatus.InProgress, "Process instance not in progress!");
        _processInstances[_processInstanceId].status = ProcessInstanceStatus.Failed;
        emit ProcessInstanceFailed(_processInstanceId, _reason);
    }

    /// declare participant's functions

    function deposit(string memory _processInstanceId) external payable processInstanceCreated(_processInstanceId) {
        require(msg.value > 0, "No value sent!");
        _processInstances[_processInstanceId].claimedAmount += msg.value;
        _processInstances[_processInstanceId].participants.push(msg.sender);
        _transfer(address(this), msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(string memory _processInstanceId, uint _amount) external processInstanceCompleted(_processInstanceId) {
        require(_processInstances[_processInstanceId].participants.length > 0, "No participants!");
        require(_amount > 0, "Amount must be greater than 0!");
        require(_amount <= balanceOf(msg.sender), "Not enough tokens!");
        require(_amount <= _processInstances[_processInstanceId].claimedAmount, "Not enough funds!");
        _transfer(msg.sender, address(this), _amount);

        _amount = _amount * 10_000;
        uint reward = _amount / _processInstances[_processInstanceId].claimedAmount * _processInstances[_processInstanceId].revenue;
        reward = reward / 10_000;

        (bool success, ) = payable(msg.sender).call{value: reward}("");
        if (!success) {
            revert("Transfer failed.");
        }

        emit Withdraw(msg.sender, reward);
    }

    /**
     * @notice Send a simple request
     * @param source JavaScript source code
     * @param encryptedSecretsUrls Encrypted URLs where to fetch user secrets
     * @param donHostedSecretsSlotID Don hosted secrets slotId
     * @param donHostedSecretsVersion Don hosted secrets version
     * @param args List of arguments accessible from within the source code
     * @param bytesArgs Array of bytes arguments, represented as hex strings
     * @param subscriptionId Billing ID
     */
    function startProcessInstance(
        string memory _processInstanceId,
        string memory source,
        bytes memory encryptedSecretsUrls,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        string[] memory args,
        bytes[] memory bytesArgs,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 jobId
    ) external onlyOwner returns (bytes32 requestId) {
        require(
            _processInstances[_processInstanceId].neededAmount <= _processInstances[_processInstanceId].claimedAmount,
            "Not enough funds!"
        );
        require(address(this).balance >= _processInstances[_processInstanceId].claimedAmount, "Not enough funds!");
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (encryptedSecretsUrls.length > 0)
            req.addSecretsReference(encryptedSecretsUrls);
        else if (donHostedSecretsVersion > 0) {
            req.addDONHostedSecrets(
                donHostedSecretsSlotID,
                donHostedSecretsVersion
            );
        }
        if (args.length > 0) req.setArgs(args);
        if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            jobId
        );
        return requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            emit Response(requestId, response, err);
            return;
        }
        string memory _instanceId = abi.decode(response, (string));
        if (bytes(_instanceId).length == 0 || _processInstances[_instanceId].status != ProcessInstanceStatus.Created) {
            revert UnexpectedInstanceID(_instanceId);
        }
        _startProcessInstance(_instanceId);
        emit Response(requestId, response, err);
    }
}
