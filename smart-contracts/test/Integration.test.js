const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AA Sharing Integration Tests", function () {
  let aaSharing;
  let bridge;
  let mockUSDC;
  let owner;
  let validator;
  let alice;
  let bob;
  let charlie;
  
  const INITIAL_USDC_SUPPLY = ethers.parseUnits("1000000", 6);
  const DEPOSIT_AMOUNT = ethers.parseUnits("500", 6);

  beforeEach(async function () {
    [owner, validator, alice, bob, charlie] = await ethers.getSigners();

    // Deploy contracts
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.waitForDeployment();

    const AASharing = await ethers.getContractFactory("AASharing");
    aaSharing = await AASharing.deploy(await mockUSDC.getAddress());
    await aaSharing.waitForDeployment();

    const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
    bridge = await CrossChainBridge.deploy(
      await mockUSDC.getAddress(),
      await aaSharing.getAddress(),
      validator.address
    );
    await bridge.waitForDeployment();

    // Mint USDC to users
    await mockUSDC.mint(alice.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(bob.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(charlie.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(await bridge.getAddress(), INITIAL_USDC_SUPPLY);
  });

  describe("Complete User Journey", function () {
    it("Should handle full partnership lifecycle", async function () {
      // 1. Create partnership
      await aaSharing.connect(alice).createPartnership(
        bob.address,
        "Alice",
        "Bob"
      );
      const partnershipId = 1;

      // 2. Add gratitude entries with USDC
      await mockUSDC.connect(alice).approve(await aaSharing.getAddress(), DEPOSIT_AMOUNT);
      await aaSharing.connect(alice).addGratitude(
        partnershipId,
        "Thank you for cooking dinner!",
        DEPOSIT_AMOUNT
      );

      await mockUSDC.connect(bob).approve(await aaSharing.getAddress(), DEPOSIT_AMOUNT);
      await aaSharing.connect(bob).addGratitude(
        partnershipId,
        "Thank you for the thoughtful gift!",
        DEPOSIT_AMOUNT
      );

      // 3. Check gratitude entries
      const gratitudeEntries = await aaSharing.getGratitudeEntries(partnershipId);
      expect(gratitudeEntries.length).to.equal(2);
      expect(gratitudeEntries[0].text).to.equal("Thank you for cooking dinner!");
      expect(gratitudeEntries[1].text).to.equal("Thank you for the thoughtful gift!");

      // 4. Check partnership balance
      const partnership = await aaSharing.getPartnership(partnershipId);
      expect(partnership.totalBalance).to.equal(DEPOSIT_AMOUNT * 2n);

      // 5. Create a savings goal
      const goalAmount = ethers.parseUnits("5000", 6);
      await aaSharing.connect(alice).createGoal(
        partnershipId,
        "Vacation to Bali",
        "Our dream honeymoon destination",
        goalAmount
      );

      const goal = await aaSharing.getGoal(partnershipId, 0);
      expect(goal.name).to.equal("Vacation to Bali");
      expect(goal.targetAmount).to.equal(goalAmount);

      // 6. Add more direct deposits
      await mockUSDC.connect(alice).approve(await aaSharing.getAddress(), DEPOSIT_AMOUNT);
      await aaSharing.connect(alice).depositFunds(partnershipId, DEPOSIT_AMOUNT);

      // 7. Final withdrawal (50/50 split)
      const aliceBalanceBefore = await mockUSDC.balanceOf(alice.address);
      const bobBalanceBefore = await mockUSDC.balanceOf(bob.address);

      await aaSharing.connect(alice).withdraw(partnershipId);

      const aliceBalanceAfter = await mockUSDC.balanceOf(alice.address);
      const bobBalanceAfter = await mockUSDC.balanceOf(bob.address);

      const totalBalance = DEPOSIT_AMOUNT * 3n; // 3 deposits total
      const expectedEach = totalBalance / 2n;

      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(expectedEach);
      expect(bobBalanceAfter - bobBalanceBefore).to.equal(expectedEach);
    });

    it("Should handle cross-chain deposits", async function () {
      // 1. Create partnership
      await aaSharing.connect(alice).createPartnership(
        bob.address,
        "Alice",
        "Bob"
      );
      const partnershipId = 1;

      // 2. Initiate cross-chain deposit
      const destinationChain = 747; // Flow
      await mockUSDC.connect(alice).approve(await bridge.getAddress(), DEPOSIT_AMOUNT);
      
      const tx = await bridge.connect(alice).initiateCrossChainDeposit(
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

      // 3. Complete cross-chain deposit (simulate destination chain)
      const messageId = ethers.keccak256(ethers.toUtf8Bytes("cross_chain_test"));
      const sourceChain = 1;
      const nonce = 0;

      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256", "bytes32", "uint256"],
          [alice.address, partnershipId, DEPOSIT_AMOUNT, sourceChain, 31337, messageId, nonce]
        )
      );

      const signature = await validator.signMessage(ethers.getBytes(messageHash));

      await bridge.completeCrossChainDeposit(
        alice.address,
        partnershipId,
        DEPOSIT_AMOUNT,
        sourceChain,
        messageId,
        nonce,
        signature
      );

      // 4. Verify the deposit was completed
      expect(await bridge.getMessageStatus(messageId)).to.be.true;
    });
  });

  describe("Multiple Partnerships", function () {
    it("Should handle multiple partnerships for same user", async function () {
      // Alice partners with Bob
      await aaSharing.connect(alice).createPartnership(
        bob.address,
        "Alice",
        "Bob"
      );

      // Alice also partners with Charlie
      await aaSharing.connect(alice).createPartnership(
        charlie.address,
        "Alice",
        "Charlie"
      );

      // Check Alice's partnerships
      const alicePartnerships = await aaSharing.getUserPartnerships(alice.address);
      expect(alicePartnerships.length).to.equal(2);
      expect(alicePartnerships[0]).to.equal(1);
      expect(alicePartnerships[1]).to.equal(2);

      // Add gratitude to both partnerships
      await mockUSDC.connect(alice).approve(await aaSharing.getAddress(), DEPOSIT_AMOUNT * 2n);
      
      await aaSharing.connect(alice).addGratitude(
        1,
        "Thank you Bob!",
        DEPOSIT_AMOUNT
      );

      await aaSharing.connect(alice).addGratitude(
        2,
        "Thank you Charlie!",
        DEPOSIT_AMOUNT
      );

      // Check balances
      const partnership1 = await aaSharing.getPartnership(1);
      const partnership2 = await aaSharing.getPartnership(2);

      expect(partnership1.totalBalance).to.equal(DEPOSIT_AMOUNT);
      expect(partnership2.totalBalance).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Contract Statistics", function () {
    it("Should track contract statistics correctly", async function () {
      // Initial stats
      let stats = await aaSharing.getContractStats();
      expect(stats._totalPartnerships).to.equal(0);
      expect(stats._totalGratitudeEntries).to.equal(0);
      expect(stats._totalUSDCLocked).to.equal(0);

      // Create partnerships and add gratitude
      await aaSharing.connect(alice).createPartnership(bob.address, "Alice", "Bob");
      await aaSharing.connect(charlie).createPartnership(alice.address, "Charlie", "Alice2");

      await mockUSDC.connect(alice).approve(await aaSharing.getAddress(), DEPOSIT_AMOUNT * 3n);
      
      await aaSharing.connect(alice).addGratitude(1, "Gratitude 1", DEPOSIT_AMOUNT);
      await aaSharing.connect(alice).addGratitude(1, "Gratitude 2", DEPOSIT_AMOUNT);
      await aaSharing.connect(alice).addGratitude(2, "Gratitude 3", DEPOSIT_AMOUNT);

      // Check updated stats
      stats = await aaSharing.getContractStats();
      expect(stats._totalPartnerships).to.equal(2);
      expect(stats._totalGratitudeEntries).to.equal(3);
      expect(stats._totalUSDCLocked).to.equal(DEPOSIT_AMOUNT * 3n);
      expect(stats._contractUSDCBalance).to.equal(DEPOSIT_AMOUNT * 3n);
    });
  });

  describe("Error Handling", function () {
    it("Should handle edge cases gracefully", async function () {
      const partnershipId = 1;

      // Try to access non-existent partnership
      await expect(
        aaSharing.getPartnership(999)
      ).to.not.be.reverted; // Should return empty struct

      // Try to add gratitude to non-existent partnership
      await expect(
        aaSharing.connect(alice).addGratitude(999, "Test", 0)
      ).to.be.revertedWith("Invalid partnership ID");

      // Create partnership first
      await aaSharing.connect(alice).createPartnership(bob.address, "Alice", "Bob");

      // Try to add gratitude with very long text
      const longText = "a".repeat(501); // Over 500 character limit
      await expect(
        aaSharing.connect(alice).addGratitude(partnershipId, longText, 0)
      ).to.be.revertedWith("Gratitude text too long");

      // Try to withdraw with no balance
      await expect(
        aaSharing.connect(alice).withdraw(partnershipId)
      ).to.be.revertedWith("No funds to withdraw");
    });
  });
});