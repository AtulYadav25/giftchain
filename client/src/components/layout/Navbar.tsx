import { useState } from "react";
import { Link } from "react-router-dom";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { LogOut, Wallet } from "lucide-react";

import NavbarBg from '@/assets/hero/navbar1.webp'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Navbar() {

    const [openDisconnectModal, setOpenDisconnectModal] = useState(false);

    const currentAccount = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();

    let isConnected = currentAccount?.address;
    let currentUserAddress = currentAccount?.address;

    const disconnectWallet = () => {
        disconnect();
        setOpenDisconnectModal(false);
    };

    return (
        <nav className="fixed top-0 left-0 px-3 w-full z-50 backdrop-blur-xl text-white">

            <div className="flex items-center justify-between px-4 py-3 md:py-4 md:px-8">

                {/* Logo */}
                <div className="text-xl md:text-3xl font-cherry">GiftChain.fun</div>

                {/* Right Section */}
                <div className="flex items-center gap-4">

                    {/* NOT CONNECTED */}
                    {!isConnected ? (
                        <ConnectModal
                            trigger={
                                <button
                                    className="px-4 flex items-center gap-2 font-gluten py-1 text-sm md:text-lg bg-secondary-clr rounded-lg hover:bg-secondary-clr/80 transition"
                                >
                                    <Wallet className="h-4 w-4" /> Connect Wallet
                                </button>
                            }
                        />
                    ) : (
                        <>
                            {/* Avatar */}
                            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=lepil" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>

                            {/* Address Button → Opens Modal */}
                            <button
                                onClick={() => setOpenDisconnectModal(true)}
                                className="px-4 flex items-center gap-2 font-gluten py-1 text-sm md:text-md bg-secondary-clr rounded-lg hover:bg-secondary-clr/80 transition"
                            >
                                {currentUserAddress?.slice(0, 6) + "..." + currentUserAddress?.slice(-4)}
                                <LogOut className="h-4 w-4 text-white hover:text-red-400" />
                            </button>

                            {/* Disconnect Confirmation Modal */}
                            <Dialog open={openDisconnectModal} onOpenChange={setOpenDisconnectModal}>
                                <DialogContent className="text-black font-gluten">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Are you sure you want to disconnect your wallet?
                                        </DialogTitle>
                                    </DialogHeader>

                                    <DialogFooter className="mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setOpenDisconnectModal(false)}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            onClick={disconnectWallet}
                                        >
                                            Disconnect
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}

                </div>
            </div>
        </nav>
    );
}
