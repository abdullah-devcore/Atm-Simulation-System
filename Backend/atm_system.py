"""NovaBank ATM Simulation System.

An ATM simulator that stores accounts and transaction history in JSON files.
"""

import json
import os
import random

# ---------- Configuration ----------
BANK_NAME = "NovaBank"
ACCOUNT_PREFIX = "NVB-9278-"
ACCOUNTS_FILE = "accounts.json"
HISTORY_FILE = "history.json"

accounts = {}
history = {}


# ---------- Data Persistence ----------
def save_data():
    """Write the current accounts and history to their JSON files."""
    with open(ACCOUNTS_FILE, "w") as f:
        json.dump(accounts, f, indent=4)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)


def load_data():
    """Load accounts and history from JSON files at program startup."""
    global accounts, history

    if os.path.exists(ACCOUNTS_FILE):
        with open(ACCOUNTS_FILE, "r") as f:
            content = f.read().strip()
            accounts = json.loads(content) if content else {}

    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            content = f.read().strip()
            history = json.loads(content) if content else {}


# ---------- Validation Helpers ----------
def is_valid_name(name):
    """Each word must contain only letters and start with a capital letter."""
    words = name.split()
    if not words:
        return False
    return all(word.isalpha() and word[0].isupper() for word in words)


def format_currency(amount):
    """Format a number as Pakistani Rupees, e.g. 12500 -> 'Rs. 12,500'."""
    return "Rs. " + f"{amount:,}"


# ---------- Account Creation ----------
def generate_account_number():
    """Generate a unique account number, e.g. NVB-9278-4821-0937."""
    while True:
        part1 = str(random.randint(0, 9999)).zfill(4)
        part2 = str(random.randint(0, 9999)).zfill(4)
        acc_no = ACCOUNT_PREFIX + part1 + "-" + part2
        if acc_no not in accounts:
            return acc_no


def create_account():
    """Collect and validate customer details, then save a new account."""
    print("\n--- Create New " + BANK_NAME + " Account ---")

    name = input("Enter Your Name (e.g. Muhammad Ali): ")
    while not is_valid_name(name):
        print("Invalid Name. Use letters only, with each word starting with a capital letter.")
        name = input("Enter Your Name (e.g. Muhammad Ali): ")

    father_name = input("Enter Father Name (e.g. Muhammad Akram): ")
    while not is_valid_name(father_name):
        print("Invalid Father Name. Use letters only, with each word starting with a capital letter.")
        father_name = input("Enter Father Name (e.g. Muhammad Akram): ")

    phone = input("Enter Phone Number (11 digits, starts with 03): ")
    while True:
        if len(phone) != 11 or not phone.isdigit() or not phone.startswith("03"):
            print("Invalid Phone Number. It must be 11 digits and start with 03.")
            phone = input("Enter Phone Number (11 digits, starts with 03): ")
            continue

        if any(acc["Phone"] == phone for acc in accounts.values()):
            print("Phone already registered.")
            phone = input("Enter Phone Number (11 digits, starts with 03): ")
            continue

        break

    cnic = input("Enter CNIC (13 digits): ")
    while True:
        if len(cnic) != 13 or not cnic.isdigit():
            print("Invalid CNIC. It must be exactly 13 digits.")
            cnic = input("Enter CNIC (13 digits): ")
            continue

        if any(acc["CNIC"] == cnic for acc in accounts.values()):
            print("CNIC already registered.")
            cnic = input("Enter CNIC (13 digits): ")
            continue

        break

    email = input("Enter Email (must contain @ and .com): ")
    while True:
        if "@" not in email or ".com" not in email:
            print("Invalid Email. It must contain @ and .com")
            email = input("Enter Email (must contain @ and .com): ")
            continue

        if any(acc["Email"] == email for acc in accounts.values()):
            print("Email already registered.")
            email = input("Enter Email (must contain @ and .com): ")
            continue

        break

    city = input("Enter City: ")

    pin = input("Set a 4-digit PIN: ")
    while len(pin) != 4 or not pin.isdigit():
        print("PIN must be exactly 4 digits.")
        pin = input("Set a 4-digit PIN: ")

    deposit = input("Enter Initial Deposit: ")
    while not deposit.isdigit() or int(deposit) <= 0:
        print("Please enter a valid positive number.")
        deposit = input("Enter Initial Deposit: ")

    acc_no = generate_account_number()

    accounts[acc_no] = {
        "Name": name,
        "Father Name": father_name,
        "Phone": phone,
        "CNIC": cnic,
        "Email": email,
        "City": city,
        "PIN": pin,
        "Balance": int(deposit)
    }
    history[acc_no] = ["Account created with deposit of " + format_currency(int(deposit))]
    save_data()

    print("Account Created Successfully at " + BANK_NAME + "!")
    print("Your Account Number is:", acc_no)


# ---------- Account Lookup ----------
def find_account_by_cnic(cnic):
    """Return the account number matching this CNIC, or None if not found."""
    for acc_no, acc in accounts.items():
        if acc["CNIC"] == cnic:
            return acc_no
    return None


# ---------- Customer Authentication ----------
def login():
    """Simulate inserting a card: identify the customer via CNIC + PIN."""
    while True:
        print("\n=========================")
        print("Insert Card")
        print("=========================")
        cnic = input("Enter CNIC: ")
        acc_no = find_account_by_cnic(cnic)

        if acc_no is None:
            print("Account Not Found.")
            print("\n1. Try Again")
            print("2. Create New Account")
            print("3. Back to Main Menu")
            choice = input("Enter Choice: ")

            if choice == "1":
                continue
            elif choice == "2":
                create_account()
                return None
            else:
                return None

        pin = input("Enter PIN: ")
        if pin == accounts[acc_no]["PIN"]:
            print("\nLogin Successful. Welcome to " + BANK_NAME + ",", accounts[acc_no]["Name"])
            return acc_no

        print("Incorrect PIN.")
        print("\n1. Try Again")
        print("2. Back to Main Menu")
        choice = input("Enter Choice: ")
        if choice != "1":
            return None


