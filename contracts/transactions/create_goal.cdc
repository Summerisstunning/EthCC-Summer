import AALedger from 0xAALedger

transaction(name: String, description: String, targetAmount: UFix64) {
    prepare(acct: AuthAccount) {
        // Get partnership collection reference
        let collectionRef = acct.borrow<&AALedger.PartnershipCollection>(
            from: AALedger.PartnershipStoragePath
        ) ?? panic("Partnership collection not found")
        
        // Get partnership keys
        let keys = collectionRef.partnerships.keys
        if keys.length == 0 {
            panic("No partnerships found")
        }
        
        // Get first partnership
        let partnershipRef = &collectionRef.partnerships[keys[0]] as &AALedger.PartnershipResource
        
        // Create goal
        partnershipRef.createGoal(
            name: name,
            description: description,
            targetAmount: targetAmount
        )
        
        log("Goal created: ".concat(name))
    }
}