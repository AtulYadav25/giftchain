// Free Wrappers
import Wrapper1 from "./free/Wrapper1.webp";
import Wrapper2 from "./free/Wrapper2.webp";
import Wrapper3 from "./free/Wrapper3.webp";
import Wrapper4 from "./free/Wrapper4.webp";

// Premium Wrappers
import PremiumWrapper1 from "./premium/PremiumWrapper1.png";

// Types
import { type Wrapper } from "@/types/WrapperTypes";

// Wrappers Array (all)
let allWrappers: Wrapper[] = [
    {
        _id: 1,
        name: "Happy Day",
        wrapperImg: Wrapper1,
        priceUSD: 0
    },
    {
        _id: 2,
        name: "Spread Love",
        wrapperImg: Wrapper3,
        priceUSD: 0
    },
    {
        _id: 3,
        name: "Gift Day",
        wrapperImg: Wrapper2,
        priceUSD: 0
    },
    {
        _id: 4,
        name: "Happy Birthday",
        wrapperImg: Wrapper4,
        priceUSD: 0
    },
    {
        _id: 5,
        name: "Winner",
        wrapperImg: PremiumWrapper1,
        priceUSD: 0.3
    }
];

// Separate Free and Premium Wrappers
let freeWrappers = allWrappers.filter(wrapper => wrapper.priceUSD === 0);
let premiumWrappers = allWrappers.filter(wrapper => wrapper.priceUSD > 0);

export { freeWrappers, premiumWrappers, allWrappers };
