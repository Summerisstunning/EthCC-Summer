import AALedger from 0xAALedger

transaction {
    prepare(acct: AuthAccount) {
        // Check if partnership collection already exists
        if acct.borrow<&AALedger.PartnershipCollection>(from: AALedger.PartnershipStoragePath) != nil {
            return
        }

        // Create partnership collection
        let collection <- AALedger.createPartnershipCollection()
        
        // Save to storage
        acct.save(<-collection, to: AALedger.PartnershipStoragePath)
        
        // Create public capability
        acct.link<&AALedger.PartnershipCollection{AALedger.PartnershipPublic}>(
            AALedger.PartnershipPublicPath,
            target: AALedger.PartnershipStoragePath
        )
        
        log("Partnership collection setup complete")
    }
}