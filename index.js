import express from 'express';
import Web3 from 'web3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MPContractAddress = "0x03bb285a4a43d9a964ec68d6b338016e75f52cf0";
const app = express();
const PORT = process.env.PORT || 3000;

// Load ABI
const contractABI =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reputation",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "allowPublicView",
				"type": "bool"
			}
		],
		"name": "ProfileUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_allowPublicView",
				"type": "bool"
			}
		],
		"name": "createOrUpdateProfile",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "getProfile",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "increaseReputation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
// Initialize Web3
const web3 = new Web3("https://public-node.testnet.rsk.co");

// Initialize account

const account = web3.eth.accounts.privateKeyToAccount("0x207dfeb7586d14cf3fccfe13b21fb3212d8b47e7f5acb4791d5158c0b46a350d");
web3.eth.accounts.wallet.add(account);

// Initialize contract
const contract = new web3.eth.Contract(contractABI, MPContractAddress);

console.log("Using account:", `${account.address.substring(0, 6)}...${account.address.substring(38)}`);

// Utility function to send transaction
async function sendTx(txObject) {
    const gas = await txObject.estimateGas({ from: account.address });
    const receipt = await txObject.send({
        from: account.address,
        gas: gas ,
    });
    return {
        ...receipt,
        from: `${receipt.from.substring(0, 6)}...${receipt.from.substring(38)}`,
        to: `${receipt.to.substring(0, 6)}...${receipt.to.substring(38)}`
    };
}

// GET: Create or Update Profile (always allowPublicView = true)
app.get('/createorupdate/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const allowPublicView = true; // Always true now

        console.log(`Creating or updating profile for ${username} (public view: true)`);

        const txObject = contract.methods.createOrUpdateProfile(username, allowPublicView);
        const detail = await sendTx(txObject);

        res.send({
            status: "success",
            transactionHash: detail.transactionHash,
            username,
            allowPublicView
        });
    } catch (error) {
        console.error("API Error (Create/Update Profile):", error.message);
        res.status(500).send({
            status: "error",
            message: "Failed to create/update profile",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// GET: Increase Reputation
app.get('/increasereputation/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Increasing reputation for ${username}`);

        const txObject = contract.methods.increaseReputation(username);
        const detail = await sendTx(txObject);

        res.send({
            status: "success",
            transactionHash: detail.transactionHash,
            username
        });
    } catch (error) {
        console.error("API Error (Increase Reputation):", error.message);
        res.status(500).send({
            status: "error",
            message: "Failed to increase reputation",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// GET: Get Profile
app.get('/getprofile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Fetching profile for ${username}`);

        const profile = await contract.methods.getProfile(username).call();
        console.log(profile)
        res.send({
            status: "success",
            username: profile[0],
            reputation: profile[1],
            allowPublicView: profile[2]
        });
    } catch (error) {
        console.error("API Error (Get Profile):", error.message);
        res.status(500).send({
            status: "error",
            message: "Failed to fetch profile",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Endpoints:`);
    console.log(`GET /createorupdate/:username`);
    console.log(`GET /increasereputation/:username`);
    console.log(`GET /getprofile/:username`);
});
