import AALedger from 0xAALedger

transaction(content: String, amount: UFix64) {
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
        
        // Get first partnership (in production, would select specific partnership)
        let partnershipRef = &collectionRef.partnerships[keys[0]] as &AALedger.PartnershipResource
        
        // Deposit gratitude
        partnershipRef.depositGratitude(
            content: content,
            amount: amount,
            author: acct.address
        )
        
        log("Gratitude deposited: ".concat(content))
    }
}