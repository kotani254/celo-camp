'use strict';

const contractkit = require('@celo/contractkit');
const { isValidPrivate, privateToAddress, privateToPublic, pubToAddress, toChecksumAddress } = require ('ethereumjs-util');
const bip39 = require('bip39-light');
// const bigNumber = require('bignumber-to-string');

const NODE_URL = 'https://alfajores-forno.celo-testnet.org'; 

const kit = contractkit.newKit(NODE_URL);

const prettyjson = require('prettyjson');
var config = { noColor: true };

const trimLeading0x = (input) => (input.startsWith('0x') ? input.slice(2) : input);
const ensureLeading0x = (input) => (input.startsWith('0x') ? input : `0x${input}`);
const hexToBuffer = (input) => Buffer.from(trimLeading0x(input), 'hex');

//Testing run
// createAccount().then((myAddress=>{
//     console.log('My Address:', myAddress);
//     // let balance = getAccTotalBalance('myAddress');
//     // console.log(balance);
// }))


// let sender = '0xF98F92a2B78C497F963666fd688620cd5095A251';
// let receiver = '0x0E763c1Ac3BD9f6AD52D62877F677488b353DF66';
// let amount = '0.2';
// let privatekey = 'b9b10dd7f800bfb537ff28d4e3c3abce81f4bac90fbc480bec7909947263738f';
// sendcUSD(sender, receiver, amount, privatekey)

// let mnemonic = 'crush swing work toast submit sense remember runway that ball sudden wash blast pen citizen liquid style require head comic curtain original sell shield';
// // //createCeloAccount();
// // getCeloAddress(mnemonic) 
// // .then(myaddress => {console.log('Public Address: ', myaddress)});

// // getBlock().then(latest => {
// //     console.log('Latest Block:', latest.number);
// // })

// let privkey = generatePrivKey(mnemonic);
// console.log(privkey);

 // getcGLDBalance(sender).then(bal=>console.log(`${bal}`))


// console.log('Next Transfer tokens to', receiver);
//getContractAddress();
// getCeloBalances(sender);
//getMyGoldToken(sender);

// sendcGold(sender, receiver, amount, privatekey)
// .then(getcGLDBalance(sender))
// .then(getcUSDBalance(sender))
// sendcUSD(sender, receiver, 0.04, privatekey)



// getCeloBalances(sender);

  
{//...getCeloAddress()... WORKING with comments
// async function getCeloAddress(){
//     console.log('Getting your account:....')

//     let mnemonic = 'language quiz proud sample canoe trend topic upper coil rack choice engage noodle panda mutual grab shallow thrive forget trophy pull pool mask height';//     
//     console.log('mnemonic: ', mnemonic);

//     let privateKey = await generatePrivKey(mnemonic);
//     //privateKey = '0x' + privateKey
//     console.log('PrivKey from @celo: ...', privateKey);
//     let pkey = hexToBuffer(privateKey);
//     console.log('@hexToBuffer: ...', pkey);
//     pkey = privateToAddress(pkey).toString('hex');
//     console.log('@privateToAddress: ...', pkey);
//     // pkey = ensureLeading0x(pkey);
//     // console.log('@ensureLeading0x: ...', pkey);
//     pkey = toChecksumAddress(pkey);
//     console.log('@toChecksumAddress: ...', pkey);

//     let pubkeyfrmpriv = getPublicKey(privateKey);
//     console.log('@getPublicKey(): ...', pubkeyfrmpriv);

//     let newaddress = getAccAddress(pubkeyfrmpriv);
//     console.log('@getAccAddress(): ...', newaddress);
//     {
//     //let privateKeyToAddress = (privateKey) => toChecksumAddress(ensureLeading0x(privateToAddress(hexToBuffer(privateKey)).toString('hex')));
    
//     //console.log('Address: ', privateKeyToAddress);
//     //const privateKey = fs.readFileSync(SECRET_PATH, 'utf8');
//     //const account = accounts.privateKeyToAccount(privKey); //privateKey

//     //console.log(`Found account ${account.address}`)
//     //return account
//     }
// }
}

