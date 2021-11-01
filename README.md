# Secret_Multi_Stake_Unstake

**This script is for experimental, study, and reference purposes only, and the author is not responsible for any property damage that occurs during use.**

**本脚本仅供实验、学习、参考用途，使用过程中出现任何财产损失，作者概不负责。**

## !!!! IMPORTANCE
1. Keep your `account.json` safe. All the new wallet address and mnemonic are in this file.
2. Keep your `.env` safe. You need to paste your mnemonic into this file.

## !!!! 重要提醒
1. 保管好 `account.json` 文件，因为新创建的钱包地址和 **助记词** 都存在这个文件中
2. 保护好 `.env`，因为你需要在这个文件填入你的**主钱包助记词**

## Usage 

1. npm install, run `npm install`
2. duplicate `account.json.example`, rename to `account.json`
3. duplicate `.env.example`, rename to `.env`
4. ⚠️ edit `.env`, paste you main wallet address and mnemonic phrase ⚠️ 

5. Create new wallets （创建新钱包）: run `createAccounts.js` to create new wallets and store to `account.json`
	uasge:`node ./createAccounts.js <new wallet amount>`

6. Send SCRT to new wallets（分钱包）: 
	- modify `send.js` (following the comment plz)
		- modify `uscrtSendAmount` and `batchSize`
		- set `TEST` to `false`
	- run `node ./send.js`

7. Stake SCRT to nodes （质押到节点）:
	- modify `stake.js` (following the comment plz)
		- modify `uscrtSendAmount` and `batchSize`
		- modify `Validator_Address`, you can find node to stake here: https://secretnodes.com/secret/chains/secret-3/validators
		- set `TEST` to `false`
	- run `node ./stake.js`

Special: UNSTAKE （取消质押）:
	- modify `unstake.js` (following the comment plz)
		- modify `uscrtSendAmount` and `batchSize`
		- modify `Validator_Address`, which sould be same as you stake in 
		- set `TEST` to `false`
	- run `node ./unstake.js`

P.S. `unstake.js` has not been fully tested.
