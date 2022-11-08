import * as Web3 from "@solana/web3.js";
import * as fs from "fs";
import dotenv from "dotenv";
import { createSyncNativeInstruction, transfer } from "@solana/spl-token";
dotenv.config();

async function intializeKeyPair(
  connection: Web3.Connection
): Promise<Web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log("Console log generating KeyPair ... 🔑  ");
    const signer = Web3.Keypair.generate();
    console.log("Creating .env file 😍 ");
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey}]`);
    return signer;
  }
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const keyPair = Web3.Keypair.fromSecretKey(secretKey);
  console.log("You already have KeyPair 🎉 🎉 🎉 ");
  return keyPair;
}

async function getBalance(
  connection: Web3.Connection,
  publickKey: Web3.PublicKey
) {
  const balance: number = await connection.getBalance(publickKey);

  return balance / Web3.LAMPORTS_PER_SOL;
}

async function airdropSOL(
  connection: Web3.Connection,
  publickKey: Web3.PublicKey
) :Promise<number>{
   var balance:number = await getBalance(connection, publickKey);

  if (balance < 1) {
    const airdropSignature = await connection.requestAirdrop(
      publickKey,
      Web3.LAMPORTS_PER_SOL
    );
    console.log("Successfully Airdroped 1 SOL ✅ ");

    const block=await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash:block.blockhash,
        lastValidBlockHeight:block.lastValidBlockHeight,
        signature:airdropSignature
    })

    balance=await getBalance(connection,publickKey)
  }
  return balance;
}

export default {airdropSOL,getBalance,intializeKeyPair}




async function pingProgram(connection: Web3.Connection, payer: Web3.Keypair) {

  const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")
  const transaction = new Web3.Transaction()
  
  const instruction = new Web3.TransactionInstruction({
    // Instructions need 3 things 
    
    // 1. The public keys of all the accounts the instruction will read/write
    keys: [
      {
        pubkey: PROGRAM_DATA_PUBLIC_KEY,
        isSigner: false,
        isWritable: true
      }
    ],
    
    // 2. The ID of the program this instruction will be sent to
    programId: PROGRAM_ID,
    
    // 3. Data - in this case, there's none!
    
  })

  transaction.add(instruction)
  const transactionSignature = await Web3.sendAndConfirmTransaction(connection, transaction, [payer])

  console.log(
    `Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
}

async function sendSOL(connection:Web3.Connection,payer :Web3.Keypair,reciever:Web3.PublicKey){

  const transaction= new Web3.Transaction().add(
    Web3.SystemProgram.transfer(
      {
        fromPubkey:payer.publicKey,
        toPubkey:reciever,
        lamports:0.1*Web3.LAMPORTS_PER_SOL
      },
    

    )
  )


  const transactionSignature=await Web3.sendAndConfirmTransaction(connection,transaction,[payer]);
  console.log(
    `Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )

}

async function main() {
  const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));

  const singer = await intializeKeyPair(connection);
  console.log(`PublicKey ↪ ${singer.publicKey} `);

  console.log(
    `Balance ↪ ${await getBalance(connection, singer.publicKey)} 💸 `
  );

   console.log(
     `Balance ↪ ${await airdropSOL(connection, singer.publicKey)} 💸 `
   );

  // await pingProgram(connection,singer);
  await sendSOL(connection,singer,new Web3.PublicKey("GqDA2eP2Prb6ib2VpBbWmmpMAGbvRzvbp3QNwTbqdwXh"))
  console.log(
    `Balance ↪ ${await getBalance(connection, singer.publicKey)} 💸 `
  );
}




main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

