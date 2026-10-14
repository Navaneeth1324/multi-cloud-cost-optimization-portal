# Lab 5: Static Code Analysis — Ticket Booking System

> **Course:** Software Engineering Lab (Dept. of CSE, PES University)  
> **Student Name:** Navaneeth Tanuboddi  
> **SRN:** PES1UG24CS709  
> **Problem Statement #45:** Multi-Cloud Asset Cost Optimization Portal (MCCOP)  
> **Lab Assignment:** Lab 5 — Static Code Analysis (Pylint, Bandit, Flake8)  
> **Original Handout PDF:** [Lab5_Static_Code_Analysis_Student_handout.pdf](Lab5_Static_Code_Analysis_Student_handout.pdf)  

---

## 🎯 Executive Summary & Objectives

The objective of this lab is to enhance Python code quality, security, and PEP 8 style adherence by utilizing three industry-standard static analysis tools:
- **Bandit:** AST-based security vulnerability scanner ("Security Guard").
- **Flake8:** PEP 8 style, syntax, and complexity checker ("Grammar Checker").
- **Pylint:** Deep semantic code analyzer and design reviewer ("Strict Code Reviewer").

The target source file assigned for this lab is [`ticket_booking_system.py`](ticket_booking_system.py), a movie theater seating and ticketing management script containing logic bugs, unsafe functions, code smells, and security vulnerabilities.

### 🏆 Benchmark Comparison

| Metric / Tool | Initial Baseline | Post-Remediation | Target Requirement | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Pylint Score** | `5.37 / 10` | **`10.00 / 10`** | `> 9.5 / 10` | ✅ **Exceeded (Perfect Score)** |
| **Bandit Findings** | 5 (2 High, 1 Med, 2 Low) | **0** | Handle all Bandit issues | ✅ **100% Resolved** |
| **Flake8 Violations** | 7 violations | **0** | Handle all Flake8 issues | ✅ **100% Resolved** |
| **Runtime Execution** | Working with warnings | Flawless | Program must run cleanly | ✅ **Verified** |

---

## 📂 Deliverables & File Structure

```text
Lab-5/
├── ticket_booking_system.py               # Cleaned and refactored Python script (10/10 Pylint, 0 Bandit, 0 Flake8)
├── issues.md                              # Detailed documentation table for all 12 identified issues & fixes
├── reflection.md                          # Technical reflection Q&A covering the four lab learning outcomes
├── Lab5_Static_Code_Analysis_Student_handout.pdf # Original lab instructions handout
├── README.md                              # Lab 5 complete documentation & walk-through
├── pylint_report_before.txt               # Baseline Pylint report (5.37/10)
├── pylint_report_after.txt                # Final Pylint report (10.00/10)
├── bandit_report_before.txt               # Baseline Bandit security report (5 issues)
├── bandit_report_after.txt                # Final Bandit security report (0 issues)
├── flake8_report_before.txt               # Baseline Flake8 style report (7 issues)
└── flake8_report_after.txt                # Final Flake8 style report (0 issues)
```

---

## 🛠️ Issues Identified & Fix Approaches

A total of 12 distinct issues were identified across Bandit, Flake8, and Pylint. High and medium severity security vulnerabilities were prioritized first:

