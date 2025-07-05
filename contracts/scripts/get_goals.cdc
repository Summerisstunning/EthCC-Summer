import AALedger from 0xAALedger

pub fun main(account: Address): {String: AALedger.Goal}? {
    let publicRef = AALedger.getPartnershipPublic(account: account)
    return publicRef?.getGoals()
}