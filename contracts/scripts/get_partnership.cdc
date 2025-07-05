import AALedger from 0xAALedger

pub fun main(account: Address): AALedger.Partnership? {
    let publicRef = AALedger.getPartnershipPublic(account: account)
    return publicRef?.getPartnership()
}