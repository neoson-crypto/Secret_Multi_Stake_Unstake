const {
  CosmWasmClient, Secp256k1Pen, pubkeyToAddress, encodeSecp256k1Pubkey
} = require("secretjs");
const { Bip39, Random } = require("@iov/crypto");
require('dotenv').config();
const fs = require("fs");

//> create and return account
var _create = async () => {
    // Create random address and mnemonic
  const mnemonic = Bip39.encode(Random.getBytes(16)).toString();
  // This wraps a single keypair and allows for signing.
  const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
  // Get the public key
  const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
  // Get the wallet address
  const accAddress = pubkeyToAddress(pubkey, 'secret');

    var account = {
        "address":"",
        "mnemonic":"",
    };

    account.address = accAddress;
    account.mnemonic = mnemonic;

    return account;
}

//> read the account json file
var _read = async () => {
    // Read current account JSON
    var jsonData = fs.readFileSync("./accounts.json");
    var obj = JSON.parse(jsonData);
    var accountList = obj.accounts;
    return accountList;
}

var main = async () => {
    var amount = process.argv[2];
    var accountList = await _read();
    console.log("accounts before: " + accountList.length);

    for (let index = 0; index < amount; index++) {
        var account = await _create();
        accountList.push(account);
    }

    var objectJSON = {
    "accounts": accountList
    }
    // console.log("account json: \n" + JSON.stringify(objectJSON));

    // export to JSON File
    fs.writeFile("./accounts.json", JSON.stringify(objectJSON), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log(amount + " accounts created!");
    });

    console.log("accounts after: " + accountList.length);
}

main().then(resp => {
}).catch(err => {
  console.log(err);
})
