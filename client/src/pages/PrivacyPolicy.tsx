import React from 'react';
import { ArrowLeft, Shield, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen pb-20 font-['Lilita_One'] text-slate-900 bg-[#E3F4FF]">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-2 text-sm hover:bg-slate-50"
                >
                    <ArrowLeft size={18} strokeWidth={3} />
                    BACK TO HOME
                </button>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-[4px] border-slate-900 shadow-[10px_10px_0_0_rgba(15,23,42,1)] relative overflow-hidden">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#facc15] opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F472B6] opacity-10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    {/* Header */}
                    <header className="relative z-10 mb-12 border-b-2 border-slate-100 pb-8">
                        <div className="w-16 h-16 bg-[#60A5FA] rounded-2xl border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex items-center justify-center mb-6">
                            <Shield size={32} className="text-slate-900" />
                        </div>
                        <h1 className="text-4xl md:text-5xl text-slate-900 mb-3 tracking-wide">PRIVACY POLICY</h1>
                        <p className="text-slate-500 font-lexend font-bold text-sm uppercase tracking-wider bg-slate-100 inline-block px-3 py-1 rounded-lg border border-slate-200">
                            Last updated: January 2026
                        </p>
                    </header>

                    {/* Content */}
                    <div className="relative z-10 font-lexend text-slate-600 leading-relaxed space-y-8">

                        <section>
                            <p>
                                Giftchain is a platform that allows creators and users to send and receive crypto-based gifts using blockchain wallets. At Giftchain, your privacy is important to us, and we want you to feel confident that your personal information is handled responsibly and securely when you use our website and services.
                            </p>
                            <p className="mt-4">
                                The services are operated by ATULKUMAR YADAV, an individual based in India, hereinafter referred to as “Giftchain,” “we,” “us,” or “our.” Giftchain’s policy is to respect your privacy regarding any information we may collect while operating our website and platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#F472B6] rounded-full inline-block"></span>
                                Website Visitors
                            </h2>
                            <p>
                                Like most website operators, Giftchain collects non-personally-identifying information that web browsers and servers typically make available, such as browser type, device information, language preference, referring website, pages visited, and the date and time of each visitor request. Giftchain’s purpose in collecting this information is to better understand how visitors use the platform and to improve performance, usability, and security.
                            </p>
                            <p className="mt-4">
                                From time to time, Giftchain may analyze or review this information in aggregated form to understand usage trends. Any such aggregated statistics do not identify individual users.
                            </p>
                            <p className="mt-4">
                                Giftchain also collects potentially personally-identifying information such as Internet Protocol (IP) addresses for logged-in users and users interacting with authenticated features. These IP addresses are used for security, fraud prevention, analytics, and operational purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#4ADE80] rounded-full inline-block"></span>
                                Wallet-Based Authentication
                            </h2>
                            <p>
                                Giftchain does not use traditional email and password authentication. Access to the platform is provided through blockchain wallet connections, including wallets compatible with the Solana and Sui networks.
                            </p>
                            <p className="mt-4">
                                When you connect a wallet, you may be required to sign a cryptographic message. This signature is verified on our backend to confirm ownership of the wallet address. For this purpose, Giftchain may store your wallet address and a temporary cryptographic nonce used for verification. Giftchain never stores private keys, seed phrases, or recovery phrases.
                            </p>
                            <p className="mt-4">
                                Wallet addresses are public by nature of blockchain technology. By using Giftchain, you acknowledge that your wallet address and related transaction activity may be publicly visible on the blockchain.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#60A5FA] rounded-full inline-block"></span>
                                Gathering of Personally Identifying Information
                            </h2>
                            <p>
                                Certain interactions with Giftchain require us to collect personally identifying information. The type and amount of information collected depend on how you use the platform.
                            </p>
                            <p className="mt-4">
                                When creating or customizing a profile, you may choose to provide a username, profile bio, social links, avatar image, banner image, or other optional information. Usernames may be real names or pseudonyms, at the user’s discretion. Giftchain does not require real names and does not verify identity beyond wallet ownership.
                            </p>
                            <p className="mt-4">
                                When users send or receive gifts, Giftchain may store transaction-related metadata such as transaction hashes, blockchain network, timestamps, and associated wallet addresses. This information is necessary to display activity, prevent abuse, and maintain platform functionality.
                            </p>
                            <p className="mt-4">
                                You may always choose not to provide optional personal information; however, doing so may limit access to certain features of the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#A78BFA] rounded-full inline-block"></span>
                                Payments and Blockchain Transactions
                            </h2>
                            <p>
                                All payments on Giftchain occur directly on supported blockchains. Giftchain is a non-custodial platform and does not hold, manage, or control user funds at any time.
                            </p>
                            <p className="mt-4">
                                Blockchain transactions are irreversible by design. Giftchain cannot reverse, cancel, or modify transactions once they are confirmed on-chain. Users are solely responsible for verifying transaction details, including wallet addresses and amounts, before submitting a transaction.
                            </p>
                            <p className="mt-4">
                                Giftchain does not provide financial, investment, or legal advice. Any platform fee or processing fee, sometimes referred to as “Builder Love,” is clearly disclosed before transaction confirmation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#FB7185] rounded-full inline-block"></span>
                                Analytics
                            </h2>
                            <p>
                                Giftchain uses Google Analytics to better understand how users interact with the platform and to improve the Service. Google Analytics may collect information such as IP address, device type, browser information, and usage behavior. This data is processed in accordance with Google’s privacy policies.
                            </p>
                            <p className="mt-4">
                                In the future, Giftchain may allow creators to connect their own Google Analytics tracking IDs to their public profiles. In such cases, analytics data may be processed directly under the creator’s analytics account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#34D399] rounded-full inline-block"></span>
                                Cookies
                            </h2>
                            <p>
                                A cookie is a string of information that a website stores on a visitor’s device and that the visitor’s browser provides to the website each time the visitor returns. Giftchain uses cookies and similar technologies to authenticate sessions, maintain security, remember user preferences, and collect analytics data.
                            </p>
                            <p className="mt-4">
                                Some cookies are essential for the operation of the Service, while others are used for analytics and performance measurement. Users who do not wish to have cookies placed on their devices may configure their browser to refuse cookies; however, certain features of Giftchain may not function properly without them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#FBBF24] rounded-full inline-block"></span>
                                Protection of Information
                            </h2>
                            <p>
                                Giftchain discloses potentially personally-identifying and personally-identifying information only to employees, contractors, or service providers that need to know that information to process it on Giftchain’s behalf or to provide services related to the platform. These parties are obligated to protect the confidentiality of such information.
                            </p>
                            <p className="mt-4">
                                Giftchain does not rent or sell personal information to anyone. We may disclose personal information only when required by law, court order, governmental request, or when we believe in good faith that disclosure is reasonably necessary to protect the rights, property, or safety of Giftchain, its users, or the public.
                            </p>
                            <p className="mt-4">
                                Giftchain takes reasonable measures to protect against unauthorized access, use, alteration, or destruction of personal information; however, no method of transmission or storage is completely secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#818CF8] rounded-full inline-block"></span>
                                Data Retention and Deletion
                            </h2>
                            <p>
                                Giftchain retains personal data only for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements. Users may request deletion of their off-chain personal data by contacting us via email.
                            </p>
                            <p className="mt-4">
                                Due to the immutable nature of blockchain technology, on-chain data such as transactions and wallet addresses cannot be deleted or modified by Giftchain.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#EF4444] rounded-full inline-block"></span>
                                Age Requirement
                            </h2>
                            <p>
                                Giftchain is intended for individuals who are 18 years of age or older. By using the Service, you represent that you meet this requirement. Giftchain does not knowingly collect personal data from individuals under the age of 18.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#0EA5E9] rounded-full inline-block"></span>
                                International Users
                            </h2>
                            <p>
                                Giftchain is operated from India. If you are accessing the Service from outside India, you understand that your information may be transferred to, stored, and processed in India or other jurisdictions where our service providers operate. Data protection laws in these jurisdictions may differ from those in your country.
                            </p>
                            <p className="mt-4">
                                By using Giftchain, you consent to such transfer and processing of your information in accordance with this Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#14B8A6] rounded-full inline-block"></span>
                                Business Transfers
                            </h2>
                            <p>
                                If Giftchain or substantially all of its assets are acquired, merged, or transferred, user information may be transferred as part of that transaction. Any acquiring entity will be permitted to use your personal information in accordance with this Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#D946EF] rounded-full inline-block"></span>
                                Privacy Policy Changes
                            </h2>
                            <p>
                                Giftchain may update this Privacy Policy from time to time at its sole discretion. We encourage users to frequently review this page for any changes. Continued use of the Service after any changes constitutes acceptance of the updated Privacy Policy.
                            </p>
                        </section>

                    </div>

                    {/* Footer Contact */}
                    <div className="mt-12 bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 md:p-8 relative z-10">
                        <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-6 tracking-wide">CONTACT US</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white border-2 border-slate-200 rounded-xl">
                                    <Mail className="text-slate-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                                    <a href="mailto:atul007414@gmail.com" className="text-slate-900 font-bold hover:text-[#60A5FA] transition-colors">atul007414@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white border-2 border-slate-200 rounded-xl">
                                    <Globe className="text-slate-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Operator</div>
                                    <div className="text-slate-900 font-bold">ATULKUMAR YADAV</div>
                                    <div className="text-slate-500 text-sm">India</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy