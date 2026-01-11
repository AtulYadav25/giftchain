import {
    Transaction,
    SystemProgram,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Buffer } from "buffer";

const MEMO_PROGRAM_ID = new PublicKey(
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

type TransferWithDbRef = {
    amount: number;
    address: string;
    dbId?: string;
};


export const createSolanaTransferTx = async (
    connection: any,
    sender: PublicKey,
    transfers: TransferWithDbRef[]
) => {
    const tx = new Transaction();

    // 1️⃣ Add transfer instructions
    transfers.forEach(({ amount, address }) => {
        tx.add(
            SystemProgram.transfer({
                fromPubkey: sender,
                toPubkey: new PublicKey(address),
                lamports: Math.floor(amount * LAMPORTS_PER_SOL),
            })
        );
    });

    // 2️⃣ Attach DB references as memo (ORDER MATTERS)
    const memoPayload = {
        type: "batch-transfer",
        giftIds: transfers
            .filter(t => t.dbId !== "platform-fee")
            .map(t => t.dbId),
    };

    tx.add({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(JSON.stringify(memoPayload), "utf8"),
    });

    // 3️⃣ Finalize tx
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = sender;

    return tx;
};
