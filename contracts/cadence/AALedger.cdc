import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

pub contract AALedger {
    
    // Events
    pub event GratitudeDeposited(partnershipId: UInt64, amount: UFix64, content: String)
    pub event FundsSplit(partnershipId: UInt64, amount: UFix64)
    pub event GoalCreated(partnershipId: UInt64, goalName: String, targetAmount: UFix64)
    pub event GoalUpdated(partnershipId: UInt64, goalName: String, currentAmount: UFix64)
    
    // Partnership struct
    pub struct Partnership {
        pub let id: UInt64
        pub let partnerA: Address
        pub let partnerB: Address
        pub var walletBalance: UFix64
        pub var goals: {String: Goal}
        pub var gratitudeEntries: [GratitudeEntry]
        pub var isActive: Bool
        
        init(id: UInt64, partnerA: Address, partnerB: Address) {
            self.id = id
            self.partnerA = partnerA
            self.partnerB = partnerB
            self.walletBalance = 0.0
            self.goals = {}
            self.gratitudeEntries = []
            self.isActive = true
        }
        
        pub fun addGratitude(entry: GratitudeEntry) {
            self.gratitudeEntries.append(entry)
            self.walletBalance = self.walletBalance + entry.amount
        }
        
        pub fun addGoal(name: String, goal: Goal) {
            self.goals[name] = goal
        }
        
        pub fun updateGoalProgress(name: String, amount: UFix64) {
            if let goal = self.goals[name] {
                goal.updateProgress(amount)
                self.goals[name] = goal
            }
        }
        
        pub fun splitFunds(): UFix64 {
            let halfBalance = self.walletBalance / 2.0
            self.walletBalance = 0.0
            self.isActive = false
            return halfBalance
        }
    }
    
    // Goal struct
    pub struct Goal {
        pub let name: String
        pub let description: String
        pub let targetAmount: UFix64
        pub var currentAmount: UFix64
        pub var isCompleted: Bool
        pub let createdAt: UFix64
        
        init(name: String, description: String, targetAmount: UFix64) {
            self.name = name
            self.description = description
            self.targetAmount = targetAmount
            self.currentAmount = 0.0
            self.isCompleted = false
            self.createdAt = getCurrentBlock().timestamp
        }
        
        pub fun updateProgress(amount: UFix64) {
            self.currentAmount = self.currentAmount + amount
            if self.currentAmount >= self.targetAmount {
                self.isCompleted = true
            }
        }
        
        pub fun getProgress(): UFix64 {
            return self.currentAmount / self.targetAmount
        }
    }
    
    // Gratitude Entry struct
    pub struct GratitudeEntry {
        pub let content: String
        pub let amount: UFix64
        pub let timestamp: UFix64
        pub let author: Address
        
        init(content: String, amount: UFix64, author: Address) {
            self.content = content
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
            self.author = author
        }
    }
    
    // Storage paths
    pub let PartnershipStoragePath: StoragePath
    pub let PartnershipPublicPath: PublicPath
    
    // Partnership resource
    pub resource PartnershipResource {
        pub let partnership: Partnership
        
        init(partnership: Partnership) {
            self.partnership = partnership
        }
        
        pub fun depositGratitude(content: String, amount: UFix64, author: Address) {
            let entry = GratitudeEntry(content: content, amount: amount, author: author)
            self.partnership.addGratitude(entry: entry)
            
            emit GratitudeDeposited(
                partnershipId: self.partnership.id,
                amount: amount,
                content: content
            )
        }
        
        pub fun createGoal(name: String, description: String, targetAmount: UFix64) {
            let goal = Goal(name: name, description: description, targetAmount: targetAmount)
            self.partnership.addGoal(name: name, goal: goal)
            
            emit GoalCreated(
                partnershipId: self.partnership.id,
                goalName: name,
                targetAmount: targetAmount
            )
        }
        
        pub fun contributeToGoal(goalName: String, amount: UFix64) {
            self.partnership.updateGoalProgress(name: goalName, amount: amount)
            self.partnership.walletBalance = self.partnership.walletBalance + amount
            
            emit GoalUpdated(
                partnershipId: self.partnership.id,
                goalName: goalName,
                currentAmount: self.partnership.goals[goalName]?.currentAmount ?? 0.0
            )
        }
        
        pub fun splitFunds(): UFix64 {
            let splitAmount = self.partnership.splitFunds()
            
            emit FundsSplit(
                partnershipId: self.partnership.id,
                amount: splitAmount
            )
            
            return splitAmount
        }
        
        pub fun getPartnership(): Partnership {
            return self.partnership
        }
    }
    
    // Public interface
    pub resource interface PartnershipPublic {
        pub fun getPartnership(): Partnership
        pub fun getBalance(): UFix64
        pub fun getGoals(): {String: Goal}
        pub fun getGratitudeEntries(): [GratitudeEntry]
    }
    
    // Partnership Collection
    pub resource PartnershipCollection: PartnershipPublic {
        pub var partnerships: @{UInt64: PartnershipResource}
        
        init() {
            self.partnerships <- {}
        }
        
        pub fun createPartnership(partnerA: Address, partnerB: Address): UInt64 {
            let partnershipId = UInt64(self.partnerships.length)
            let partnership = Partnership(id: partnershipId, partnerA: partnerA, partnerB: partnerB)
            let resource <- create PartnershipResource(partnership: partnership)
            
            self.partnerships[partnershipId] <-! resource
            return partnershipId
        }
        
        pub fun getPartnership(): Partnership {
            // Return the first partnership for simplicity
            // In production, you'd want to handle multiple partnerships
            let keys = self.partnerships.keys
            if keys.length > 0 {
                return self.partnerships[keys[0]]?.getPartnership()!
            }
            panic("No partnerships found")
        }
        
        pub fun getBalance(): UFix64 {
            return self.getPartnership().walletBalance
        }
        
        pub fun getGoals(): {String: Goal} {
            return self.getPartnership().goals
        }
        
        pub fun getGratitudeEntries(): [GratitudeEntry] {
            return self.getPartnership().gratitudeEntries
        }
        
        destroy() {
            destroy self.partnerships
        }
    }
    
    // Contract variables
    pub var totalPartnerships: UInt64
    
    init() {
        self.totalPartnerships = 0
        
        self.PartnershipStoragePath = /storage/AALedgerPartnership
        self.PartnershipPublicPath = /public/AALedgerPartnership
    }
    
    // Public functions
    pub fun createPartnershipCollection(): @PartnershipCollection {
        return <- create PartnershipCollection()
    }
    
    pub fun getPartnershipPublic(account: Address): &PartnershipCollection{PartnershipPublic}? {
        return getAccount(account).getCapability(self.PartnershipPublicPath)
            .borrow<&PartnershipCollection{PartnershipPublic}>()
    }
}