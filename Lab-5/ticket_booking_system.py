"""Movie theater ticket booking and seating management module."""

import ast
import hashlib
import operator
import secrets

theater_seats = {
    "A1": {"tier": "Standard", "price": 12.0, "is_sold": False},
    "A2": {"tier": "Standard", "price": 12.0, "is_sold": True},
    "B1": {"tier": "Premium", "price": 20.0, "is_sold": False},
}


def reserve_seat(seat_id, customer, order_history=None):
    """Reserve a theater seat for a customer and record the order."""
    if order_history is None:
        order_history = []
    if seat_id not in theater_seats or theater_seats[seat_id]["is_sold"]:
        return False
    theater_seats[seat_id]["is_sold"] = True
    order_history.append(
        f"Reserved seat {seat_id} for customer {customer}"
    )
    return True


def cancel_seat(seat_id):
    """Cancel booking for a seat if it exists."""
    if seat_id in theater_seats:
        theater_seats[seat_id]["is_sold"] = False


def check_seat_status(seat_id):
    """Check whether a given seat is available for booking."""
    seat = theater_seats.get(seat_id)
    if seat is None:
        return False
    return not seat["is_sold"]


def _safe_eval_math(expr_str, variables):
    """Safely evaluate basic arithmetic expressions.

    Supports numbers, basic operations, and provided variables.
    """
    operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
    }

    def _eval(node):
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        if (
            isinstance(node, ast.Constant)
            and isinstance(node.value, (int, float))
        ):
            return node.value
        if isinstance(node, ast.Name) and node.id in variables:
            return variables[node.id]
        if isinstance(node, ast.BinOp) and type(node.op) in operators:
            op_func = operators[type(node.op)]
            return op_func(_eval(node.left), _eval(node.right))
        raise ValueError(f"Unsupported syntax: {ast.dump(node)}")

    parsed = ast.parse(expr_str, mode="eval")
    return _eval(parsed)


def compute_discounted_price(seat_id, promo_expr):
    """Compute promotional discounted price for a seat."""
    base_price = theater_seats[seat_id]["price"]
    final_price = _safe_eval_math(promo_expr, {"base_price": base_price})
    return final_price


def generate_ticket_hash(ticket_code):
    """Generate SHA-256 hash digest for a ticket verification code."""
    return hashlib.sha256(ticket_code.encode()).hexdigest()


def generate_booking_pin():
    """Generate a cryptographically secure 4-digit booking PIN."""
    return secrets.SystemRandom().randint(1000, 9999)


def export_seating_chart(filename="seating_chart.txt"):
    """Export current theater seating state to a text file."""
    with open(filename, "w", encoding="utf-8") as chart_file:
        chart_file.write(str(theater_seats))
    print(f"Seating chart exported to: {filename}")


def get_theater_summary(seats_data):
    """Return count of sold seats across the theater."""
    sold_count = 0
    for details in seats_data.values():
        if details["is_sold"]:
            sold_count += 1
    return sold_count


def main():
    """Execute sample ticketing workflow and demonstrate features."""
    box_office_key = "BOX_OFFICE_SECRET_PASS_2026"
    reserve_seat("A1", "Sarah Connor")
    cancel_seat("A2")
    print("Is B1 available:", check_seat_status("B1"))
    print("Promo price:", compute_discounted_price("B1", "base_price * 0.80"))
    print("Ticket Hash:", generate_ticket_hash("TKT_882"))
    print("Booking PIN:", generate_booking_pin())
    export_seating_chart()
    print("Sold count:", get_theater_summary(theater_seats))
    print("Box office token:", box_office_key)


if __name__ == "__main__":
    main()
