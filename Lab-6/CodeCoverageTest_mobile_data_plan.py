import pytest
from mobile_data_plan import overage_charge, recharge_allowed, validity_status


# Tests for overage_charge
def test_unknown_plan_raises_value_error():
    with pytest.raises(ValueError, match="unknown plan"):
        overage_charge("unlimited", 5, False, False)


def test_invalid_data_usage_raises_value_error():
    with pytest.raises(ValueError, match="invalid data usage"):
        overage_charge("basic", -1, False, False)


def test_within_included_data():
    assert overage_charge("standard", 3, False, False) == 0


def test_loyal_customer_included_bonus():
    # basic includes 2 GB + 1 GB loyal = 3 GB; 3 GB used -> 0 extra
    assert overage_charge("basic", 3, False, True) == 0


def test_overage_non_roaming_normal():
    # basic (2 GB), 4 GB used -> 2 GB extra * 15 = 30
    assert overage_charge("basic", 4, False, False) == 30


def test_overage_roaming_high_usage():
    # standard (5 GB), 17 GB used -> 12 GB extra
    # rate = 40 (roaming) + 10 (extra > 10) + 5 (roaming) = 55
    # 12 * 55 = 660
    assert overage_charge("standard", 17, True, False) == 660


# Tests for recharge_allowed
def test_kyc_pending_amount_within_limit():
    assert recharge_allowed(150, 0, True) is True


def test_kyc_pending_amount_over_limit():
    assert recharge_allowed(250, 0, True) is False


def test_amount_over_max_limit():
    assert recharge_allowed(2500, 0, False) is False


def test_pending_recharges_allowed():
    assert recharge_allowed(500, 1, False) is True


def test_pending_recharges_exceeded():
    assert recharge_allowed(500, 3, False) is False


# Tests for validity_status
def test_prepaid_active():
    assert validity_status(2, True, False) == "active"


def test_postpaid_with_addon_active():
    # cutoff = 3 + 2 = 5; days_left = 6 -> active
    assert validity_status(6, False, True) == "active"


def test_postpaid_grace():
    # cutoff = 3; days_left = 0 (cutoff - 15 = -12 <= 0 < 3) -> grace
    assert validity_status(0, False, False) == "grace"


def test_expired():
    # prepaid cutoff = 0; days_left = -20 (< -15) -> expired
    assert validity_status(-20, True, False) == "expired"
