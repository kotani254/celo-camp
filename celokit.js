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


let sender = '0xF98F92a2B78C497F963666fd688620cd5095A251';
let receiver = '0x0E763c1Ac3BD9f6AD52D62877F677488b353DF66';
let amount = '0.2';
let privatekey = 'b9b10dd7f800bfb537ff28d4e3c3abce81f4bac90fbc480bec7909947263738f';

// Send Celo USD
sendcUSD(sender, receiver, amount, privatekey)
//Send Celo GOLD
sendcGold(sender, receiver, amount, privatekey)

//GET LATEST BLOCK NUMBER
getBlock().then(latest => {
    console.log('Latest Block:', latest.number);
})

//GET ACCOUNT BALANCE
getcGLDBalance(sender);
getcUSDBalance(sender);

  

// Generate a Public Address using BIP39 Seed Phrase
createCeloAccount()

async function createCeloAccount(){
    // TO CREATE A NEW RANDOM SEED PHRASE .....uncomment...
    // let mnemonic = bip39.generateMnemonic(256); 
    
    // USING AN EXISTING SEED PHRASE e.g from ANOTHER HD WALLET
    let mnemonic = 'zebra kangaroo suspect over crane pitch hope position people burden debate drink true evidence bargain truck column hold stone payment sight space other chapter'   ;

    console.log('mnemonic: ', mnemonic);

    let privKey = await generatePrivKey(mnemonic);
    console.log('PrivKey from @celo: ...', '0x',privKey);

    let pubkey = await getPublicKey(privKey);
    console.log('Public Key from @celo: ...', pubkey);

    let pubAdress = await getAccAddress(pubkey)
    console.log('User Address from @celo: ...', pubAdress);

    return pubAdress;
}

async function getPublicAddress(mnemonic){
    console.log('Getting your account:....')
    let privateKey = await generatePrivKey(mnemonic);
    return new Promise(resolve => { 
        resolve (getAccAddress(getPublicKey(privateKey)));
      });
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

// Get latest Block
async function getBlock() {
    return kit.web3.eth.getBlock('latest');
}

async function getcGLDBalance(address){    
    let goldtoken = await kit.contracts.getGoldToken();
    let balance = await goldtoken.balanceOf(address);
    console.log('cGOLD Balance: ',balance.toString()); 
    return balance;   
}

async function getcUSDBalance(address){    
    const stabletoken = await kit.contracts.getStableToken();
    let balance = await stabletoken.balanceOf(address);
    console.log('cUSD Balance: ',balance.toString());    
}

module.exports = {
    getcGLDBalance,
    getcUSDBalance,
    getBlock,
    sendcGold,
    sendcUSD,
    createCeloAccount
}
