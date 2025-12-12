import { useEffect } from "react";
import { useAuthActions, useIsAuthenticated } from "@/store/index";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { toHex } from '@mysten/sui/utils'; // Import toHex for conversion
import type { VerifyRequestData } from "@/types/auth.types";
import useAuthStore from "@/store/useAuthStore";

export function useInitApp() {
    const account = useCurrentAccount();
    const { mutate: signPersonalMessage } = useSignPersonalMessage();
    const {
        checkSession,
        requestMessage,
        verify,
        disconnectWallet
    } = useAuthActions();


    useEffect(() => {

        const checkConnection = async () => {
            const isConnected = account?.address;

            if (isConnected) {
                try {
                    await checkSession();
                    const { isAuthenticated } = useAuthStore.getState();
                    if (!isAuthenticated) {
                        let { nonce, userId } = await requestMessage(account?.address);
                        const messageText = `Welcome To GiftChain.fun \nNonce: ${nonce}`;
                        const message = new TextEncoder().encode(messageText);

                        // Sign message with callback
                        signPersonalMessage(
                            { message },
                            {
                                onSuccess: async (result) => {
                                    const signature = result.signature;

                                    // ✅ Remove the first byte from the publicKey before sending
                                    //No need of sending public key to backend (But only used for validating the user has public key and it is sent by authorized mysten/dappkit)
                                    let publicKeyHex = toHex(new Uint8Array(account.publicKey));
                                    if (publicKeyHex.startsWith('0x')) {
                                        publicKeyHex = publicKeyHex.slice(2);
                                    }

                                    const data: VerifyRequestData = {
                                        message: Array.from(message),
                                        signature,
                                        nonce,
                                        address: account.address,
                                        userId,
                                    };

                                    await verify(data);

                                },
                                onError: (err) => {
                                    disconnectWallet();
                                }
                            }
                        );
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };

        checkConnection();
    }, [account?.address]);

}
