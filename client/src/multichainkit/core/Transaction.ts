
import { type ChainAdapter } from '../context/ChainContext';
import { createSolanaTransferTx } from '../chains/solana/solanaTx';
import { createSuiTransferTx } from '../chains/sui/suiTx';

/**
 * Transaction Abstraction Class
 * 
 * DESIGN:
 * This class abstracts the transaction creation and execution process for multiple chains.
 * It is initialized with the Active Chain Adapter (from Context), which provides the 
 * necessary connection and signing capabilities.
 * 
 * USAGE:
 * const tx = new Transaction(activeAdapter);
 * tx.sendCoins(0.1, "addr1");
 * tx.sendCoins(0.2, "addr2");
 * await tx.signAndExecute();
 */
export class Transaction {
    private adapter: ChainAdapter | null;
    private transfers: { amount: number; address: string; dbId?: string }[] = [];

    constructor(adapter: ChainAdapter | null) {
        this.adapter = adapter;
    }

    /**
     * Queue a transfer operation.
     * Can be called multiple times to bundle transfers.
     */
    sendCoins(amount: number, address: string, dbId?: string) {
        this.transfers.push({ amount, address, dbId });
    }

    /**
     * Build the transaction based on the active chain and execute it.
     */
    async signAndExecute() {
        if (!this.adapter) throw new Error("No active chain selected or wallet not connected");
        if (this.transfers.length === 0) throw new Error("No transfers to execute");

        try {
            if (this.adapter.type === 'solana') {
                return await this.handleSolana();
            } else if (this.adapter.type === 'sui') {
                return await this.handleSui();
            }
        } catch (error) {
            throw error;
        }
    }

    private async handleSolana() {
        // Adapter types are checked loosely here, but safely assumed due to structure
        const { connection, sendTransaction, publicKey } = this.adapter!;

        if (!connection || !sendTransaction || !publicKey) {
            throw new Error("Solana wallet not fully connected");
        }

        // 1. Build Native Transaction
        const tx = await createSolanaTransferTx(connection, publicKey, this.transfers);

        // 2. Sign and Send
        const signature = await sendTransaction(tx, connection);

        // Optional: wait for confirmation (not strictly required by prompt but good UX)
        await connection.confirmTransaction(signature, 'confirmed');
        return signature;
    }

    private async handleSui() {
        const { signAndExecute } = this.adapter!;
        if (!signAndExecute) {
            throw new Error("Sui wallet not connected");
        }

        // 1. Build Transaction Block
        const tx = createSuiTransferTx(this.transfers);

        // 2. Sign and Execute
        const result = await signAndExecute({
            transaction: tx,
        });

        return result.digest;
    }
    /**
     * Sign a message using the active wallet.
     */
    async signMessage(message: string): Promise<string | undefined> {
        if (!this.adapter) throw new Error("No active chain selected or wallet not connected");


        try {
            if (this.adapter.type === 'solana') {
                return await this.handleSignSolana(message);
            } else if (this.adapter.type === 'sui') {
                return await this.handleSignSui(message);
            }
        } catch (error) {
            throw error;
        }
    }

    private async handleSignSolana(message: string) {
        const { signMessage } = this.adapter!;
        if (!signMessage) throw new Error("Wallet does not support message signing");

        const encodedMessage = new TextEncoder().encode(message);
        const signature = await signMessage(encodedMessage);

        // Return as hex string since bs58 is not explicitly available
        return Array.from(signature as Uint8Array).map((b: number) => b.toString(16).padStart(2, '0')).join('');
    }

    private async handleSignSui(message: string) {
        const { signPersonalMessage } = this.adapter!;
        if (!signPersonalMessage) throw new Error("Sui wallet does not support message signing");

        const encodedMessage = new TextEncoder().encode(message);
        const result = await signPersonalMessage({ message: encodedMessage });

        return result.signature;
    }
}
