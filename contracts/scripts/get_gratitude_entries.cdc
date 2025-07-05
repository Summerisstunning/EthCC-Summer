import AALedger from 0xAALedger

pub fun main(account: Address): [AALedger.GratitudeEntry]? {
    let publicRef = AALedger.getPartnershipPublic(account: account)
    return publicRef?.getGratitudeEntries()
}