import { useEffect } from "react";
import { useAuthActions } from "@/store/index";
import type { VerifyRequestData } from "@/types/auth.types";
import useAuthStore from "@/store/useAuthStore";
import { Transaction } from '@/multichainkit/core/Transaction';
import { useChain } from '@/multichainkit/context/ChainContext';
// import toast from "react-hot-toast";

export function useInitApp() {

    const { chain, address, activeAdapter } = useChain();

    if (!chain) return null;

    const {
        checkSession,
        requestMessage,
        verify
    } = useAuthActions();


    useEffect(() => {

        const checkConnection = async () => {
            const isConnected = address;

            if (isConnected) {
                try {
                    await checkSession();
                    const { isAuthenticated } = useAuthStore.getState();
                    if (!isAuthenticated) {
                        let { nonce, userId } = await requestMessage(address, chain === 'solana' ? 'sol' : 'sui');
                        const messageText = `Welcome To GiftChain.fun \nNonce: ${nonce}`;
                        const message = new TextEncoder().encode(messageText);

                        if (!activeAdapter) {
                            // toast.error("Please Connect Your Wallet")
                            return;
                        }

                        // toast.loading("Signing message...");

                        try {
                            const tx = new Transaction(activeAdapter);
                            const signature = await tx.signMessage(messageText);

                            if (signature) {
                                const data: VerifyRequestData = {
                                    message: Array.from(message),
                                    signature,
                                    nonce,
                                    address,
                                    userId,
                                    chain: chain === 'solana' ? 'sol' : 'sui',
                                };

                                await verify(data);
                            }
                        } catch (e: any) {
                        }

                    }
                } catch (error) {
                }
            }
        };

        checkConnection();
    }, [address, chain]);

}
