// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../ProcessDefinition.sol";
import "../ChainFlowFactory.sol";

contract ChainFlowFactoryTest {
    ChainFlowFactory testChainFlowFactory;
    address private owner;

    // Deploy the ChainFlowFactory contract before each test
    function beforeEach() public {
        owner = msg.sender;
        testChainFlowFactory = new ChainFlowFactory();
    }

    // Test that the initial owner is set correctly
    function testInitialOwner() public {
        address currentOwner = testChainFlowFactory.owner();
        Assert.equal(currentOwner, owner, "Initial owner should match the deployer.");
    }

    // Test the creation of a new process definition
    function testCreateDefinition() public {
        string memory definitionId = "SampleDefinition";
        uint feeBps = 100;

        testChainFlowFactory.createDefinition(definitionId, feeBps);
        address deployedAddress = testChainFlowFactory.getContractAddressOfDefinition(definitionId);

        // Verify that the definition was created and has a valid address
        Assert.isNotZero(deployedAddress, "Definition contract should be deployed.");
    }

    // Test changing the owner of the contract
    function testChangeOwner() public {
        address newOwner = address(0x1234567890123456789012345678901234567890);

        testChainFlowFactory.changeOwner(newOwner);
        address updatedOwner = testChainFlowFactory.owner();

        // Verify that the owner has been changed
        Assert.equal(updatedOwner, newOwner, "Owner should be changed.");
    }

    // Test that the contract returns the correct number of definitions
    function testGetDefinitionCount() public {
        uint initialCount = testChainFlowFactory.getDefinitionCount();
        Assert.equal(initialCount, 0, "Initial count should be 0.");

        string memory definitionId = "SampleDefinition";
        uint feeBps = 100;
        testChainFlowFactory.createDefinition(definitionId, feeBps);

        uint updatedCount = testChainFlowFactory.getDefinitionCount();
        Assert.equal(updatedCount, 1, "Definition count should be updated.");
    }

    // Test getting the list of all definitions
    function testGetAllDefinitions() public {
        string memory definitionId1 = "Definition1";
        string memory definitionId2 = "Definition2";
        uint feeBps = 100;

        testChainFlowFactory.createDefinition(definitionId1, feeBps);
        testChainFlowFactory.createDefinition(definitionId2, feeBps);

        string[] memory allDefinitions = testChainFlowFactory.getAllDefinitions();
        uint definitionCount = testChainFlowFactory.getDefinitionCount();

        // Verify that the list contains the expected number of definitions
        Assert.equal(allDefinitions.length, definitionCount, "List length should match the definition count.");
        Assert.equal(allDefinitions[0], definitionId1, "First definition should match.");
        Assert.equal(allDefinitions[1], definitionId2, "Second definition should match.");
    }

    // Add more test cases as needed
}