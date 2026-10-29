import pytest
from mobile_data_plan import overage_charge, recharge_allowed, validity_status


# ==========================================
# Tests for overage_charge (Branch Coverage)
# ==========================================

def test_plan_not_in_included_gb_true():
    # Branch: plan not in INCLUDED_GB -> True (Line 5 -> 6)
    with pytest.raises(ValueError, match="unknown plan"):
        overage_charge("super_deluxe", 5, False, False)


def test_plan_not_in_included_gb_false_and_data_gb_negative_true():
    # Branch: plan valid (False for Line 5), data_gb < 0 -> True (Line 7 -> 8)
    with pytest.raises(ValueError, match="invalid data usage"):
        overage_charge("basic", -0.5, False, False)


def test_data_gb_negative_false_and_no_loyalty():
    # Branch: data_gb >= 0 (False for Line 7), is_loyal -> False (Line 10 -> 12)
    # Also extra <= 0 -> True (Line 13 -> 14)
    assert overage_charge("basic", 1.5, False, False) == 0


def test_loyal_non_premium():
    # Branch: is_loyal -> True, plan != "premium" -> True (Line 10 -> 11)
    # basic included = 2 + 1 = 3 GB; usage = 3.0 -> extra = 0 <= 0 -> True (Line 13 -> 14)
    assert overage_charge("basic", 3.0, False, True) == 0


def test_loyal_premium():
    # Branch: is_loyal -> True, plan != "premium" -> False (Line 10 -> 12)
    # premium included = 10; usage = 10.0 -> extra = 0 <= 0 -> True
    assert overage_charge("premium", 10.0, False, True) == 0


def test_overage_non_roaming_extra_less_than_equal_10():
    # Branches:
    # - extra <= 0 -> False (Line 13)
    # - is_roaming -> False (Line 15 -> 18)
    # - extra > 10 -> False (Line 19 -> 23)
    # standard included = 5; usage = 7 -> extra = 2; rate = 15 -> 2 * 15 = 30
    assert overage_charge("standard", 7, False, False) == 30


def test_overage_roaming_extra_less_than_equal_10():
    # Branches:
    # - is_roaming -> True (Line 15 -> 16)
    # - extra > 10 -> False (Line 19 -> 23)
    # standard included = 5; usage = 8 -> extra = 3; rate = 40 -> 3 * 40 = 120
    assert overage_charge("standard", 8, True, False) == 120


def test_overage_non_roaming_extra_greater_than_10():
    # Branches:
    # - is_roaming -> False (Line 15 -> 18)
    # - extra > 10 -> True (Line 19 -> 20)
    # - is_roaming inside extra > 10 -> False (Line 21 -> 23)
    # basic included = 2; usage = 14 -> extra = 12; rate = 15 + 10 = 25 -> 12 * 25 = 300
    assert overage_charge("basic", 14, False, False) == 300


def test_overage_roaming_extra_greater_than_10():
    # Branches:
    # - is_roaming -> True (Line 15 -> 16)
    # - extra > 10 -> True (Line 19 -> 20)
    # - is_roaming inside extra > 10 -> True (Line 21 -> 22)
    # basic included = 2; usage = 15 -> extra = 13; rate = 40 + 10 + 5 = 55 -> 13 * 55 = 715
    assert overage_charge("basic", 15, True, False) == 715


# ============================================
# Tests for recharge_allowed (Branch Coverage)
# ============================================

def test_kyc_pending_amount_within_limit_branch():
    # Branch: is_kyc_pending -> True, amount <= 200 -> True (Line 27 -> 28)
    assert recharge_allowed(200, 0, True) is True


def test_kyc_pending_amount_above_limit_branch():
    # Branch: is_kyc_pending -> True, amount <= 200 -> False (Line 27 -> 28)
    assert recharge_allowed(201, 0, True) is False


def test_no_kyc_amount_exceeds_max_limit_branch():
    # Branch: is_kyc_pending -> False, amount > 2000 -> True (Line 29 -> 30)
    assert recharge_allowed(2001, 0, False) is False


def test_no_kyc_amount_within_max_pending_within_limit_branch():
    # Branch: is_kyc_pending -> False, amount > 2000 -> False, pending_recharges <= 2 -> True (Line 31)
    assert recharge_allowed(2000, 2, False) is True


def test_no_kyc_amount_within_max_pending_exceeded_branch():
    # Branch: is_kyc_pending -> False, amount > 2000 -> False, pending_recharges <= 2 -> False (Line 31)
    assert recharge_allowed(1000, 3, False) is False


# ===========================================
# Tests for validity_status (Branch Coverage)
# ===========================================

def test_validity_prepaid_no_addon_active():
    # Branches:
    # - is_prepaid -> True (Line 35 -> 36: cutoff = 0)
    # - has_addon -> False (Line 39 -> 41)
    # - days_left >= cutoff -> True (Line 41 -> 42)
    assert validity_status(0, True, False) == "active"


def test_validity_postpaid_with_addon_active():
    # Branches:
    # - is_prepaid -> False (Line 35 -> 38: cutoff = 3)
    # - has_addon -> True (Line 39 -> 40: cutoff = 5)
    # - days_left >= cutoff -> True (Line 41 -> 42)
    assert validity_status(5, False, True) == "active"


def test_validity_prepaid_grace_boundary():
    # Branches:
    # - is_prepaid -> True, has_addon -> False -> cutoff = 0
    # - days_left >= cutoff -> False (Line 41)
    # - days_left >= cutoff - 15 -> True (Line 43 -> 44)
    assert validity_status(-1, True, False) == "grace"
    assert validity_status(-15, True, False) == "grace"


def test_validity_prepaid_expired_branch():
    # Branches:
    # - days_left >= cutoff -> False
    # - days_left >= cutoff - 15 -> False (Line 43 -> 45)
    assert validity_status(-16, True, False) == "expired"
