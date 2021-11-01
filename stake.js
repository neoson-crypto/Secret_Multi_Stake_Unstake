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
 * @stakeAmount 代表每個錢包質押的 uscrt 數量，1顆 $SCRT = 1000000 usdcrt
 * @batchSize 代表分發的錢包數量，理論上應該和你創建的錢包數量相同; batchSize 代表 account.json 中的頭 batchSize 個錢包獎受到代幣
 * @Validator_Address Stake 的地址，格式為：secretvaloperXXXXX，節點列表：https://secretnodes.com/secret/chains/secret-3/validators
 * */
const TEST = true; // 默认为 true，需要修改為 false
var Stake_Amount = "1000000"; // 默認為 1 顆 $SCRT
var Validator_Address = ""
var Batch_Size = 0; // 默認為 0 個錢包地址，需要手動設置
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
var query = async (address) => {
    const client = new CosmWasmClient(process.env.SECRET_REST_URL)
    console.log("Connect!")
    const account = await client.getAccount(address)
    console.log('> Account: ', account);
    // address = account.address;
    balance = account.balance;
    uscrt_balance = account.balance.filter(item => item.denom === 'uscrt')[0].amount;
    // console.log('Address: ', address);
    console.log('> balance info: ', balance);
    console.log('> uscrt_balance: ', uscrt_balance);
    return uscrt_balance;
}

//> stake to one validator address
var _stake = async (account, _amount, _validatorAddress) => {
    var balance = query(account.address);
    var stakeAmount = _amount;

    if (balance < stakeAmount) {
        console.log("ERROR: 余额不足,需要："+ stakeAmount +" uscrt " + ",目前只有 "+ balance +" uscrt");
        exit(-1);
    }

    const mnemonic = account.mnemonic;
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
    const delegatorAddress = account.address;
    const validatorAddress = _validatorAddress;
    const client = new CosmWasmClient(process.env.SECRET_REST_URL);

    const memo = 'stake to ' + Validator_Address;

    const sendMsg ={
        "type": "cosmos-sdk/MsgDelegate",
        "value": {
            "amount": {
                "denom": "uscrt",
                "amount": stakeAmount
            },
            "delegator_address": delegatorAddress,
            "validator_address": validatorAddress
        }
    };
    console.log(">> Staking Msg: \n", sendMsg);

    const fee = {
        amount: [
            {
                amount: "67500",
                denom: "uscrt",
            },
        ],
        gas: "270000",
    };

    const chainId = await client.getChainId();
    const { accountNumber, sequence } = await client.getNonce(delegatorAddress);
    const signBytes = makeSignBytes([sendMsg], fee, chainId, memo, accountNumber, sequence);
    const signature = await signingPen.sign(signBytes);
    const signedTx = {
        msg: [sendMsg],
        fee: fee,
        memo: memo,
        signatures: [signature],
    };

    if (TEST != true) {
        console.log("Going to post Tx......")
        const { logs, transactionHash } = await client.postTx(signedTx);
        const query = {id: transactionHash}
        const tx = await client.searchTx(query)
        console.log('<!!!> Transaction Sent! : ', tx);
    } else {
        console.log(`交易未廣播，請設置 TEST = false`);
        return "null";
    }
}

const main = async () => {
    const accountList = await _read();

    if (Batch_Size == 0) {
        console.log("ERROR: batchSize 為 0，請手動設置需要分發的錢包數量");
        exit(-1);
    }
    if (Batch_Size > accountList.length) {
        console.log("ERROR: batchSize 大於 account.json 中的錢包數量，請手動減少需要分發的錢包數量");
        exit(-1);
    }
    if (Validator_Address == "") {
        console.log("ERROR: Validator_Address 為空，請手動設置 Validator_Address");
        exit(-1);
    }

    var i = 0;
     for (i = 0; i < Batch_Size; i++) {
        var account = accountList[i];
        await _stake(account, Stake_Amount, Validator_Address);
    }
}

main().then(resp => {
    // console.log(resp);
}).catch(err => {
    console.log(err);
})
