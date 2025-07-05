const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AASharing Contract", function () {
  let aaSharing;
  let mockUSDC;
  let owner;
  let partner1;
  let partner2;
  let otherUser;
  
  const INITIAL_USDC_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC
  const USDC_AMOUNT = ethers.parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    [owner, partner1, partner2, otherUser] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.waitForDeployment();

    // Deploy AASharing
    const AASharing = await ethers.getContractFactory("AASharing");
    aaSharing = await AASharing.deploy(await mockUSDC.getAddress());
    await aaSharing.waitForDeployment();

    // Mint USDC to test users
    await mockUSDC.mint(partner1.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(partner2.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(otherUser.address, INITIAL_USDC_SUPPLY);
  });

  describe("Partnership Creation", function () {
    it("Should create a new partnership", async function () {
      const tx = await aaSharing.connect(partner1).createPartnership(
        partner2.address,
        "Alice",
        "Bob"
      );

      await expect(tx)
        .to.emit(aaSharing, "PartnershipCreated")
        .withArgs(1, partner1.address, partner2.address, "Alice", "Bob");

      const partnership = await aaSharing.getPartnership(1);
      expect(partnership.partner1).to.equal(partner1.address);
      expect(partnership.partner2).to.equal(partner2.address);
      expect(partnership.nickname1).to.equal("Alice");
      expect(partnership.nickname2).to.equal("Bob");
      expect(partnership.isActive).to.be.true;
    });

    it("Should fail to create partnership with self", async function () {
      await expect(
        aaSharing.connect(partner1).createPartnership(
          partner1.address,
          "Alice",
          "Alice"
        )
      ).to.be.revertedWith("Cannot partner with yourself");
    });

    it("Should fail with empty nicknames", async function () {
      await expect(
        aaSharing.connect(partner1).createPartnership(
          partner2.address,
          "",
          "Bob"
        )
      ).to.be.revertedWith("Nicknames required");
    });
  });

  describe("Gratitude & Funds", function () {
    let partnershipId;

    beforeEach(async function () {
      await aaSharing.connect(partner1).createPartnership(
        partner2.address,
        "Alice",
        "Bob"
      );
      partnershipId = 1;
    });

    it("Should add gratitude without USDC", async function () {
      const gratitudeText = "Thank you for being amazing!";
      
      const tx = await aaSharing.connect(partner1).addGratitude(
        partnershipId,
        gratitudeText,
        0
      );

      await expect(tx)
        .to.emit(aaSharing, "GratitudeAdded")
        .withArgs(partnershipId, partner1.address, gratitudeText, 0, await time.latest());

      const gratitudeEntries = await aaSharing.getGratitudeEntries(partnershipId);
      expect(gratitudeEntries.length).to.equal(1);
      expect(gratitudeEntries[0].text).to.equal(gratitudeText);
      expect(gratitudeEntries[0].usdcAmount).to.equal(0);
    });

    it("Should add gratitude with USDC contribution", async function () {
      // Approve USDC spending
      await mockUSDC.connect(partner1).approve(await aaSharing.getAddress(), USDC_AMOUNT);

      const gratitudeText = "Thank you for the lovely dinner!";
      
      const tx = await aaSharing.connect(partner1).addGratitude(
        partnershipId,
        gratitudeText,
        USDC_AMOUNT
      );

      await expect(tx)
        .to.emit(aaSharing, "GratitudeAdded")
        .withArgs(partnershipId, partner1.address, gratitudeText, USDC_AMOUNT, await time.latest());

      await expect(tx)
        .to.emit(aaSharing, "FundsDeposited")
        .withArgs(partnershipId, partner1.address, USDC_AMOUNT, "gratitude");

      const partnership = await aaSharing.getPartnership(partnershipId);
      expect(partnership.totalBalance).to.equal(USDC_AMOUNT);
    });

    it("Should allow direct USDC deposits", async function () {
      await mockUSDC.connect(partner2).approve(await aaSharing.getAddress(), USDC_AMOUNT);

      const tx = await aaSharing.connect(partner2).depositFunds(partnershipId, USDC_AMOUNT);

      await expect(tx)
        .to.emit(aaSharing, "FundsDeposited")
        .withArgs(partnershipId, partner2.address, USDC_AMOUNT, "direct");

      const partnership = await aaSharing.getPartnership(partnershipId);
      expect(partnership.totalBalance).to.equal(USDC_AMOUNT);
    });

    it("Should fail gratitude from non-partner", async function () {
      await expect(
        aaSharing.connect(otherUser).addGratitude(
          partnershipId,
          "I'm not a partner",
          0
        )
      ).to.be.revertedWith("Not a partner in this partnership");
    });
  });

  describe("Withdrawals", function () {
    let partnershipId;

    beforeEach(async function () {
      await aaSharing.connect(partner1).createPartnership(
        partner2.address,
        "Alice",
        "Bob"
      );
      partnershipId = 1;

      // Add funds to the partnership
      await mockUSDC.connect(partner1).approve(await aaSharing.getAddress(), USDC_AMOUNT);
      await aaSharing.connect(partner1).depositFunds(partnershipId, USDC_AMOUNT);
    });

    it("Should allow partners to withdraw 50/50 split", async function () {
      const initialBalance1 = await mockUSDC.balanceOf(partner1.address);
      const initialBalance2 = await mockUSDC.balanceOf(partner2.address);

      const tx = await aaSharing.connect(partner1).withdraw(partnershipId);

      const expectedAmount = USDC_AMOUNT / 2n;
      await expect(tx)
        .to.emit(aaSharing, "FundsWithdrawn")
        .withArgs(partnershipId, partner1.address, partner2.address, expectedAmount);

      const finalBalance1 = await mockUSDC.balanceOf(partner1.address);
      const finalBalance2 = await mockUSDC.balanceOf(partner2.address);

      expect(finalBalance1 - initialBalance1).to.equal(expectedAmount);
      expect(finalBalance2 - initialBalance2).to.equal(expectedAmount);

      const partnership = await aaSharing.getPartnership(partnershipId);
      expect(partnership.totalBalance).to.equal(0);
    });

    it("Should fail withdrawal from non-partner", async function () {
      await expect(
        aaSharing.connect(otherUser).withdraw(partnershipId)
      ).to.be.revertedWith("Not a partner in this partnership");
    });

    it("Should fail withdrawal with no funds", async function () {
      // First withdraw all funds
      await aaSharing.connect(partner1).withdraw(partnershipId);

      // Try to withdraw again
      await expect(
        aaSharing.connect(partner1).withdraw(partnershipId)
      ).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Goals", function () {
    let partnershipId;

    beforeEach(async function () {
      await aaSharing.connect(partner1).createPartnership(
        partner2.address,
        "Alice",
        "Bob"
      );
      partnershipId = 1;
    });

    it("Should create a savings goal", async function () {
      const goalName = "Vacation to Bali";
      const description = "Our dream trip together";
      const targetAmount = ethers.parseUnits("5000", 6); // 5000 USDC

      const tx = await aaSharing.connect(partner1).createGoal(
        partnershipId,
        goalName,
        description,
        targetAmount
      );

      await expect(tx)
        .to.emit(aaSharing, "GoalCreated")
        .withArgs(partnershipId, 0, goalName, targetAmount);

      const goal = await aaSharing.getGoal(partnershipId, 0);
      expect(goal.name).to.equal(goalName);
      expect(goal.description).to.equal(description);
      expect(goal.targetAmount).to.equal(targetAmount);
      expect(goal.isCompleted).to.be.false;
    });

    it("Should fail to create goal with empty name", async function () {
      await expect(
        aaSharing.connect(partner1).createGoal(
          partnershipId,
          "",
          "Description",
          ethers.parseUnits("1000", 6)
        )
      ).to.be.revertedWith("Goal name required");
    });
  });

  describe("View Functions", function () {
    let partnershipId;

    beforeEach(async function () {
      await aaSharing.connect(partner1).createPartnership(
        partner2.address,
        "Alice",
        "Bob"
      );
      partnershipId = 1;
    });

    it("Should return user partnerships", async function () {
      const partnerships1 = await aaSharing.getUserPartnerships(partner1.address);
      const partnerships2 = await aaSharing.getUserPartnerships(partner2.address);

      expect(partnerships1.length).to.equal(1);
      expect(partnerships2.length).to.equal(1);
      expect(partnerships1[0]).to.equal(partnershipId);
      expect(partnerships2[0]).to.equal(partnershipId);
    });

    it("Should return contract statistics", async function () {
      const stats = await aaSharing.getContractStats();
      
      expect(stats._totalPartnerships).to.equal(1);
      expect(stats._totalGratitudeEntries).to.equal(0);
      expect(stats._totalUSDCLocked).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause contract", async function () {
      await aaSharing.connect(owner).pause();
      
      await expect(
        aaSharing.connect(partner1).createPartnership(
          partner2.address,
          "Alice",
          "Bob"
        )
      ).to.be.revertedWithCustomError(aaSharing, "EnforcedPause");
    });

    it("Should fail pause from non-owner", async function () {
      await expect(
        aaSharing.connect(partner1).pause()
      ).to.be.revertedWithCustomError(aaSharing, "OwnableUnauthorizedAccount");
    });
  });
});

// Helper to get latest block timestamp
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
};