//this script connects to testnet and deploys the token contract
import {ethers} from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const TOKEN_MINT = ethers.utils.parseEther("2");

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
  //Deploy Token contract

  const myTokenContractFactory = await (await ethers.getContractFactory("MyToken")).connect(signer);
  const myTokenContract = await myTokenContractFactory.deploy();
  await myTokenContract.deployed();
  console.log(`Ballot contract was deployed to the address ${myTokenContract.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})