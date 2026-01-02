// models/Stats.ts
import mongoose from 'mongoose';

const StatsSchema = new mongoose.Schema({
    cacheId: {
        type: String,
        required: true, // fixed ID
    },
    totalAmountUSD: {
        type: Number,
        default: 0,
    },
    totalGiftsSent: {
        type: Number,
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export const Stats = mongoose.model('Stats', StatsSchema);
