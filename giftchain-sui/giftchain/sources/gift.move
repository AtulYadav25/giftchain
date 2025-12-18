/*
/// GiftChain is a non-custodial gifting protocol on the Sui blockchain.
/// Users can wrap SUI coins into a Gift object, which can only be claimed by the intended receiver.
/// A platform fee (initially 1%) is collected on wrapping.
*/
module giftchain::gift;

use std::string::String;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;

// --- Errors ---
const ENotIntendedReceiver: u64 = 0;
const EInvalidFee: u64 = 1;
const EIncorrectFeeAmount: u64 = 2;
const EZeroGiftAmount: u64 = 3;

// --- Constants ---
const INITIAL_FEE_BPS: u64 = 100; // 1%
const MAX_FEE_BPS: u64 = 1000; // 10% safety limit

// --- Structs ---

/// Capability allowing admin actions (withdraw, update fee).
public struct AdminCap has key, store {
    id: UID,
}

/// Stores collected platform fees and current fee configuration.
public struct Treasury has key {
    id: UID,
    balance: Balance<SUI>,
    fee_bps: u64,
}

/// Represents a wrapped gift containing SUI.
/// Can only be unwrapped by the `receiver`.
public struct Gift has key {
    id: UID,
    sender: address,
    receiver: address,
    inner: Balance<SUI>,
}

// --- Events ---

public struct GiftWrapped has copy, drop {
    gift_db_id: String,
    sender: address,
    receiver: address,
    amount: u64,
    fee_deducted: u64,
}

public struct GiftClaimed has copy, drop {
    gift_db_id: String,
    claimer: address,
    amount: u64,
}

public struct TreasuryWithdrawn has copy, drop {
    amount: u64,
    recipient: address,
}

public struct FeeUpdated has copy, drop {
    old_fee_bps: u64,
    new_fee_bps: u64,
}

// --- Init ---

/// Initialize the contract: create Treasury and AdminCap.
fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    // Share the Treasury so it's accessible for fee deposits
    let treasury = Treasury {
        id: object::new(ctx),
        balance: balance::zero(),
        fee_bps: INITIAL_FEE_BPS,
    };

    transfer::transfer(admin_cap, ctx.sender());
    transfer::share_object(treasury);
}

// --- Public Functions ---

/// Wraps SUI into a Gift object for the receiver.
/// The `fee_coin` must match the required platform fee based on `gift_coin` value.
public fun wrap_gift(
    gift_coin: Coin<SUI>,
    fee_coin: &mut Coin<SUI>,
    receiver: address,
    gift_db_id: String,
    treasury: &mut Treasury,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);

    /* ----------------- Validation ----------------- */

    let gift_amount = coin::value(&gift_coin);
    assert!(gift_amount > 0, EZeroGiftAmount);

    let fee_bps = treasury.fee_bps;

    /* ---------------- Fee Calculation ---------------- */

    // Correct fee calculation (no rounding loss)
    let expected_fee = (gift_amount * fee_bps) / 10_000;

    assert!(coin::value(fee_coin) >= expected_fee, EIncorrectFeeAmount);

    /* ---------------- Fee Handling ---------------- */

    let fee = coin::split(fee_coin, expected_fee, ctx);
    balance::join(&mut treasury.balance, coin::into_balance(fee));

    /* ---------------- Gift Creation ---------------- */

    let gift = Gift {
        id: object::new(ctx),
        sender,
        receiver,
        inner: coin::into_balance(gift_coin),
    };

    transfer::transfer(gift, receiver);

    /* ---------------- Events ---------------- */

    event::emit(GiftWrapped {
        gift_db_id,
        sender,
        receiver,
        amount: gift_amount,
        fee_deducted: expected_fee,
    });
}

/// Claims a gift. Must be called by the intended receiver.
/// The gift object is destroyed and funds transferred to the caller.
public fun claim_gift(gift: Gift, gift_db_id: String, ctx: &mut TxContext) {
    let Gift { id, sender: _, receiver, inner } = gift;

    // Verify caller is the intended receiver
    assert!(ctx.sender() == receiver, ENotIntendedReceiver);

    let amount = inner.value();

    // Unwrap and send funds
    let coin = coin::from_balance(inner, ctx);
    transfer::public_transfer(coin, ctx.sender());

    // Emit event
    event::emit(GiftClaimed {
        gift_db_id,
        claimer: ctx.sender(),
        amount,
    });

    // Delete the object
    id.delete();
}

// --- Admin Functions ---

/// Withdraws SUI from the treasury.
public fun withdraw_treasury(
    _: &AdminCap,
    treasury: &mut Treasury,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let withdrawn_coin = coin::take(&mut treasury.balance, amount, ctx);

    event::emit(TreasuryWithdrawn {
        amount,
        recipient,
    });

    transfer::public_transfer(withdrawn_coin, recipient);
}

/// Updates the platform fee.
public fun update_fee(_: &AdminCap, treasury: &mut Treasury, new_fee_bps: u64) {
    assert!(new_fee_bps <= MAX_FEE_BPS, EInvalidFee);

    let old_fee_bps = treasury.fee_bps;
    treasury.fee_bps = new_fee_bps;

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
