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
        id: 1,
        name: "Happy Day",
        image: Wrapper1,
        price: 0
    },
    {
        id: 2,
        name: "Spread Love",
        image: Wrapper3,
        price: 0
    },
    {
        id: 3,
        name: "Gift Day",
        image: Wrapper2,
        price: 0
    },
    {
        id: 4,
        name: "Happy Birthday",
        image: Wrapper4,
        price: 0
    },
    {
        id: 5,
        name: "Winner",
        image: PremiumWrapper1,
        price: 0.3
    }
];

// Separate Free and Premium Wrappers
let freeWrappers = allWrappers.filter(wrapper => wrapper.price === 0);
let premiumWrappers = allWrappers.filter(wrapper => wrapper.price > 0);

export { freeWrappers, premiumWrappers, allWrappers };
