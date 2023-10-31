// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FreelanceWorkEscrow {
    // Enum to represent the state of a work deal
    enum WorkDealStatus {
        Open,      // Deal is open for a freelancer to accept
        Accepted,  // Deal has been accepted by a freelancer
        FundsLocked, // Client has locked the funds
        Completed  // Work is completed, funds transferred to freelancer
    }

    // Struct to represent a work deal
    struct WorkDeal {
        address payable client;
        address payable freelancer;
        uint256 amount;
        WorkDealStatus status;
    }

    // Mapping from deal ID (string) to WorkDeal struct
    mapping(string => WorkDeal) public workDeals;

    // Events
    event WorkDealCreated(string dealId, address client, uint256 amount);
    event WorkDealAccepted(string dealId, address freelancer);
    event FundsLocked(string dealId);
    event WorkDealCompleted(string dealId);

    // Client creates a new work deal with a specified amount
    function createWorkDeal(uint256 _amount, string memory _dealId) external {
        require(workDeals[_dealId].client == address(0), "Deal ID already exists");

        WorkDeal memory newDeal = WorkDeal({
            client: payable(msg.sender),
            freelancer: payable(address(0)),
            amount: _amount,
            status: WorkDealStatus.Open
        });
        workDeals[_dealId] = newDeal;

        emit WorkDealCreated(_dealId, msg.sender, _amount);
    }

    // Freelancer accepts an open work deal
    function acceptWorkDeal(string memory dealId) external {
        WorkDeal storage deal = workDeals[dealId];

        require(deal.status == WorkDealStatus.Open, "Deal is not open for acceptance");
        require(deal.freelancer == address(0), "Deal already accepted by a freelancer");

        deal.freelancer = payable(msg.sender);
        deal.status = WorkDealStatus.Accepted;

        emit WorkDealAccepted(dealId, msg.sender);
    }

    // Client locks funds for a specific work deal
    function lockFunds(string memory dealId) external payable {
        WorkDeal storage deal = workDeals[dealId];

        require(msg.sender == deal.client, "Only the client can lock funds");
        require(msg.value == deal.amount, "Incorrect funds sent");
        require(deal.status == WorkDealStatus.Accepted, "Incorrect deal status");

        deal.status = WorkDealStatus.FundsLocked;
        emit FundsLocked(dealId);
    }

    // Client confirms work completion and releases funds to freelancer
    function confirmCompletion(string memory dealId) external {
        WorkDeal storage deal = workDeals[dealId];

        require(msg.sender == deal.client, "Only the client can confirm completion");
        require(deal.status == WorkDealStatus.FundsLocked, "Funds must be locked");

        deal.freelancer.transfer(deal.amount);
        deal.status = WorkDealStatus.Completed;
        emit WorkDealCompleted(dealId);
    }

    // Check if a deal exists using dealId
    function dealExists(string memory dealId) public view returns (bool) {
        return workDeals[dealId].client != address(0);
    }

    // Get the status of a deal using dealId
    function getDealStatus(string memory dealId) public view returns (WorkDealStatus) {
        require(dealExists(dealId), "Deal does not exist");
        return workDeals[dealId].status;
    }

    // Fallback function to receive funds
    receive() external payable {}
}