| # | Issue ID & Tool | Type & Severity | Line(s) | Description | Remediation Applied |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | **`B307` / `W0123`**<br>(Bandit / Pylint) | **Security**<br>(Medium) | 42 | Insecure `eval(promo_expr)` used for dynamic price calculation, enabling arbitrary code execution. | Replaced `eval()` with a restricted, safe AST evaluator (`_safe_eval_math`) utilizing Python's `ast` module that evaluates only whitelisted arithmetic nodes (`+`, `-`, `*`, `/`) and variables (`base_price`). |
| **2** | **`B324`**<br>(Bandit) | **Security**<br>(High) | 47 | Insecure cryptographic hash function `hashlib.md5()` used for ticket hashes, susceptible to collision attacks. | Upgraded hash generation to cryptographic industry standard `hashlib.sha256()`. |
| **3** | **`B605`**<br>(Bandit) | **Security**<br>(High) | 58 | Shell command execution via `os.system("echo ...")`, vulnerable to subshell command injection. | Replaced shell invocation with Python's native `print()` and removed unused `os` import. |
| **4** | **`B311`**<br>(Bandit) | **Security**<br>(Low) | 51 | Mersenne Twister PRNG `random.randint()` used for PIN generation, which is cryptographically predictable. | Replaced with cryptographically secure `secrets.SystemRandom().randint(1000, 9999)`. |
| **5** | **`B110` / `E722` / `W0702`**<br>(Bandit / Flake8 / Pylint) | **Bug / Quality**<br>(Low) | 24–27 | Bare `try: ... except: pass` catches `BaseException` (including `SystemExit`, `KeyboardInterrupt`), silently suppressing bugs. | Replaced with explicit defensive membership test `if seat_id in theater_seats:`. |
| **6** | **`W0102`**<br>(Pylint) | **Bug / Logic**<br>(Medium) | 15 | Mutable default argument `order_history=[]` is evaluated once at definition, sharing mutable state across calls. | Changed default to `order_history=None` and instantiated a fresh list inside the function body. |
| **7** | **`C0103`**<br>(Pylint) | **Style / PEP 8**<br>(Low) | 15 | Function name `reserveSeat` does not conform to PEP 8 `snake_case` naming convention. | Renamed to `reserve_seat` and updated all caller references. |
| **8** | **`E711` / `C0121`**<br>(Flake8 / Pylint) | **Style / PEP 8**<br>(Low) | 32 | Comparison `theater_seats.get(seat_id) == None` uses equality operator instead of identity. | Refactored to `if seat is None:`. |
| **9** | **`R1732` / `W1514`**<br>(Pylint) | **Reliability**<br>(Medium) | 55–57 | File `open(filename, "w")` without context manager risks file descriptor leaks and lacks encoding. | Wrapped in `with open(filename, "w", encoding="utf-8") as chart_file:` block. |
| **10** | **`W0621`**<br>(Pylint) | **Code Smell**<br>(Low) | 61 | Parameter `theater_seats` in `get_theater_summary` redefines and shadows outer global variable. | Renamed parameter to `seats_data` for clean scoping. |
| **11** | **`F401` / `F841` / `W0611` / `W0612`**<br>(Flake8 / Pylint) | **Redundancy**<br>(Low) | 6, 31, 41, 63 | Unused import `math`, unused variable `booking_fee`, and unused dictionary loop key `seat`. | Removed unused imports/variables and iterated directly over `seats_data.values()`. |
| **12** | **`E501` / `W292` / `C0304`**<br>(Flake8 / Pylint) | **Style / PEP 8**<br>(Low) | 19, 82 | String formatting line exceeded 79 characters, and file missed a POSIX terminating newline. | Reformatted using clean modern f-strings and added trailing newline. |

*Full details and code snippets can be found in [`issues.md`](issues.md).*

---

## 💡 Key Takeaways from Reflection

Detailed responses to the four reflection questions are documented in [`reflection.md`](reflection.md). Key insights include:

1. **Tool Specialization & Synergy:** Flake8 provides lightweight, high-speed PEP 8 linting for pre-commit checks; Pylint delivers deep semantic and architectural design analysis; Bandit protects against severe vulnerabilities. Together, they form an indispensable defense-in-depth code quality pipeline.
2. **The "Shift-Left" Advantage:** Catching vulnerabilities (such as `eval` injection or broken MD5 hashes) at the local developer workstation costs a fraction of the time and financial expenditure required to remediate security flaws post-deployment.
3. **Managing Alert Fatigue:** Teams must prevent alert fatigue by tailoring rulesets, using automated formatters (`black`/`ruff`), and requiring written justifications for scoped inline suppressions (`# nosec`, `# pylint: disable`).

---

## 🚀 Running Verification Locally

To reproduce and verify the static analysis reports in the local environment:

```bash
cd Lab-5

# 1. Activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install analysis tools
pip install pylint bandit flake8

# 3. Run all tools against the cleaned script
pylint ticket_booking_system.py
bandit -r ticket_booking_system.py
flake8 ticket_booking_system.py

# 4. Execute the program to verify functionality
python ticket_booking_system.py
```