async function getPublicAddress(mnemonic){
    console.log('Getting your account:....')
    //let mnemonic = 'language quiz proud sample canoe trend topic upper coil rack choice engage noodle panda mutual grab shallow thrive forget trophy pull pool mask height';
    // let mnemonic = 'crush swing work toast submit sense remember runway that ball sudden wash blast pen citizen liquid style require head comic curtain original sell shield';
    let privateKey = await generatePrivKey(mnemonic);
    return new Promise(resolve => { 
        resolve (getAccAddress(getPublicKey(privateKey)));
      });
}

// async function createCeloAccount() {
//     console.log('Creating a new account')
//     const account = accounts.create();
//     console.log(`Made new account ${account.address}`)
//     //fs.writeFileSync(SECRET_PATH, account.privateKey)
//     console.log(account.privateKey);
//     //console.log(`Account private key saved to ${SECRET_PATH}`)
// }



async function createCeloAccount(){
    let mnemonic = bip39.generateMnemonic(256);    
    console.log('mnemonic: ', mnemonic);

    let privKey = await kit.generatePrivKey(mnemonic);
    console.log('PrivKey from @celo: ...', privKey);

    let pubkey = await getPublicKey(privKey);
    console.log('Public Key from @celo: ...', pubkey);

    let pubAdress = await getAccAddress(privKey)
    console.log('User Address from @celo: ...', pubAdress);

    return pubAdress;
}

async function generatePrivKey(mnemonic){
    return bip39.mnemonicToSeedHex(mnemonic).substr(0, 64);
}

function getPublicKey(privateKey){
    let privToPubKey = hexToBuffer(privateKey);
    privToPubKey = privateToPublic(privToPubKey).toString('hex');
    privToPubKey = ensureLeading0x(privToPubKey);
    privToPubKey = toChecksumAddress(privToPubKey);
    return privToPubKey;
}

function getAccAddress(publicKey){
    let pubKeyToAddress = hexToBuffer(publicKey);
    pubKeyToAddress = pubToAddress(pubKeyToAddress).toString('hex');
    pubKeyToAddress = ensureLeading0x(pubKeyToAddress);
    pubKeyToAddress = toChecksumAddress(pubKeyToAddress)
    return pubKeyToAddress;   
}

async function sendcGold(sender, receiver, amount, privatekey){
    kit.addAccount(privatekey)

    let goldtoken = await kit.contracts.getGoldToken()
    let tx = await goldtoken.transfer(receiver, amount).send({from: sender})
    let receipt = await tx.waitReceipt()
    console.log('Transaction Details......................\n',prettyjson.render(receipt, config))
    console.log('Transaction ID:..... ', receipt.events.Transfer.transactionHash)

    let balance = await goldtoken.balanceOf(receiver)
    console.log('cGOLD Balance: ',balance.toString())
    return receipt.events.Transfer.transactionHash;
}

async function sendcUSD(sender, receiver, amount, privatekey){
    const weiTransferAmount = kit.web3.utils.toWei(amount.toString(), 'ether')
    const stableTokenWrapper = await kit.contracts.getStableToken()

    const senderBalance = await stableTokenWrapper.balanceOf(sender) // In cUSD
    if (amount > senderBalance) {
        console.error(`Not enough funds in sender balance to fulfill request: ${amount} > ${senderBalance}`)
        return false
    }
    console.info(
        `sender balance of ${senderBalance.toString()} is sufficient to fulfill ${weiTransferAmount}`
    )

    kit.addAccount(privatekey)
    const stableTokenContract = await kit._web3Contracts.getStableToken()
    const txo = await stableTokenContract.methods.transfer(receiver, weiTransferAmount)
    const tx = await kit.sendTransactionObject(txo, { from: sender })
    console.info(`Sent tx object`)
    const hash = await tx.getHash()
    console.info(`Transferred ${amount} dollars to ${receiver}. Hash: ${hash}`)
    return hash
}

