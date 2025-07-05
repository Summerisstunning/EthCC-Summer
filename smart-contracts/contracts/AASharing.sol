// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AASharing - A Love & Gratitude Ledger
 * @dev Smart contract for couples/friends to record gratitude and share funds
 * @author AA Sharing Team
 */
contract AASharing is ReentrancyGuard, Ownable, Pausable {
    // USDC Token interface
    IERC20 public immutable usdc;
    
    // Events
    event PartnershipCreated(
        uint256 indexed partnershipId,
        address indexed partner1,
        address indexed partner2,
        string nickname1,
        string nickname2
    );
    
    event GratitudeAdded(
        uint256 indexed partnershipId,
        address indexed contributor,
        string gratitudeText,
        uint256 usdcAmount,
        uint256 timestamp
    );
    
    event FundsDeposited(
        uint256 indexed partnershipId,
        address indexed depositor,
        uint256 amount,
        string source // "gratitude", "direct", "cross-chain"
    );
    
    event FundsWithdrawn(
        uint256 indexed partnershipId,
        address indexed partner1,
        address indexed partner2,
        uint256 amountEach
    );
    
    event GoalCreated(
        uint256 indexed partnershipId,
        uint256 indexed goalId,
        string goalName,
        uint256 targetAmount
    );
    
    // Structs
    struct Partnership {
        address partner1;
        address partner2;
        string nickname1;
        string nickname2;
        uint256 totalBalance;
        uint256 createdAt;
        bool isActive;
        uint256 goalCount;
    }
    
    struct GratitudeEntry {
        address contributor;
        string text;
        uint256 usdcAmount;
        uint256 timestamp;
    }
    
    struct Goal {
        string name;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        bool isCompleted;
        uint256 createdAt;
    }
    
    // State variables
    uint256 public nextPartnershipId = 1;
    uint256 public totalPartnerships;
    uint256 public totalGratitudeEntries;
    uint256 public totalUSDCLocked;
    
    // Mappings
    mapping(uint256 => Partnership) public partnerships;
    mapping(uint256 => GratitudeEntry[]) public partnershipGratitude;
    mapping(uint256 => mapping(uint256 => Goal)) public partnershipGoals;
    mapping(address => uint256[]) public userPartnerships;
    mapping(bytes32 => bool) public usedNonces; // For cross-chain deposits
    
    // Modifiers
    modifier onlyPartner(uint256 partnershipId) {
        Partnership memory p = partnerships[partnershipId];
        require(
            msg.sender == p.partner1 || msg.sender == p.partner2,
            "Not a partner in this partnership"
        );
        _;
    }
    
    modifier validPartnership(uint256 partnershipId) {
        require(partnershipId > 0 && partnershipId < nextPartnershipId, "Invalid partnership ID");
        require(partnerships[partnershipId].isActive, "Partnership not active");
        _;
    }
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdc = IERC20(_usdcToken);
    }
    
    /**
     * @dev Create a new partnership between two addresses
     */
    function createPartnership(
        address partner2,
        string calldata nickname1,
        string calldata nickname2
    ) external whenNotPaused returns (uint256 partnershipId) {
        require(partner2 != address(0), "Invalid partner address");
        require(partner2 != msg.sender, "Cannot partner with yourself");
        require(bytes(nickname1).length > 0 && bytes(nickname2).length > 0, "Nicknames required");
        
        partnershipId = nextPartnershipId++;
        
        partnerships[partnershipId] = Partnership({
            partner1: msg.sender,
            partner2: partner2,
            nickname1: nickname1,
            nickname2: nickname2,
            totalBalance: 0,
            createdAt: block.timestamp,
            isActive: true,
            goalCount: 0
        });
        
        userPartnerships[msg.sender].push(partnershipId);
        userPartnerships[partner2].push(partnershipId);
        
        totalPartnerships++;
        
        emit PartnershipCreated(partnershipId, msg.sender, partner2, nickname1, nickname2);
    }
    
    /**
     * @dev Add a gratitude entry with optional USDC contribution
     */
    function addGratitude(
        uint256 partnershipId,
        string calldata gratitudeText,
        uint256 usdcAmount
    ) external onlyPartner(partnershipId) validPartnership(partnershipId) whenNotPaused nonReentrant {
        require(bytes(gratitudeText).length > 0, "Gratitude text required");
        require(bytes(gratitudeText).length <= 500, "Gratitude text too long");
        
        // Handle USDC contribution if specified
        if (usdcAmount > 0) {
            require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");
            partnerships[partnershipId].totalBalance += usdcAmount;
            totalUSDCLocked += usdcAmount;
            
            emit FundsDeposited(partnershipId, msg.sender, usdcAmount, "gratitude");
        }
        
        // Add gratitude entry
        partnershipGratitude[partnershipId].push(GratitudeEntry({
            contributor: msg.sender,
            text: gratitudeText,
            usdcAmount: usdcAmount,
            timestamp: block.timestamp
        }));
        
        totalGratitudeEntries++;
        
        emit GratitudeAdded(partnershipId, msg.sender, gratitudeText, usdcAmount, block.timestamp);
    }
    
    /**
     * @dev Direct USDC deposit to partnership
     */
    function depositFunds(
        uint256 partnershipId,
        uint256 amount
    ) external onlyPartner(partnershipId) validPartnership(partnershipId) whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        
        partnerships[partnershipId].totalBalance += amount;
        totalUSDCLocked += amount;
        
        emit FundsDeposited(partnershipId, msg.sender, amount, "direct");
    }
    
    /**
     * @dev Cross-chain deposit with nonce to prevent replay attacks
     */
    function crossChainDeposit(
        uint256 partnershipId,
        uint256 amount,
        bytes32 nonce,
        bytes calldata signature
    ) external validPartnership(partnershipId) whenNotPaused nonReentrant {
        require(!usedNonces[nonce], "Nonce already used");
        require(amount > 0, "Amount must be greater than 0");
        
        // Verify signature (implementation depends on cross-chain bridge)
        bytes32 messageHash = keccak256(abi.encodePacked(partnershipId, amount, nonce));
        // Additional signature verification logic would go here
        
        usedNonces[nonce] = true;
        partnerships[partnershipId].totalBalance += amount;
        totalUSDCLocked += amount;
        
        emit FundsDeposited(partnershipId, msg.sender, amount, "cross-chain");
    }
    
    /**
     * @dev Both partners withdraw their share (50/50 split)
     */
    function withdraw(uint256 partnershipId) 
        external 
        onlyPartner(partnershipId) 
        validPartnership(partnershipId) 
        whenNotPaused 
        nonReentrant 
    {
        Partnership storage p = partnerships[partnershipId];
        require(p.totalBalance > 0, "No funds to withdraw");
        
        uint256 amountEach = p.totalBalance / 2;
        require(amountEach > 0, "Insufficient balance for withdrawal");
        
        // Reset balance first (reentrancy protection)
        totalUSDCLocked -= p.totalBalance;
        p.totalBalance = 0;
        
        // Transfer to both partners
        require(usdc.transfer(p.partner1, amountEach), "Transfer to partner1 failed");
        require(usdc.transfer(p.partner2, amountEach), "Transfer to partner2 failed");
        
        emit FundsWithdrawn(partnershipId, p.partner1, p.partner2, amountEach);
    }
    
    /**
     * @dev Create a savings goal for the partnership
     */
    function createGoal(
        uint256 partnershipId,
        string calldata goalName,
        string calldata description,
        uint256 targetAmount
    ) external onlyPartner(partnershipId) validPartnership(partnershipId) whenNotPaused {
        require(bytes(goalName).length > 0, "Goal name required");
        require(targetAmount > 0, "Target amount must be greater than 0");
        
        uint256 goalId = partnerships[partnershipId].goalCount++;
        
        partnershipGoals[partnershipId][goalId] = Goal({
            name: goalName,
            description: description,
            targetAmount: targetAmount,
            currentAmount: 0,
            isCompleted: false,
            createdAt: block.timestamp
        });
        
        emit GoalCreated(partnershipId, goalId, goalName, targetAmount);
    }
    
    // View functions
    function getPartnership(uint256 partnershipId) 
        external 
        view 
        returns (Partnership memory) 
    {
        return partnerships[partnershipId];
    }
    
    function getGratitudeEntries(uint256 partnershipId) 
        external 
        view 
        returns (GratitudeEntry[] memory) 
    {
        return partnershipGratitude[partnershipId];
    }
    
    function getGratitudeCount(uint256 partnershipId) 
        external 
        view 
        returns (uint256) 
    {
        return partnershipGratitude[partnershipId].length;
    }
    
    function getUserPartnerships(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPartnerships[user];
    }
    
    function getGoal(uint256 partnershipId, uint256 goalId) 
        external 
        view 
        returns (Goal memory) 
    {
        return partnershipGoals[partnershipId][goalId];
    }
    
    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyOwner 
    {
        require(token != address(usdc) || paused(), "Cannot withdraw USDC unless paused");
        IERC20(token).transfer(owner(), amount);
    }
    
    // Get contract statistics
    function getContractStats() 
        external 
        view 
        returns (
            uint256 _totalPartnerships,
            uint256 _totalGratitudeEntries,
            uint256 _totalUSDCLocked,
            uint256 _contractUSDCBalance
        ) 
    {
        return (
            totalPartnerships,
            totalGratitudeEntries,
            totalUSDCLocked,
            usdc.balanceOf(address(this))
        );
    }
}