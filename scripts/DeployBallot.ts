//deploys the ballot. Provides the address of the deployed token as parameter.
import { ethers } from "hardhat";
import { TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {

  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: process.env.INFURA_API_KEY,
  };

  const provider = ethers.getDefaultProvider("goerli", options);
  //connect to Metamask wallet using seed phrase
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  console.log(`Using address ${wallet.address}`);
  const signer = wallet.connect(provider);
  //make sure wallet contains ether
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  if(balance < 0.01) {
    throw new Error("Not enough ether");
  }
  //Deploy Ballot contract
  console.log("Deploying Ballot contract");
  const ballotFactory = new TokenizedBallot__factory(signer);
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS), "0x7E3B5668272dacFc8F15f8E08484f9CA2AC89286", 7742499
  );
  await ballotContract.deployed();
  console.log(`Tokenized Ballot contract was deployed to the address ${ballotContract.address}`);
}

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});