import { useState } from "react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


export default function Navbar() {
    const [isConnected, setIsConnected] = useState(false);
    // const [menuOpen, setMenuOpen] = useState(false);

    const username = "Slovi";
    const wallet = "0xab...8b5";

    return (
        <nav className="fixed top-0 left-0 px-3 w-full z-50 backdrop-blur-xl  border-b-2 text-white">
            <div className="flex items-center justify-between px-4 py-3 md:py-4 md:px-8">
                {/* Left: Logo */}
                <div className="text-xl md:text-3xl font-cherry">GiftChain</div>


                {/* Right Section */}
                <div className="flex items-center gap-4">

                    {!isConnected ? (
                        <button
                            className="px-4 font-gluten py-1 text-sm md:text-lg bg-secondary-clr rounded-lg hover:bg-secondary-clr/80 transition"
                            onClick={() => setIsConnected(true)}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-md border-blue-100">
                                <DropdownMenuLabel className="text-blue-900">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-blue-100" />
                                <DropdownMenuItem className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                                    <Link to="/profile" className="w-full">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-blue-100" />
                                <DropdownMenuItem
                                    className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                                    onClick={() => setIsConnected(false)}
                                >
                                    Disconnect
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

        </nav >
    );
}
