import React, { useMemo } from 'react';
import { SiX, SiInstagram, SiSnapchat, SiDiscord, SiTelegram, SiYoutube } from 'react-icons/si';
import { FaGlobe } from 'react-icons/fa';

interface SocialIconDetectorProps {
    url: string;
    className?: string; // Allow passing styles
}

export const detectPlatform = (url: string): string => {
    if (!url) return 'web';
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'x';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('snapchat.com')) return 'snapchat';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) return 'discord';
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.org')) return 'telegram';

    return 'web';
};

const SocialIconDetector: React.FC<SocialIconDetectorProps> = ({ url, className = "" }) => {
    const platform = useMemo(() => detectPlatform(url), [url]);

    const iconProps = { className: `w-5 h-5 ${className}` };

    switch (platform) {
        case 'x':
            return <SiX {...iconProps} />;
        case 'instagram':
            return <SiInstagram {...iconProps} />;
        case 'snapchat':
            return <SiSnapchat {...iconProps} />;
        case 'discord':
            return <SiDiscord {...iconProps} />;
        case 'telegram':
            return <SiTelegram {...iconProps} />;
        case 'youtube':
            return <SiYoutube {...iconProps} />;
        default:
            return <FaGlobe {...iconProps} />;
    }
};

export default SocialIconDetector;
