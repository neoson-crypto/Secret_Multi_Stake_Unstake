require('dotenv').config();
const {
    CosmWasmClient, Secp256k1Pen, pubkeyToAddress, encodeSecp256k1Pubkey
} = require("secretjs");
const {Bip39, Random} = require("@iov/crypto");
const moment = require('moment');
const fs = require("fs");

//> create and return account
async function _create() {
    // Create random address and mnemonic
    const mnemonic = Bip39.encode(Random.getBytes(16)).toString();
    // This wraps a single keypair and allows for signing.
    const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
    // Get the public key
    const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
    // Get the wallet address
    const address = pubkeyToAddress(pubkey, 'secret');

    return {
        address,
        mnemonic,
    };
}

//> read the account json file
function _read() {
    // check if accounts.json exist
    if (!fs.existsSync('./accounts.json')) {
        // create it for first one
        fs.closeSync(fs.openSync('./accounts.json', 'w'));

        return {
            accounts: []
        };
    }

    // Read current account JSON
    var jsonData = fs.readFileSync("./accounts.json");
    return JSON.parse(jsonData);
}

function makeBackup() {
    if (!fs.existsSync('./backup')) {
        fs.mkdirSync('./backup');
    }

    return new Promise((resolve, reject) => {
        fs.copyFile('./accounts.json', `./backup/${moment().format('YYYY-MM-DD_HH:mm:ss')}_accounts.json`, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });
}

async function main() {
    var amount = process.argv[2];
    if (!amount || amount < 1) {
        console.error('error: amount required, ex. node createAccounts.js 1');
        return;
    }

    var accountList = _read();

    // make a backup first incase anything goes wrong
    await makeBackup();

    console.log("accounts before: " + accountList.accounts.length);

    for (let index = 0; index < amount; index++) {
        var account = await _create();
        accountList.accounts.push(account);
    }

    // console.log("account json: \n" + JSON.stringify(objectJSON));

    // export to JSON File
    fs.writeFile("./accounts.json", JSON.stringify(accountList), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("accounts after: " + accountList.accounts.length);
        console.log(amount + " accounts created!");
    });
}

main().then(resp => {
}).catch(err => {
    console.log(err);
})
