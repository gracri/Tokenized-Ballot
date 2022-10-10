//connects with your minter and mints tokens to an address.
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0x7E3B5668272dacFc8F15f8E08484f9CA2AC89286";
const ADDRESS = "0x6e878B50d3dA403435be5d7CEdD3d4b051792bD7";

async function main() {

    const options = {
      alchemy: process.env.ALCHEMY_API_KEY,
      infura: process.env.INFURA_API_KEY,
    };
  
    const provider = ethers.getDefaultProvider("goerli", options);
    //connect to Metamask wallet using seed phrase
    const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
    const signer = wallet.connect(provider);
    //make sure wallet contains ether
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    if(balance < 0.01) {
      throw new Error("Not enough ether");
    }
    //Get the deployed contract
    const myTokenContractFactory = await (await ethers.getContractFactory("MyToken")).connect(signer);
    const myTokenContract = await myTokenContractFactory.attach(CONTRACT_ADDRESS);

    //assign account voting power based on number of tokens. 
    const delegateTx = await myTokenContract.delegate(ADDRESS);
    await delegateTx.wait();
    const votesAfterDelegate = await myTokenContract.getVotes(ADDRESS);
    console.log(
        `After self-delegating ${ADDRESS} has a voting power of ${ethers.utils.formatEther(votesAfterDelegate)} votes\n`
    );
    //get current block
    const currentBlock = await ethers.provider .getBlock("latest");
    console.log(`The current block number is ${currentBlock.number}\n`);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });