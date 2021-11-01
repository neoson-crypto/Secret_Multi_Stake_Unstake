# Secret_Multi_Stake_Unstake
## Usage 

1. npm install, run `npm install`
2. duplicate `account.json.example`, rename to `account.json`
3. duplicate `.env.example`, rename to `.env`
4. ⚠️ edit `.env`, paste you main wallet address and mnemonic phrase ⚠️ 

5. Create new wallets: run `createAccounts.js` to create new wallets and store to `account.json`
	uasge:`node ./createAccounts.js <new wallet amount>`

6. Send SCRT to new wallets: 
	- modify `send.js` (following the comment plz)
		- modify `uscrtSendAmount` and `batchSize`
		- set `TEST` to `false`
	- run `node ./send.js`

7. Stake SCRT to nodes:
	- modify `stake.js` (following the comment plz)
		- modify `uscrtSendAmount` and `batchSize`
		- modify `Validator_Address`, you can find node to stake here: https://secretnodes.com/secret/chains/secret-3/validators
		- set `TEST` to `false`
	- run `node ./stake.js`

Special: UNSTAKE:
	- modify `unstake.js` (following the comment plz)
		- modify `uscrtSendAmount` and `batchSize`
		- modify `Validator_Address`, which sould be same as you stake in 
		- set `TEST` to `false`
	- run `node ./unstake.js`

P.S. `unstake.js` has not been fully tested.
