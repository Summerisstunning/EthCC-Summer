// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AA Sharing - Shared Emotional Ledger and Wallet
 * @dev A smart contract for couples/friends to record gratitude and manage shared finances on Flow EVM
 * @notice Built for Flow Mainnet EVM compatibility - Consumer Killer App for widespread adoption
 */
contract AASharing is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _partnershipIdCounter;
    Counters.Counter private _gratitudeIdCounter;
    Counters.Counter private _goalIdCounter;
    
    // Events for transparent on-chain tracking
    event PartnershipCreated(uint256 indexed partnershipId, address partnerA, address partnerB, uint256 timestamp);
    event GratitudeDeposited(uint256 indexed partnershipId, uint256 indexed gratitudeId, address author, string content, uint256 amount, uint256 timestamp);
    event GoalCreated(uint256 indexed partnershipId, uint256 indexed goalId, string name, uint256 targetAmount, uint256 timestamp);
    event GoalContribution(uint256 indexed partnershipId, uint256 indexed goalId, address contributor, uint256 amount, uint256 timestamp);
    event GoalCompleted(uint256 indexed partnershipId, uint256 indexed goalId, uint256 timestamp);
    event FundsSplit(uint256 indexed partnershipId, address partnerA, address partnerB, uint256 amountEach, uint256 timestamp);
    event EmergencyWithdraw(uint256 indexed partnershipId, address requester, uint256 amount, uint256 timestamp);
    
    // Structs for data organization
    struct Partnership {
        uint256 id;
        address partnerA;
        address partnerB;
        uint256 balance;
        uint256 totalGratitude;
        uint256 totalGoals;
        uint256 createdAt;
        bool isActive;
    }
    
    struct GratitudeEntry {
        uint256 id;
        uint256 partnershipId;
        address author;
        string content;
        uint256 amount;
        uint256 timestamp;
    }
    
    struct Goal {
        uint256 id;
        uint256 partnershipId;
        string name;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        bool isCompleted;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // Storage mappings
    mapping(uint256 => Partnership) public partnerships;
    mapping(address => uint256[]) public userPartnerships; // User address => Partnership IDs
    mapping(uint256 => GratitudeEntry[]) public partnershipGratitude; // Partnership ID => Gratitude entries
    mapping(uint256 => Goal[]) public partnershipGoals; // Partnership ID => Goals
    mapping(uint256 => mapping(address => bool)) public partnershipMembers; // Partnership ID => Address => isMember
    
    // Constants for consumer-friendly limits
    uint256 public constant MAX_GRATITUDE_LENGTH = 500; // characters
    uint256 public constant MAX_GOAL_NAME_LENGTH = 100;
    uint256 public constant MAX_GOAL_DESCRIPTION_LENGTH = 300;
    uint256 public constant MIN_CONTRIBUTION = 0.001 ether; // Minimum contribution in Flow
    
    modifier onlyPartnershipMember(uint256 partnershipId) {
        require(partnershipMembers[partnershipId][msg.sender], "Not a partnership member");
        require(partnerships[partnershipId].isActive, "Partnership is not active");
        _;
    }
    
    modifier validPartnership(uint256 partnershipId) {
        require(partnershipId < _partnershipIdCounter.current(), "Partnership does not exist");
        require(partnerships[partnershipId].isActive, "Partnership is not active");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Initialize counters (they start at 0)
    }
    
    /**
     * @dev Create a new partnership between two addresses
     * @param partnerB Address of the second partner
     * @return partnershipId The ID of the newly created partnership
     */
    function createPartnership(address partnerB) external returns (uint256) {
        require(partnerB != address(0), "Invalid partner address");
        require(partnerB != msg.sender, "Cannot partner with yourself");
        
        uint256 partnershipId = _partnershipIdCounter.current();
        _partnershipIdCounter.increment();
        
        Partnership storage newPartnership = partnerships[partnershipId];
        newPartnership.id = partnershipId;
        newPartnership.partnerA = msg.sender;
        newPartnership.partnerB = partnerB;
        newPartnership.balance = 0;
        newPartnership.totalGratitude = 0;
        newPartnership.totalGoals = 0;
        newPartnership.createdAt = block.timestamp;
        newPartnership.isActive = true;
        
        // Add to user mappings
        userPartnerships[msg.sender].push(partnershipId);
        userPartnerships[partnerB].push(partnershipId);
        
        // Set partnership members
        partnershipMembers[partnershipId][msg.sender] = true;
        partnershipMembers[partnershipId][partnerB] = true;
        
        emit PartnershipCreated(partnershipId, msg.sender, partnerB, block.timestamp);
        
        return partnershipId;
    }
    
    /**
     * @dev Deposit gratitude with optional financial contribution
     * @param partnershipId ID of the partnership
     * @param content Gratitude message content
     */
    function depositGratitude(uint256 partnershipId, string calldata content) 
        external 
        payable 
        validPartnership(partnershipId)
        onlyPartnershipMember(partnershipId) 
    {
        require(bytes(content).length > 0 && bytes(content).length <= MAX_GRATITUDE_LENGTH, "Invalid content length");
        
        if (msg.value > 0) {
            require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");
            partnerships[partnershipId].balance += msg.value;
        }
        
        uint256 gratitudeId = _gratitudeIdCounter.current();
        _gratitudeIdCounter.increment();
        
        GratitudeEntry memory newGratitude = GratitudeEntry({
            id: gratitudeId,
            partnershipId: partnershipId,
            author: msg.sender,
            content: content,
            amount: msg.value,
            timestamp: block.timestamp
        });
        
        partnershipGratitude[partnershipId].push(newGratitude);
        partnerships[partnershipId].totalGratitude++;
        
        emit GratitudeDeposited(partnershipId, gratitudeId, msg.sender, content, msg.value, block.timestamp);
    }
    
    /**
     * @dev Create a new shared goal
     * @param partnershipId ID of the partnership
     * @param name Goal name
     * @param description Goal description
     * @param targetAmount Target amount in wei
     */
    function createGoal(
        uint256 partnershipId, 
        string calldata name, 
        string calldata description, 
        uint256 targetAmount
    ) 
        external 
        validPartnership(partnershipId)
        onlyPartnershipMember(partnershipId) 
    {
        require(bytes(name).length > 0 && bytes(name).length <= MAX_GOAL_NAME_LENGTH, "Invalid goal name length");
        require(bytes(description).length <= MAX_GOAL_DESCRIPTION_LENGTH, "Description too long");
        require(targetAmount > 0, "Target amount must be positive");
        
        uint256 goalId = _goalIdCounter.current();
        _goalIdCounter.increment();
        
        Goal memory newGoal = Goal({
            id: goalId,
            partnershipId: partnershipId,
            name: name,
            description: description,
            targetAmount: targetAmount,
            currentAmount: 0,
            isCompleted: false,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        partnershipGoals[partnershipId].push(newGoal);
        partnerships[partnershipId].totalGoals++;
        
        emit GoalCreated(partnershipId, goalId, name, targetAmount, block.timestamp);
    }
    
    /**
     * @dev Contribute to a specific goal
     * @param partnershipId ID of the partnership
     * @param goalIndex Index of the goal in the partnership's goals array
     */
    function contributeToGoal(uint256 partnershipId, uint256 goalIndex) 
        external 
        payable 
        validPartnership(partnershipId)
        onlyPartnershipMember(partnershipId) 
    {
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");
        require(goalIndex < partnershipGoals[partnershipId].length, "Goal does not exist");
        
        Goal storage goal = partnershipGoals[partnershipId][goalIndex];
        require(!goal.isCompleted, "Goal already completed");
        
        partnerships[partnershipId].balance += msg.value;
        goal.currentAmount += msg.value;
        
        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
            goal.isCompleted = true;
            goal.completedAt = block.timestamp;
            emit GoalCompleted(partnershipId, goal.id, block.timestamp);
        }
        
        emit GoalContribution(partnershipId, goal.id, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Contribute directly to partnership balance
     * @param partnershipId ID of the partnership
     */
    function contributeToPartnership(uint256 partnershipId) 
        external 
        payable 
        validPartnership(partnershipId)
        onlyPartnershipMember(partnershipId) 
    {
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");
        partnerships[partnershipId].balance += msg.value;
    }
    
    /**
     * @dev Split partnership funds equally between partners
     * @param partnershipId ID of the partnership
     */
    function splitFunds(uint256 partnershipId) 
        external 
        validPartnership(partnershipId)
        onlyPartnershipMember(partnershipId)
        nonReentrant 
    {
        Partnership storage partnership = partnerships[partnershipId];
        require(partnership.balance > 0, "No funds to split");
        
        uint256 halfBalance = partnership.balance / 2;
        partnership.balance = 0;
        partnership.isActive = false;
        
        // Transfer funds to both partners
        (bool successA, ) = partnership.partnerA.call{value: halfBalance}("");
        (bool successB, ) = partnership.partnerB.call{value: halfBalance}("");
        
        require(successA && successB, "Transfer failed");
        
        emit FundsSplit(partnershipId, partnership.partnerA, partnership.partnerB, halfBalance, block.timestamp);
    }
    
    // View functions for front-end integration
    
    /**
     * @dev Get partnership details
     */
    function getPartnership(uint256 partnershipId) external view returns (Partnership memory) {
        return partnerships[partnershipId];
    }
    
    /**
     * @dev Get all partnerships for a user
     */
    function getUserPartnerships(address user) external view returns (uint256[] memory) {
        return userPartnerships[user];
    }
    
    /**
     * @dev Get gratitude entries for a partnership
     */
    function getPartnershipGratitude(uint256 partnershipId) external view returns (GratitudeEntry[] memory) {
        return partnershipGratitude[partnershipId];
    }
    
    /**
     * @dev Get goals for a partnership
     */
    function getPartnershipGoals(uint256 partnershipId) external view returns (Goal[] memory) {
        return partnershipGoals[partnershipId];
    }
    
    /**
     * @dev Get partnership balance
     */
    function getPartnershipBalance(uint256 partnershipId) external view returns (uint256) {
        return partnerships[partnershipId].balance;
    }
    
    /**
     * @dev Get total partnerships count
     */
    function getTotalPartnerships() external view returns (uint256) {
        return _partnershipIdCounter.current();
    }
    
    /**
     * @dev Check if user is member of partnership
     */
    function isPartnershipMember(uint256 partnershipId, address user) external view returns (bool) {
        return partnershipMembers[partnershipId][user];
    }
    
    // Emergency functions
    
    /**
     * @dev Emergency withdraw function (only contract owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Fallback function to receive Ether
    receive() external payable {
        // Contract can receive Ether
    }
}