# Lab 5: Static Code Analysis — Issues Documentation

This document records the static analysis findings detected by **Bandit**, **Flake8**, and **Pylint** on `ticket_booking_system.py`, along with their classifications, descriptions, and remediations.

---

## Documented Issues Table

| Issue | Type | Line(s) | Description | Fix Approach |
|---|---|---|---|---|
| **Use of Insecure `eval()` Function** (`B307`, `W0123`) | Security / Code Injection (Medium) | 42 | `eval(promo_expr)` executes arbitrary Python code provided as promo expression strings, exposing the system to arbitrary code execution / injection. | Replaced `eval()` with a safe, restricted AST expression evaluator (`_safe_eval_math`) utilizing Python's `ast` module that only parses verified numbers, arithmetic operations (`+`, `-`, `*`, `/`), and whitelisted variables (`base_price`). |
| **Weak Cryptographic Hash Algorithm MD5** (`B324`) | Security / Cryptographic (High) | 47 | `hashlib.md5(ticket_code.encode()).hexdigest()` uses MD5, which is cryptographically broken and vulnerable to hash collision attacks. | Upgraded the hashing algorithm to `hashlib.sha256()`, providing a collision-resistant 256-bit cryptographic digest. |
| **Shell Command Execution via `os.system()`** (`B605`) | Security / Command Injection (High) | 58 | `os.system("echo Seating chart exported to: " + filename)` spawns an unsanitized subshell command, allowing shell command injection if `filename` contains metacharacters. | Replaced the external subshell invocation with Python's native `print(f"Seating chart exported to: {filename}")` and removed the unnecessary `os` dependency. |
| **Insecure Pseudo-Random Number Generator** (`B311`) | Security / Cryptographic (Low) | 51 | `random.randint(1000, 9999)` relies on the Mersenne Twister PRNG from the `random` module, which is predictable and unsuitable for security-sensitive booking PINs. | Replaced `random.randint` with `secrets.SystemRandom().randint(1000, 9999)` from Python's cryptographically secure `secrets` module. |
| **Broad / Bare Exception Clause & Silent Pass** (`B110`, `E722`, `W0702`) | Bug / Code Quality (Low) | 24–27 | `try: ... except: pass` catches all exceptions including `KeyboardInterrupt` and `SystemExit`, silently suppressing runtime failures and obscuring defects. | Replaced the try-except-pass block with explicit seat membership validation (`if seat_id in theater_seats:`) before mutating `is_sold`. |
| **Mutable Default Argument in Function Definition** (`W0102`) | Bug / Logic (Medium) | 15 | `def reserveSeat(seat_id, customer, order_history=[])` binds `[]` at function definition time, sharing the same list across subsequent invocations that omit `order_history`. | Changed the default parameter value to `order_history=None` and initialized `order_history = []` inside the function body when `None`. |
| **Non-conforming Function Name** (`C0103`) | Style / PEP 8 | 15 | `reserveSeat` violates PEP 8 function naming conventions requiring lowercase words separated by underscores (`snake_case`). | Renamed the function to `reserve_seat` and updated all caller invocations accordingly. |
| **Comparison to Singleton `None` using `==`** (`E711`, `C0121`) | Style / PEP 8 | 32 | `if theater_seats.get(seat_id) == None:` tests object identity through value equality instead of the identity operator. | Refactored the comparison to `if seat is None:` adhering to PEP 8 standards. |
| **Unclosed File Resource & Missing Encoding** (`R1732`, `W1514`) | Reliability / Resource Leak | 55–57 | `open(filename, "w")` without a context manager risks file descriptor leaks if exceptions occur before `f.close()`, and omits explicit platform-independent character encoding. | Wrapped the file operation in a `with open(filename, "w", encoding="utf-8") as chart_file:` context manager. |
| **Variable Name Redefinition / Scope Shadowing** (`W0621`) | Code Smell / Scope | 61 | `def get_theater_summary(theater_seats):` redefines the outer global `theater_seats` dictionary name as a parameter, causing shadowing and confusion. | Renamed parameter to `seats_data` to ensure clean namespace separation. |
| **Unused Variables and Imports** (`F401`, `F841`, `W0611`, `W0612`) | Code Smell / Redundancy | 6, 31, 41, 63 | `import math` was unused; local variable `booking_fee` was assigned and never read; dictionary iteration loop variable `seat` was unused. | Removed `import math` and `booking_fee`; iterated directly over `seats_data.values()` to eliminate unused dictionary keys. |
| **Line Length Limit Violation & Missing Final Newline** (`E501`, `W292`, `C0304`) | Style / PEP 8 | 19, 82 | String formatting exceeded PEP 8's 79-character limit, and the file lacked a terminating POSIX newline. | Formatted statements across clean lines with concise f-strings and added the trailing newline. |

---

## Tool-by-Tool Summary

### Bandit (Security Analysis)
- **Before Fix:** 5 security findings (2 High, 1 Medium, 2 Low).
- **After Fix:** **0 findings** (0 High, 0 Medium, 0 Low). Clean scan.

### Flake8 (PEP 8 Style & Syntax)
- **Before Fix:** 7 violations (`F401`, `E501`, `E722`, `E711`, `F841`, `W292`).
- **After Fix:** **0 violations**. Full PEP 8 compliance.

### Pylint (Code Quality & Metrics)
- **Before Fix:** Rating **5.37 / 10** (17 diagnostics).
- **After Fix:** Rating **10.00 / 10** (0 diagnostics).
