const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainBridge Contract", function () {
  let bridge;
  let aaSharing;
  let mockUSDC;
  let owner;
  let validator;
  let user1;
  let user2;
  
  const INITIAL_USDC_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC
  const DEPOSIT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
  const BRIDGE_FEE = 50; // 0.5% fee

  beforeEach(async function () {
    [owner, validator, user1, user2] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.waitForDeployment();

    // Deploy AASharing
    const AASharing = await ethers.getContractFactory("AASharing");
    aaSharing = await AASharing.deploy(await mockUSDC.getAddress());
    await aaSharing.waitForDeployment();

    // Deploy CrossChainBridge
    const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
    bridge = await CrossChainBridge.deploy(
      await mockUSDC.getAddress(),
      await aaSharing.getAddress(),
      validator.address
    );
    await bridge.waitForDeployment();

    // Mint USDC to users
    await mockUSDC.mint(user1.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(user2.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(await bridge.getAddress(), INITIAL_USDC_SUPPLY);

    // Set bridge fee
    await bridge.setBridgeFee(BRIDGE_FEE);
  });

  describe("Bridge Configuration", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await bridge.usdc()).to.equal(await mockUSDC.getAddress());
      expect(await bridge.aaSharing()).to.equal(await aaSharing.getAddress());
      expect(await bridge.validator()).to.equal(validator.address);
      expect(await bridge.bridgeFee()).to.equal(BRIDGE_FEE);
    });

    it("Should allow owner to update validator", async function () {
      const newValidator = user1.address;
      
      await expect(bridge.setValidator(newValidator))
        .to.emit(bridge, "ValidatorUpdated")
        .withArgs(validator.address, newValidator);
      
      expect(await bridge.validator()).to.equal(newValidator);
    });

    it("Should fail validator update from non-owner", async function () {
      await expect(
        bridge.connect(user1).setValidator(user2.address)
      ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
    });
  });

  describe("Cross-Chain Deposits", function () {
    let partnershipId;

    beforeEach(async function () {
      // Create partnership in AA Sharing
      await aaSharing.connect(user1).createPartnership(
        user2.address,
        "Alice",
        "Bob"
      );
      partnershipId = 1;
    });

    it("Should initiate cross-chain deposit", async function () {
      const destinationChain = 747; // Flow mainnet
      
      // Approve bridge to spend USDC
      await mockUSDC.connect(user1).approve(await bridge.getAddress(), DEPOSIT_AMOUNT);
      
      const tx = await bridge.connect(user1).initiateCrossChainDeposit(
        partnershipId,
        DEPOSIT_AMOUNT,
        destinationChain
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return bridge.interface.parseLog(log).name === "CrossChainDepositInitiated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      
      const parsedEvent = bridge.interface.parseLog(event);
      expect(parsedEvent.args.user).to.equal(user1.address);
      expect(parsedEvent.args.partnershipId).to.equal(partnershipId);
      expect(parsedEvent.args.destinationChain).to.equal(destinationChain);
      
      // Check fee calculation
      const expectedFee = (DEPOSIT_AMOUNT * BigInt(BRIDGE_FEE)) / 10000n;
      const expectedNetAmount = DEPOSIT_AMOUNT - expectedFee;
      expect(parsedEvent.args.amount).to.equal(expectedNetAmount);
    });

    it("Should fail with amount too small", async function () {
      const tooSmall = ethers.parseUnits("0.5", 6); // 0.5 USDC
      
      await mockUSDC.connect(user1).approve(await bridge.getAddress(), tooSmall);
      
      await expect(
        bridge.connect(user1).initiateCrossChainDeposit(partnershipId, tooSmall, 747)
      ).to.be.revertedWithCustomError(bridge, "InvalidAmount");
    });

    it("Should complete cross-chain deposit with valid signature", async function () {
      const messageId = ethers.keccak256(ethers.toUtf8Bytes("test_message"));
      const sourceChain = 1; // Ethereum
      const nonce = 0;
      
      // Create message hash
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256", "bytes32", "uint256"],
          [user1.address, partnershipId, DEPOSIT_AMOUNT, sourceChain, 31337, messageId, nonce]
        )
      );
      
      // Sign with validator
      const signature = await validator.signMessage(ethers.getBytes(messageHash));
      
      const tx = await bridge.completeCrossChainDeposit(
        user1.address,
        partnershipId,
        DEPOSIT_AMOUNT,
        sourceChain,
        messageId,
        nonce,
        signature
      );

      await expect(tx)
        .to.emit(bridge, "CrossChainDepositCompleted")
        .withArgs(user1.address, partnershipId, DEPOSIT_AMOUNT, sourceChain, messageId);
      
      // Check that message is marked as processed
      expect(await bridge.getMessageStatus(messageId)).to.be.true;
    });

    it("Should fail with invalid signature", async function () {
      const messageId = ethers.keccak256(ethers.toUtf8Bytes("test_message"));
      const sourceChain = 1;
      const nonce = 0;
      
      // Sign with wrong signer
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256", "bytes32", "uint256"],
          [user1.address, partnershipId, DEPOSIT_AMOUNT, sourceChain, 31337, messageId, nonce]
        )
      );
      
      const wrongSignature = await user1.signMessage(ethers.getBytes(messageHash));
      
      await expect(
        bridge.completeCrossChainDeposit(
          user1.address,
          partnershipId,
          DEPOSIT_AMOUNT,
          sourceChain,
          messageId,
          nonce,
          wrongSignature
        )
      ).to.be.revertedWithCustomError(bridge, "InvalidSignature");
    });

    it("Should prevent message replay", async function () {
      const messageId = ethers.keccak256(ethers.toUtf8Bytes("test_message"));
      const sourceChain = 1;
      const nonce = 0;
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256", "bytes32", "uint256"],
          [user1.address, partnershipId, DEPOSIT_AMOUNT, sourceChain, 31337, messageId, nonce]
        )
      );
      
      const signature = await validator.signMessage(ethers.getBytes(messageHash));
      
      // First deposit should succeed
      await bridge.completeCrossChainDeposit(
        user1.address,
        partnershipId,
        DEPOSIT_AMOUNT,
        sourceChain,
        messageId,
        nonce,
        signature
      );
      
      // Second deposit with same message should fail
      await expect(
        bridge.completeCrossChainDeposit(
          user1.address,
          partnershipId,
          DEPOSIT_AMOUNT,
          sourceChain,
          messageId,
          nonce,
          signature
        )
      ).to.be.revertedWithCustomError(bridge, "MessageAlreadyProcessed");
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate fees correctly", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const [fee, netAmount] = await bridge.calculateFee(amount);
      
      const expectedFee = (amount * BigInt(BRIDGE_FEE)) / 10000n;
      const expectedNet = amount - expectedFee;
      
      expect(fee).to.equal(expectedFee);
      expect(netAmount).to.equal(expectedNet);
    });

    it("Should update bridge fee", async function () {
      const newFee = 100; // 1%
      
      await expect(bridge.setBridgeFee(newFee))
        .to.emit(bridge, "FeesUpdated")
        .withArgs(newFee);
      
      expect(await bridge.bridgeFee()).to.equal(newFee);
    });

    it("Should fail to set fee too high", async function () {
      const tooHighFee = 1001; // 10.01%
      
      await expect(
        bridge.setBridgeFee(tooHighFee)
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Deposit Limits", function () {
    it("Should update deposit limits", async function () {
      const newMin = ethers.parseUnits("5", 6); // 5 USDC
      const newMax = ethers.parseUnits("50000", 6); // 50k USDC
      
      await bridge.setDepositLimits(newMin, newMax);
      
      expect(await bridge.minDeposit()).to.equal(newMin);
      expect(await bridge.maxDeposit()).to.equal(newMax);
    });

    it("Should fail with invalid limits", async function () {
      const invalidMin = 0;
      const invalidMax = ethers.parseUnits("1", 6);
      
      await expect(
        bridge.setDepositLimits(invalidMin, invalidMax)
      ).to.be.revertedWith("Min must be positive");
      
      await expect(
        bridge.setDepositLimits(invalidMax, invalidMin)
      ).to.be.revertedWith("Max must be greater than min");
    });
  });
});