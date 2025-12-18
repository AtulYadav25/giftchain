#[test_only]
module giftchain::giftchain_tests {
    use sui::test_scenario::{Self};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string;
    use giftchain::gift::{Self, Gift, Treasury, AdminCap};

    // --- Actors ---
    const ADMIN: address = @0xA;
    const ALICE: address = @0xB;
    const BOB: address = @0xC;

    // --- Tests ---

    #[test]
    fun test_happy_path() {
        // 1. Initialize
        let mut scenario = test_scenario::begin(ADMIN);
        gift::init_for_testing(test_scenario::ctx(&mut scenario));

        // 2. Alice wraps a gift for Bob
        test_scenario::next_tx(&mut scenario, ALICE);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            
            // Alice wants to gift 100 SUI
            // Fee is 1% => 1 SUI
            let gift_coin = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            let mut fee_coin = coin::mint_for_testing<SUI>(1, test_scenario::ctx(&mut scenario));
            
            let gift_id = string::utf8(b"gift_id");
            gift::wrap_gift(gift_coin, &mut fee_coin, BOB, gift_id, &mut treasury, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(treasury);
            coin::burn_for_testing(fee_coin);
        };

        // 3. Bob claims the gift
        test_scenario::next_tx(&mut scenario, BOB);
        {
            // Verify gift exists and is owned by Bob
            let gift = test_scenario::take_from_sender<Gift>(&scenario);
            
            let gift_id = string::utf8(b"gift_id");
            gift::claim_gift(gift, gift_id, test_scenario::ctx(&mut scenario));
        };

        // 4. Verify funds received by Bob
        test_scenario::next_tx(&mut scenario, BOB);
        {
            let coin = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 100, 1);
            test_scenario::return_to_sender(&scenario, coin);
        };

        // 5. Verify Treasury collection and Admin withdrawal
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            // Withdraw the 1 SUI fee
            gift::withdraw_treasury(
                &admin_cap, 
                &mut treasury, 
                1, 
                ADMIN, 
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(treasury);
        };
        
        // 6. Verify Admin received the fee
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let coin = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1, 2);
            test_scenario::return_to_sender(&scenario, coin);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_update_fee() {
        let mut scenario = test_scenario::begin(ADMIN);
        gift::init_for_testing(test_scenario::ctx(&mut scenario));

        // 1. Admin updates fee to 5%
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            gift::update_fee(&admin_cap, &mut treasury, 500); // 500 bps = 5%
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(treasury);
        };

        // 2. Alice wraps gift
        test_scenario::next_tx(&mut scenario, ALICE);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            let gift_coin = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            let mut fee_coin = coin::mint_for_testing<SUI>(50, test_scenario::ctx(&mut scenario));
            
            // Fee 5% of 1000 = 50 SUI
            let gift_id = string::utf8(b"gift_id");
            gift::wrap_gift(gift_coin, &mut fee_coin, BOB, gift_id, &mut treasury, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(treasury);
            coin::burn_for_testing(fee_coin);
        };

        // 3. Admin checks treasury has 50 SUI
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            gift::withdraw_treasury(
                &admin_cap, 
                &mut treasury, 
                50, 
                ADMIN, 
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = giftchain::gift::EInvalidFee)]
    fun test_invalid_fee_update() {
        let mut scenario = test_scenario::begin(ADMIN);
        gift::init_for_testing(test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            // Try to set fee > 10% (1000 bps)
            gift::update_fee(&admin_cap, &mut treasury, 1001);
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(treasury);
        };
        test_scenario::end(scenario);
    }
}