// paid gas in cUSD
async function senderFees(){
    await kit.setFeeCurrency(CeloContract.StableToken);
}

//WORKING
async function getAccTotalBalance(address){
    //await kit.web3.eth.getBalance(address)
    await kit.getTotalBalance(address)
   .then(bal=>{
       console.log(`Total Balance for account... ${address}: `, bal);
   });
}

async function buyXcGGLD(amount){
    // This is at lower price I will accept in cUSD for every cGLD
    const favorableAmount = amount
    const amountToExchange = kit.web3.utils.toWei('10', 'ether')
    const oneGold = kit.web3.utils.toWei('1', 'ether')
    const exchange = await kit.contracts.getExchange()

    const amountOfcUsd = await exchange.quoteGoldSell(oneGold)

    if (amountOfcUsd > favorableAmount) {
    const goldToken = await kit.contracts.getGoldToken()
    const approveTx = await goldToken.approve(exchange.address, amountToExchange).send()
    const approveReceipt = await approveTx.waitReceipt()

    const usdAmount = await exchange.quoteGoldSell(amountToExchange)
    const sellTx = await exchange.sellGold(amountToExchange, usdAmount).send()
    const sellReceipt = await sellTx.waitReceipt()
    }
}

async function buycGLGwithAllcUSD(){
    const stableToken = await this.contracts.getStableToken()
    const exchange = await this.contracts.getExchange()

    const cUsdBalance = await stableToken.balanceOf(myAddress)

    const approveTx = await stableToken.approve(exchange.address, cUsdBalance).send()
    const approveReceipt = await approveTx.waitReceipt()

    const goldAmount = await exchange.quoteUsdSell(cUsdBalance)
    const sellTx = await exchange.sellDollar(cUsdBalance, goldAmount).send()
    const sellReceipt = await sellTx.waitReceipt()
}

async function getContractAddress(){
    const contracts = {
        Accounts,
        Attestations,
        BlockchainParameters,
        DobleSigningSlasher,
        DowntimeSlasher,
        Election,
        Escrow,
        Exchange,
        GasPriceMinimum,
        GoldToken,
        Gobernance,
        LockedGold,
        Reserve,
        SortedOracles,
        Validators,
        StableToken,
    }
    // contracts.forEach(element => {
    //     const contractAddress = getContract(element[0]);
    //     getContract(`CeloContract.${contractAddress}`).then(contr => console.log(`Contract Address for ${contractAddress} : `,contr));
    //     //console.log(element[0],': ', contractAddress);
    // });
    getContract(celoContract.StableToken).then(contr => console.log(`Contract Address for cUSD : `,contr));
    getContract(celoContract.GoldToken).then(contr => console.log(`Contract Address for cGLD : `,contr));
    //const goldTokenAddress = await kit.registry.addressFor(CeloContract.GoldToken)
    
}

// Get latest Block
async function getBlock() {
    // return web3.eth.getBlock('latest');
    return kit.web3.eth.getBlock('latest');
}

async function getcGLDBalance(address){    
    let goldtoken = await kit.contracts.getGoldToken();
    let balance = await goldtoken.balanceOf(address);
    // console.log('cGOLD Balance: ',balance.toString()); 
    return balance;   
}

async function getcUSDBalance(address){    
    const stabletoken = await kit.contracts.getStableToken();
    let balance = await stabletoken.balanceOf(address);
    console.log('cUSD Balance: ',balance.toString());    
}

module.exports = {
    getPublicAddress,
    getcGLDBalance,
    getcUSDBalance,
    getBlock,
    getContractAddress,
    // createCeloAccount,
    sendcGold,
    sendcUSD,
    generatePrivKey
}
