module giftchain::gift;

use std::string::String;
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;

// --- Errors ---
const EInvalidFee: u64 = 1;
const EIncorrectFeeAmount: u64 = 2;
const EZeroGiftAmount: u64 = 3;

// --- Constants ---
const INITIAL_FEE_BPS: u64 = 100; // 1%
const MAX_FEE_BPS: u64 = 1000; // 10% safety limit

// --- Structs ---

/// Capability allowing admin actions (update fee).
public struct AdminCap has key, store {
    id: UID,
}

/// Stores configuration: treasury address and fee bps.
public struct GiftConfig has key {
    id: UID,
    treasury_address: address,
    fee_bps: u64,
}

// --- Events ---

public struct GiftSent has copy, drop {
    gift_db_id: String, //Id of Mongodb Gift Document
    sender: address,
    receiver: address,
    amount: u64,
    fee_deducted: u64,
}

public struct FeeUpdated has copy, drop {
    old_fee_bps: u64,
    new_fee_bps: u64,
}

// --- Init ---

/// Initialize the contract: create GiftConfig and AdminCap.
fun init(ctx: &mut TxContext) {
    let deployer = ctx.sender();

    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    // Share the Config
    let config = GiftConfig {
        id: object::new(ctx),
        treasury_address: deployer,
        fee_bps: INITIAL_FEE_BPS,
    };

    transfer::transfer(admin_cap, deployer);
    transfer::share_object(config);
}

// --- Public Functions ---

/// Wraps SUI into a Gift object for the receiver.
/// The `fee_coin` must match the required platform fee based on `gift_coin` value.
public fun wrap_gift(
    gift_coin: Coin<SUI>,
    fee_coin: &mut Coin<SUI>,
    receiver: address,
    gift_db_id: String,
    config: &GiftConfig,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);

    /* ----------------- Validation ----------------- */

    let gift_amount = coin::value(&gift_coin);
    assert!(gift_amount > 0, EZeroGiftAmount);

    let fee_bps = config.fee_bps;

    /* ---------------- Fee Calculation ---------------- */

    // Correct fee calculation (no rounding loss)
    let expected_fee = (gift_amount * fee_bps) / 10_000;

    assert!(coin::value(fee_coin) >= expected_fee, EIncorrectFeeAmount);

    /* ---------------- Fee Handling ---------------- */

    let fee = coin::split(fee_coin, expected_fee, ctx);
    transfer::public_transfer(fee, config.treasury_address);

    /* ---------------- Gift Sending ---------------- */

    transfer::public_transfer(gift_coin, receiver);


    /* ---------------- Events ---------------- */

    event::emit(GiftSent {
        gift_db_id,
        sender,
        receiver,
        amount: gift_amount,
        fee_deducted: expected_fee,
    });
}

// --- Admin Functions ---

/// Updates the platform fee.
public fun update_fee(_: &AdminCap, config: &mut GiftConfig, new_fee_bps: u64) {
    assert!(new_fee_bps <= MAX_FEE_BPS, EInvalidFee);

    let old_fee_bps = config.fee_bps;
    config.fee_bps = new_fee_bps;

    event::emit(FeeUpdated {
        old_fee_bps,
        new_fee_bps,
    });
}

// --- Test Helpers ---

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
