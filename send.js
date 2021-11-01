const {
    CosmWasmClient, EnigmaUtils, Secp256k1Pen, pubkeyToAddress, encodeSecp256k1Pubkey, makeSignBytes
} = require("secretjs");
require('dotenv').config();
const fs = require("fs");
const { stringify } = require("querystring");
const { exit } = require("process");

/************************************************************************/
/**
 * ! 使用前請確保主錢包中有足夠的 $SCRT 代幣和 Gas Fee，建議預留 1 顆 $SCRT 作為 Gas Fee
 * ! 自定義參數，需要修改
 * @TEST 默認為 true, 代表交易不廣播
 * @uscrtSendAmount 代表發送給每個地址的 uscrt 數量，1顆 $SCRT = 1000000 usdcrt
 * @batchSize 代表分發的錢包數量，理論上應該和你創建的錢包數量相同; batchSize 代表 account.json 中的頭 batchSize 個錢包獎受到代幣
 * */
const TEST = true; // 默认为 true，需要修改為 false
var uscrtSendAmount = "1000000"; // 默認為 1 顆 $SCRT
var batchSize = 0; // 默認為 0 個錢包地址，需要手動設置
/***********************************************************************/

//> read the account json file
var _read = async () => {
    // Read current account JSON
    var jsonData = fs.readFileSync("./accounts.json");
    var obj = JSON.parse(jsonData);
    var accountList = obj.accounts;
    return accountList;
}

//> query and return uscrt balance of main address
var _query = async () => {
    const client = new CosmWasmClient(process.env.SECRET_REST_URL)
    console.log("Connect to Secret Network.")
    const account = await client.getAccount(process.env.ADDRESS)
    console.log('> Account: ', account);
    // address = account.address;
    balance = account.balance;
    uscrt_balance = account.balance.filter(item => item.denom === 'uscrt')[0].amount;
    // console.log('Address: ', address);
    console.log('> balance info: ', balance);
    console.log('> uscrt_balance: ', uscrt_balance);
    return uscrt_balance;
}

// > main function
const main = async () => {
    const uscrt_balance = await _query();
    const accountList = await _read();

    // Initialize the client
    const sendAddress = process.env.ADDRESS;
    const mnemonic = process.env.MNEMONIC;
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
    const client = new CosmWasmClient(
        process.env.SECRET_REST_URL
    );

    // set fee
    const fee = {
        amount: [
            {
                amount: "50000",
                denom: "uscrt",
            },
        ],
        gas: "200000",
    };

    const chainId = await client.getChainId();
    const { accountNumber, sequence } = await client.getNonce(sendAddress);
    const messages = [];
    let i;

    if (batchSize == 0) {
        console.log("ERROR: batchSize 為 0，請手動設置需要分發的錢包數量");
        exit(-1);
    }

    if (batchSize > accountList.length) {
        console.log("ERROR: batchSize 大於 account.json 中的錢包數量，請手動減少需要分發的錢包數量");
        exit(-1);
    }

    // Create sendMsg List
    for (let i = 0; i < batchSize; i++) {
        const sendMsg = {
            type: "cosmos-sdk/MsgSend",
            value: {
                from_address: sendAddress,
                to_address: accountList[i].address,
                amount: [
                    {
                        denom: "uscrt",
                        amount: uscrtSendAmount,
                    },
                ],
            },
        };
        console.log('> sendMsg: ', sendMsg);
        console.log('> sendMsg.value.amount: ', sendMsg.value.amount);
        messages.push(sendMsg);
    };

    const memo = "Send uscrt from " + sendAddress;
    const signBytes = makeSignBytes(messages, fee, chainId, memo, accountNumber, sequence);
    const signature = await signingPen.sign(signBytes);
    const signedTx = {
        msg: messages,
        fee: fee,
        memo: memo,
        signatures: [signature],
    };

    if (TEST != true) {
        console.log("Going to post Tx......")
        const { logs, transactionHash } = await client.postTx(signedTx);
        const query = {id: transactionHash}
        const tx = await client.searchTx(query)
        console.log('Transaction Sent! : ', tx);
    } else {
        console.log(`交易未廣播，請設置 TEST = false`);
    }

}

main().then(resp => {
    // console.log(resp);
}).catch(err => {
    console.log(err);
})
