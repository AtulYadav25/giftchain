import React from 'react';
import { ArrowLeft, FileText, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#a78bfa] opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34d399] opacity-10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    {/* Header */}
                    <header className="relative z-10 mb-12 border-b-2 border-slate-100 pb-8">
                        <div className="w-16 h-16 bg-[#FBCFE8] rounded-2xl border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex items-center justify-center mb-6">
                            <FileText size={32} className="text-slate-900" />
                        </div>
                        <h1 className="text-4xl md:text-5xl text-slate-900 mb-3 tracking-wide">TERMS OF USE</h1>
                        <p className="text-slate-500 font-lexend font-bold text-sm uppercase tracking-wider bg-slate-100 inline-block px-3 py-1 rounded-lg border border-slate-200">
                            Last updated: January 2026
                        </p>
                    </header>

                    {/* Content */}
                    <div className="relative z-10 font-lexend text-slate-600 leading-relaxed space-y-8">

                        <section>
                            <p>
                                Welcome to Giftchain. These Terms of Use explain the rules and conditions for using the Giftchain website and services. When you use Giftchain, you’re agreeing to everything written here. Some parts need to be written in legal language, but we’ve done our best to keep things clear, simple, and understandable.
                            </p>
                            <p className="mt-4 font-bold text-slate-800">
                                If you do not agree with these Terms, you must not use Giftchain.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#F472B6] rounded-full inline-block"></span>
                                About Giftchain
                            </h2>
                            <p>
                                Giftchain is a Web3 platform that allows users and creators to send and receive crypto-based gifts through blockchain wallets. Giftchain is operated by ATULKUMAR YADAV, based in India. Throughout these Terms, “Giftchain,” “we,” “us,” or “our” refers to the operator of the platform.
                            </p>
                            <p className="mt-4">
                                Giftchain is a non-custodial service. We never take possession of your crypto assets and do not control your funds at any time. All transactions occur directly on supported blockchains.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#4ADE80] rounded-full inline-block"></span>
                                About Accessing the Platform
                            </h2>
                            <p>
                                You can browse certain parts of Giftchain without connecting a wallet. However, to use core features such as creating a profile, sending gifts, or receiving payments, you must connect a compatible blockchain wallet.
                            </p>
                            <p className="mt-4">
                                Giftchain does not use traditional accounts with emails or passwords. Your wallet connection acts as your identity on the platform. By connecting a wallet, you confirm that you are the lawful owner or authorized controller of that wallet.
                            </p>
                            <p className="mt-4">
                                You are responsible for all activity performed using your wallet on Giftchain. This includes signing messages, approving transactions, and interacting with smart contracts. Giftchain is not responsible for any loss caused by compromised wallets, lost private keys, or unauthorized access.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#60A5FA] rounded-full inline-block"></span>
                                Age Requirement
                            </h2>
                            <p>
                                To use Giftchain, you must be at least 18 years old, or the legal age required to enter into a binding contract in your jurisdiction. By using the Service, you confirm that you meet this requirement. We may restrict access if we believe this requirement is not met.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#A78BFA] rounded-full inline-block"></span>
                                User Profiles and Information
                            </h2>
                            <p>
                                Giftchain allows users to create public profiles that may include a username, bio, social links, profile image, banner image, and other optional information. Usernames may be real names or pseudonyms. You are solely responsible for the information you choose to display publicly.
                            </p>
                            <p className="mt-4">
                                You agree not to impersonate others, misrepresent your identity, or use names or content that are misleading, offensive, or violate the rights of others. If you do not follow these rules, Giftchain may restrict or remove your profile.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#FB7185] rounded-full inline-block"></span>
                                Things That Are Not Allowed
                            </h2>
                            <p>
                                Giftchain is used by many people, and we expect users to act responsibly. When using Giftchain, you agree that you will not break the law, violate any applicable regulations, or infringe on the rights of others.
                            </p>
                            <p className="mt-4">
                                You agree not to post or share content that is false, deceptive, fraudulent, threatening, abusive, harassing, defamatory, obscene, vulgar, sexually explicit, or otherwise inappropriate. You also agree not to use Giftchain for scams, money laundering, impersonation, or any other illegal or harmful activity.
                            </p>
                            <p className="mt-4">
                                If you receive information about other users through Giftchain, such as wallet addresses or profile details, you may only use that information for purposes related to the platform. Misuse of other users’ data is strictly prohibited.
                            </p>
                            <p className="mt-4">
                                Giftchain reserves the right to investigate violations and take action at its sole discretion, including restricting access, removing content, or blocking wallet interactions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#34D399] rounded-full inline-block"></span>
                                Gifts, Payments, and Fees
                            </h2>
                            <p>
                                All gifts and payments on Giftchain are processed directly on supported blockchains. Blockchain transactions are irreversible once confirmed. Giftchain cannot cancel, refund, or reverse transactions under any circumstances.
                            </p>
                            <p className="mt-4">
                                Sending crypto assets involves risk. You are responsible for verifying wallet addresses, transaction amounts, and network details before confirming any transaction. Giftchain is not responsible for losses resulting from user error, incorrect addresses, or blockchain-related issues.
                            </p>
                            <p className="mt-4">
                                Giftchain may charge a platform or processing fee, sometimes referred to as “Builder Love.” Any applicable fees are shown before you confirm a transaction. By completing a transaction, you agree to those fees.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#FBBF24] rounded-full inline-block"></span>
                                What We Are Not Responsible For
                            </h2>
                            <p>
                                Giftchain is not responsible for disputes between users, including disputes between senders and recipients of gifts. We do not guarantee that any user will fulfill promises, deliver content, or meet expectations.
                            </p>
                            <p className="mt-4">
                                All content and transactions accessed through Giftchain are used at your own risk. Giftchain does not endorse user content and is not liable for any damages or losses arising from your use of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#818CF8] rounded-full inline-block"></span>
                                Third-Party Services and Links
                            </h2>
                            <p>
                                Giftchain may include links to third-party websites, wallet providers, or services. Accessing third-party services is done at your own risk. We do not control or endorse these services and are not responsible for their availability, security, or behavior.
                            </p>
                            <p className="mt-4">
                                By using blockchain wallets or third-party providers, you also agree to their respective terms and policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#EF4444] rounded-full inline-block"></span>
                                Intellectual Property
                            </h2>
                            <p>
                                Giftchain’s branding, design, logos, and platform content are protected by intellectual property laws. You agree not to copy, modify, distribute, or create derivative works from Giftchain’s content without written permission.
                            </p>
                            <p className="mt-4">
                                Giftchain grants you a limited, non-exclusive, non-transferable license to use the Service solely as intended under these Terms. We may revoke this license at any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#0EA5E9] rounded-full inline-block"></span>
                                Your Content
                            </h2>
                            <p>
                                You retain ownership of the content you create and share on Giftchain. You are responsible for ensuring that your content does not infringe on any third-party rights or violate any laws.
                            </p>
                            <p className="mt-4">
                                Giftchain is not responsible for errors, omissions, or consequences arising from user-generated content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#14B8A6] rounded-full inline-block"></span>
                                Account Restriction and Termination
                            </h2>
                            <p>
                                You may stop using Giftchain at any time. Giftchain reserves the right to restrict or terminate access to the Service if you violate these Terms or engage in harmful or unlawful behavior.
                            </p>
                            <p className="mt-4">
                                Termination does not affect blockchain transactions already completed, which remain permanent and publicly visible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#D946EF] rounded-full inline-block"></span>
                                Indemnification
                            </h2>
                            <p>
                                You agree to defend, indemnify, and hold harmless Giftchain and its operator from any claims, damages, losses, liabilities, or expenses arising from your use of the Service, your content, or your violation of these Terms or applicable laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#F43F5E] rounded-full inline-block"></span>
                                Governing Law and Dispute Resolution
                            </h2>
                            <p>
                                These Terms are governed by and construed in accordance with the laws of India, without regard to conflict of law principles. We encourage users to contact us first to resolve issues before pursuing legal action.
                            </p>
                            <p className="mt-4">
                                Any disputes arising out of or related to Giftchain shall be subject to the exclusive jurisdiction of the courts located in India.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#8B5CF6] rounded-full inline-block"></span>
                                Changes to These Terms
                            </h2>
                            <p>
                                Giftchain may update these Terms from time to time. We encourage you to review this page regularly. Your continued use of the Service after changes are posted constitutes acceptance of the updated Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl text-slate-900 font-['Lilita_One'] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#10B981] rounded-full inline-block"></span>
                                Agreement Between You and Giftchain
                            </h2>
                            <p>
                                These Terms constitute the entire agreement between you and Giftchain regarding the use of the Service and supersede any prior communications or agreements. If any provision is found invalid, the remaining provisions will remain in full force and effect.
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

export default Terms