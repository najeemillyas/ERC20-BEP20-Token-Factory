require('dotenv').config();
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

module.exports = async function (callback) {
    try {
        // Load environment variables
        const privateKey = process.env.PRIVATE_KEY;
        const bscTestnetUrl = process.env.BSC_TESTNET_URL;

        // Validate environment variables
        if (!privateKey || !bscTestnetUrl) {
            throw new Error('Please ensure PRIVATE_KEY and BSC_TESTNET_URL are set in the .env file');
        }

        // Define the contract path
        const contractPath = path.resolve(__dirname, './build/contracts/TokenMintERC20Token.json');

        // Validate contract path
        if (!fs.existsSync(contractPath)) {
            throw new Error(`Contract ABI file not found at path: ${contractPath}`);
        }

        // Load contract ABI
        const tokenABI = JSON.parse(fs.readFileSync(contractPath, 'utf8')).abi;

        // Create provider
        const provider = new HDWalletProvider({
            privateKeys: [privateKey],
            providerOrUrl: bscTestnetUrl
        });
        const web3 = new Web3(provider);

        // Specific contract address
        const contractAddress = '0x1d966E407f7ecFd5a55BCf6258a353Ff2560Dc49';

        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }
        console.log(`Using account: ${accounts[0]}`);

        const token = new web3.eth.Contract(tokenABI, contractAddress);
        console.log(`Connected to contract at: ${contractAddress}`);

        // Define the investor addresses and the corresponding token amounts
        const decimals = 18; // Adjust this to match your token's decimals
        const investors = [
            { address: '0x8BB222C0EEa48Fa6Da6870Dc2ed448E9B98906Ef', amount: web3.utils.toBN(web3.utils.toWei('100000', 'ether')) }, // 100000 tokens
            { address: '0xC9D1452cdA2d6E8E5a7c12A536Df4a27307f6b3F', amount: web3.utils.toBN(web3.utils.toWei('500000', 'ether')) }, // 500000 tokens
            { address: '0x14ccF15D6b9cc06d039Dea39EC3cD5233628280C', amount: web3.utils.toBN(web3.utils.toWei('10000000', 'ether')) }, // 10000000 tokens
            { address: '0xf4bFE5Ba904dD8c8a9E3a7A776735760b30B6813', amount: web3.utils.toBN(web3.utils.toWei('5000', 'ether')) } // 5000 tokens
        ];

        // Transfer tokens to each investor
        for (const investor of investors) {
            try {
                await token.methods.transfer(investor.address, investor.amount).send({ from: accounts[0] });
                console.log(`Transferred ${web3.utils.fromWei(investor.amount, 'ether')} tokens to ${investor.address}`);
            } catch (error) {
                console.error(`Failed to transfer tokens to ${investor.address}:`, error);
            }
        }

        callback();
    } catch (error) {
        console.error('Error during token transfers:', error);
        callback(error);
    }
};
