import AALedger from 0xAALedger

transaction(partnerAddress: Address) {
    prepare(acct: AuthAccount) {
        // Get partnership collection reference
        let collectionRef = acct.borrow<&AALedger.PartnershipCollection>(
            from: AALedger.PartnershipStoragePath
        ) ?? panic("Partnership collection not found")
        
        // Create new partnership
        let partnershipId = collectionRef.createPartnership(
            partnerA: acct.address,
            partnerB: partnerAddress
        )
        
        log("Partnership created with ID: ".concat(partnershipId.toString()))
    }
}