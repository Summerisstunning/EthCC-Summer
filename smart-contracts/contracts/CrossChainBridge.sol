// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title CrossChainBridge
 * @dev Bridge contract for cross-chain USDC deposits to AA Sharing
 * Integrates with Avail Nexus for cross-chain messaging
 */
contract CrossChainBridge is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // State variables
    IERC20 public immutable usdc;
    address public aaSharing;
    address public validator; // Avail Nexus validator
    
    uint256 public minDeposit = 1e6; // 1 USDC minimum
    uint256 public maxDeposit = 100000e6; // 100k USDC maximum
    uint256 public bridgeFee = 0; // Fee in basis points (0 = no fee)
    
    // Nonce tracking for replay protection
    mapping(bytes32 => bool) public processedMessages;
    mapping(address => uint256) public userNonces;
    
    // Events
    event CrossChainDepositInitiated(
        address indexed user,
        uint256 indexed partnershipId,
        uint256 amount,
        uint256 destinationChain,
        bytes32 messageId,
        uint256 nonce
    );
    
    event CrossChainDepositCompleted(
        address indexed user,
        uint256 indexed partnershipId,
        uint256 amount,
        uint256 sourceChain,
        bytes32 messageId
    );
    
    event ValidatorUpdated(address indexed oldValidator, address indexed newValidator);
    event AAContractUpdated(address indexed oldContract, address indexed newContract);
    event FeesUpdated(uint256 newFee);
    
    // Errors
    error InvalidAmount();
    error InvalidPartnership();
    error MessageAlreadyProcessed();
    error InvalidSignature();
    error TransferFailed();
    error Unauthorized();

    constructor(
        address _usdc,
        address _aaSharing,
        address _validator
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_aaSharing != address(0), "Invalid AA Sharing address");
        require(_validator != address(0), "Invalid validator address");
        
        usdc = IERC20(_usdc);
        aaSharing = _aaSharing;
        validator = _validator;
    }

    /**
     * @dev Initiate cross-chain deposit from source chain
     */
    function initiateCrossChainDeposit(
        uint256 partnershipId,
        uint256 amount,
        uint256 destinationChain
    ) external nonReentrant {
        if (amount < minDeposit || amount > maxDeposit) {
            revert InvalidAmount();
        }
        
        // Calculate fee
        uint256 fee = (amount * bridgeFee) / 10000;
        uint256 netAmount = amount - fee;
        
        // Transfer USDC from user
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        // Transfer fee to owner if applicable
        if (fee > 0) {
            usdc.transfer(owner(), fee);
        }
        
        // Generate message ID and nonce
        uint256 nonce = userNonces[msg.sender]++;
        bytes32 messageId = keccak256(
            abi.encodePacked(
                msg.sender,
                partnershipId,
                netAmount,
                destinationChain,
                block.chainid,
                nonce,
                block.timestamp
            )
        );
        
        emit CrossChainDepositInitiated(
            msg.sender,
            partnershipId,
            netAmount,
            destinationChain,
            messageId,
            nonce
        );
        
        // In a real implementation, this would trigger Avail Nexus messaging
        _sendAvailMessage(messageId, msg.sender, partnershipId, netAmount, destinationChain);
    }
    
    /**
     * @dev Complete cross-chain deposit on destination chain
     */
    function completeCrossChainDeposit(
        address user,
        uint256 partnershipId,
        uint256 amount,
        uint256 sourceChain,
        bytes32 messageId,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        if (processedMessages[messageId]) {
            revert MessageAlreadyProcessed();
        }
        
        // Verify signature from validator
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                user,
                partnershipId,
                amount,
                sourceChain,
                block.chainid,
                messageId,
                nonce
            )
        );
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        if (signer != validator) {
            revert InvalidSignature();
        }
        
        // Mark message as processed
        processedMessages[messageId] = true;
        
        // Approve and call AA Sharing contract
        usdc.approve(aaSharing, amount);
        
        // Call crossChainDeposit on AA Sharing contract
        (bool success, ) = aaSharing.call(
            abi.encodeWithSignature(
                "crossChainDeposit(uint256,uint256,bytes32,bytes)",
                partnershipId,
                amount,
                messageId,
                signature
            )
        );
        
        require(success, "AA Sharing deposit failed");
        
        emit CrossChainDepositCompleted(
            user,
            partnershipId,
            amount,
            sourceChain,
            messageId
        );
    }
    
    /**
     * @dev Internal function to send message via Avail Nexus
     * In real implementation, this would interact with Avail DA
     */
    function _sendAvailMessage(
        bytes32 messageId,
        address user,
        uint256 partnershipId,
        uint256 amount,
        uint256 destinationChain
    ) internal {
        // This is a placeholder for Avail Nexus integration
        // Real implementation would:
        // 1. Format message for Avail DA
        // 2. Submit data to Avail
        // 3. Generate proof for destination chain
        
        bytes memory message = abi.encode(
            messageId,
            user,
            partnershipId,
            amount,
            block.chainid,
            destinationChain,
            block.timestamp
        );
        
        // Emit event for off-chain infrastructure to pick up
        emit AvailMessageSent(messageId, destinationChain, message);
    }
    
    event AvailMessageSent(bytes32 indexed messageId, uint256 destinationChain, bytes message);
    
    // Admin functions
    function setValidator(address newValidator) external onlyOwner {
        require(newValidator != address(0), "Invalid validator");
        address oldValidator = validator;
        validator = newValidator;
        emit ValidatorUpdated(oldValidator, newValidator);
    }
    
    function setAAContract(address newAAContract) external onlyOwner {
        require(newAAContract != address(0), "Invalid contract");
        address oldContract = aaSharing;
        aaSharing = newAAContract;
        emit AAContractUpdated(oldContract, newAAContract);
    }
    
    function setBridgeFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        bridgeFee = newFee;
        emit FeesUpdated(newFee);
    }
    
    function setDepositLimits(uint256 newMin, uint256 newMax) external onlyOwner {
        require(newMin > 0, "Min must be positive");
        require(newMax > newMin, "Max must be greater than min");
        minDeposit = newMin;
        maxDeposit = newMax;
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    // View functions
    function getMessageStatus(bytes32 messageId) external view returns (bool processed) {
        return processedMessages[messageId];
    }
    
    function calculateFee(uint256 amount) external view returns (uint256 fee, uint256 netAmount) {
        fee = (amount * bridgeFee) / 10000;
        netAmount = amount - fee;
    }
}