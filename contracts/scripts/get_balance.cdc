import AALedger from 0xAALedger

pub fun main(account: Address): UFix64? {
    let publicRef = AALedger.getPartnershipPublic(account: account)
    return publicRef?.getBalance()
}