# ---------- Customer Transactions ----------
def deposit_money(acc_no):
    """Add money to the account and record it in the transaction history."""
    while True:
        amount = input("Enter Deposit Amount: ")
        if not amount.isdigit() or int(amount) <= 0:
            print("Invalid amount.")
            print("\n1. Try Again")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        amount = int(amount)
        accounts[acc_no]["Balance"] += amount
        history[acc_no].append("Deposited " + format_currency(amount))
        save_data()

        print("Deposit Successful.")
        print("New Balance:", format_currency(accounts[acc_no]["Balance"]))
        return


def withdraw_money(acc_no):
    """Remove money from the account after checking sufficient balance."""
    while True:
        amount = input("Enter Withdraw Amount: ")
        if not amount.isdigit() or int(amount) <= 0:
            print("Invalid amount.")
            print("\n1. Try Again")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        amount = int(amount)
        if amount > accounts[acc_no]["Balance"]:
            print("Insufficient Balance. Your balance is:", format_currency(accounts[acc_no]["Balance"]))
            print("\n1. Try a Different Amount")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        accounts[acc_no]["Balance"] -= amount
        history[acc_no].append("Withdrew " + format_currency(amount))
        save_data()

        print("\nPlease Collect Your Cash.")
        print("\nRemaining Balance:")
        print(format_currency(accounts[acc_no]["Balance"]))
        print("\nThank You For Banking With " + BANK_NAME + ".")
        return


def transfer_money(acc_no):
    """Move money from this account to another after receiver validation."""
    while True:
        receiver = input("Enter Receiver's Account Number: ")

        if receiver == acc_no:
            print("You cannot transfer to your own account.")
            print("\n1. Try Again")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        if receiver not in accounts:
            print("Receiver account not found.")
            print("\n1. Try Again")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        break

    while True:
        amount = input("Enter Amount to Transfer: ")
        if not amount.isdigit() or int(amount) <= 0:
            print("Invalid amount.")
            print("\n1. Try Again")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        amount = int(amount)
        if amount > accounts[acc_no]["Balance"]:
            print("Insufficient Balance. Your balance is:", format_currency(accounts[acc_no]["Balance"]))
            print("\n1. Try a Different Amount")
            print("2. Cancel")
            if input("Enter Choice: ") == "1":
                continue
            return

        print("\nReceiver Name  :", accounts[receiver]["Name"])
        print("Transfer Amount:", format_currency(amount))
        print("Confirm?")
        print("1. Yes")
        print("2. No")
        if input("Enter Choice: ") != "1":
            print("Transfer Cancelled.")
            return

        accounts[acc_no]["Balance"] -= amount
        accounts[receiver]["Balance"] += amount
        history[acc_no].append("Transferred " + format_currency(amount) + " to " + receiver)
        history[receiver].append("Received " + format_currency(amount) + " from " + acc_no)
        save_data()

        print("Transfer Successful.")
        print("New Balance:", format_currency(accounts[acc_no]["Balance"]))
        return


def check_balance(acc_no):
    """Display the account's current balance."""
    print("Current Balance:", format_currency(accounts[acc_no]["Balance"]))


def transaction_history(acc_no):
    """List every past transaction recorded for the account."""
    print("\n--- Transaction History ---")
    if not history[acc_no]:
        print("No transactions yet.")
    else:
        for item in history[acc_no]:
            print("-", item)


# ---------- Menus ----------
def confirm_eject_card():
    """Ask for a Yes/No confirmation before returning to the main menu."""
    print("\nAre you sure?")
    print("1. Yes")
    print("2. No")
    return input("Enter Choice: ") == "1"


def customer_menu(acc_no):
    """Show the ATM menu and route the customer's choice to an action."""
    while True:
        print("\n========== ATM MENU ==========")
        print("1. Cash Withdrawal")
        print("2. Cash Deposit")
        print("3. Balance Inquiry")
        print("4. Funds Transfer")
        print("5. Mini Statement")
        print("6. Eject Card")
        choice = input("Enter Choice: ")

        if choice == "1":
            withdraw_money(acc_no)
        elif choice == "2":
            deposit_money(acc_no)
        elif choice == "3":
            check_balance(acc_no)
        elif choice == "4":
            transfer_money(acc_no)
        elif choice == "5":
            transaction_history(acc_no)
        elif choice == "6":
            if confirm_eject_card():
                print("Card Ejected. Returning to Main Menu.")
                break
        else:
            print("Invalid Choice.")


# ---------- Main Program Entry Point ----------
def main():
    """Load saved data, then run the start menu until the user exits."""
    load_data()

    while True:
        print("\n===== " + BANK_NAME + " ATM Simulation System =====")
        print("1. Create Account")
        print("2. Insert Card")
        print("3. Exit")
        choice = input("Enter Choice: ")

        if choice == "1":
            create_account()
        elif choice == "2":
            acc_no = login()
            if acc_no is not None:
                customer_menu(acc_no)
        elif choice == "3":
            print("Thank you for using " + BANK_NAME + ". Goodbye!")
            break
        else:
            print("Invalid Choice.")


if __name__ == "__main__":
    main()