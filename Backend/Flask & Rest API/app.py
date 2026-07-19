"""NovaBank ATM Web Server — Flask REST API."""

import json
import os
import random
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="../../Frontend", static_url_path="")
app.secret_key = "novabank_secret_2024_xK9mP"
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True
CORS(app, supports_credentials=True)

# ---------- Configuration ----------
BANK_NAME = "NovaBank"
ACCOUNT_PREFIX = "NVB-9278-"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ACCOUNTS_FILE = os.path.join(BASE_DIR, "..", "Storage", "accounts.json")
HISTORY_FILE  = os.path.join(BASE_DIR, "..", "Storage", "history.json")

accounts = {}
history = {}


# ---------- Data Persistence ----------
def save_data():
    with open(ACCOUNTS_FILE, "w") as f:
        json.dump(accounts, f, indent=4)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)


def load_data():
    global accounts, history
    if os.path.exists(ACCOUNTS_FILE):
        with open(ACCOUNTS_FILE, "r") as f:
            content = f.read().strip()
            accounts = json.loads(content) if content else {}
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            content = f.read().strip()
            history = json.loads(content) if content else {}


# ---------- Helpers ----------
def is_valid_name(name):
    words = name.split()
    if not words:
        return False
    return all(word.isalpha() and word[0].isupper() for word in words)


def format_currency(amount):
    return "Rs. " + f"{amount:,}"


def generate_account_number():
    while True:
        part1 = str(random.randint(0, 9999)).zfill(4)
        part2 = str(random.randint(0, 9999)).zfill(4)
        acc_no = ACCOUNT_PREFIX + part1 + "-" + part2
        if acc_no not in accounts:
            return acc_no


def find_account_by_cnic(cnic):
    for acc_no, acc in accounts.items():
        if acc["CNIC"] == cnic:
            return acc_no
    return None


# ---------- Serve Frontend ----------
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


# ---------- API: Create Account ----------
@app.route("/api/create_account", methods=["POST"])
def api_create_account():
    data = request.get_json()

    name = data.get("name", "").strip()
    father_name = data.get("father_name", "").strip()
    phone = data.get("phone", "").strip()
    cnic = data.get("cnic", "").strip()
    email = data.get("email", "").strip()
    city = data.get("city", "").strip()
    pin = data.get("pin", "").strip()
    deposit = str(data.get("deposit", "")).strip()

    # Validations
    if not is_valid_name(name):
        return jsonify({"success": False, "message": "Invalid name. Each word must start with a capital letter and contain letters only."})

    if not is_valid_name(father_name):
        return jsonify({"success": False, "message": "Invalid father name. Each word must start with a capital letter and contain letters only."})

    if len(phone) != 11 or not phone.isdigit() or not phone.startswith("03"):
        return jsonify({"success": False, "message": "Invalid phone number. Must be 11 digits starting with 03."})

    if any(acc["Phone"] == phone for acc in accounts.values()):
        return jsonify({"success": False, "message": "This phone number is already registered."})

    if len(cnic) != 13 or not cnic.isdigit():
        return jsonify({"success": False, "message": "Invalid CNIC. Must be exactly 13 digits."})

    if any(acc["CNIC"] == cnic for acc in accounts.values()):
        return jsonify({"success": False, "message": "This CNIC is already registered."})

    if "@" not in email or ".com" not in email:
        return jsonify({"success": False, "message": "Invalid email. Must contain @ and .com"})

    if any(acc["Email"] == email for acc in accounts.values()):
        return jsonify({"success": False, "message": "This email is already registered."})

    if not city:
        return jsonify({"success": False, "message": "City is required."})

    if len(pin) != 4 or not pin.isdigit():
        return jsonify({"success": False, "message": "PIN must be exactly 4 digits."})

    if not deposit.isdigit() or int(deposit) <= 0:
        return jsonify({"success": False, "message": "Initial deposit must be a positive number."})

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

    return jsonify({
        "success": True,
        "message": "Account created successfully!",
        "account_number": acc_no
    })


# ---------- API: Login ----------
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    cnic = data.get("cnic", "").strip()
    pin = data.get("pin", "").strip()

    acc_no = find_account_by_cnic(cnic)
    if acc_no is None:
        return jsonify({"success": False, "message": "No account found with this CNIC."})

    if accounts[acc_no]["PIN"] != pin:
        return jsonify({"success": False, "message": "Incorrect PIN. Please try again."})

    session["acc_no"] = acc_no
    return jsonify({
        "success": True,
        "message": "Login successful!",
        "name": accounts[acc_no]["Name"],
        "account_number": acc_no,
        "balance": accounts[acc_no]["Balance"],
        "balance_formatted": format_currency(accounts[acc_no]["Balance"])
    })


# ---------- API: Get Account Info ----------
@app.route("/api/account", methods=["GET"])
def api_account():
    acc_no = session.get("acc_no")
    if not acc_no or acc_no not in accounts:
        return jsonify({"success": False, "message": "Not logged in."})

    acc = accounts[acc_no]
    return jsonify({
        "success": True,
        "account_number": acc_no,
        "name": acc["Name"],
        "father_name": acc["Father Name"],
        "phone": acc["Phone"],
        "cnic": acc["CNIC"],
        "email": acc["Email"],
        "city": acc["City"],
        "balance": acc["Balance"],
        "balance_formatted": format_currency(acc["Balance"])
    })


# ---------- API: Deposit ----------
@app.route("/api/deposit", methods=["POST"])
def api_deposit():
    acc_no = session.get("acc_no")
    if not acc_no or acc_no not in accounts:
        return jsonify({"success": False, "message": "Not logged in."})

    data = request.get_json()
    amount_str = str(data.get("amount", "")).strip()

    if not amount_str.isdigit() or int(amount_str) <= 0:
        return jsonify({"success": False, "message": "Invalid amount. Please enter a positive number."})

    amount = int(amount_str)
    accounts[acc_no]["Balance"] += amount
    history[acc_no].append("Deposited " + format_currency(amount))
    save_data()

    return jsonify({
        "success": True,
        "message": "Deposit successful!",
        "balance": accounts[acc_no]["Balance"],
        "balance_formatted": format_currency(accounts[acc_no]["Balance"])
    })


# ---------- API: Withdraw ----------
@app.route("/api/withdraw", methods=["POST"])
def api_withdraw():
    acc_no = session.get("acc_no")
    if not acc_no or acc_no not in accounts:
        return jsonify({"success": False, "message": "Not logged in."})

    data = request.get_json()
    amount_str = str(data.get("amount", "")).strip()

    if not amount_str.isdigit() or int(amount_str) <= 0:
        return jsonify({"success": False, "message": "Invalid amount. Please enter a positive number."})

    amount = int(amount_str)
    if amount > accounts[acc_no]["Balance"]:
        return jsonify({
            "success": False,
            "message": f"Insufficient balance. Your current balance is {format_currency(accounts[acc_no]['Balance'])}."
        })

    accounts[acc_no]["Balance"] -= amount
    history[acc_no].append("Withdrew " + format_currency(amount))
    save_data()

    return jsonify({
        "success": True,
        "message": "Withdrawal successful!",
        "balance": accounts[acc_no]["Balance"],
        "balance_formatted": format_currency(accounts[acc_no]["Balance"])
    })


# ---------- API: Transfer ----------
@app.route("/api/transfer", methods=["POST"])
def api_transfer():
    acc_no = session.get("acc_no")
    if not acc_no or acc_no not in accounts:
        return jsonify({"success": False, "message": "Not logged in."})

    data = request.get_json()
    receiver = data.get("receiver", "").strip()
    amount_str = str(data.get("amount", "")).strip()

    if receiver == acc_no:
        return jsonify({"success": False, "message": "You cannot transfer to your own account."})

    if receiver not in accounts:
        return jsonify({"success": False, "message": "Receiver account not found."})

    if not amount_str.isdigit() or int(amount_str) <= 0:
        return jsonify({"success": False, "message": "Invalid amount. Please enter a positive number."})

    amount = int(amount_str)
    if amount > accounts[acc_no]["Balance"]:
        return jsonify({
            "success": False,
            "message": f"Insufficient balance. Your current balance is {format_currency(accounts[acc_no]['Balance'])}."
        })

    accounts[acc_no]["Balance"] -= amount
    accounts[receiver]["Balance"] += amount
    history[acc_no].append("Transferred " + format_currency(amount) + " to " + receiver)
    history[receiver].append("Received " + format_currency(amount) + " from " + acc_no)
    save_data()

    return jsonify({
        "success": True,
        "message": f"Successfully transferred {format_currency(amount)} to {accounts[receiver]['Name']}.",
        "balance": accounts[acc_no]["Balance"],
        "balance_formatted": format_currency(accounts[acc_no]["Balance"]),
        "receiver_name": accounts[receiver]["Name"]
    })


# ---------- API: Lookup Receiver ----------
@app.route("/api/lookup", methods=["POST"])
def api_lookup():
    acc_no = session.get("acc_no")
    if not acc_no:
        return jsonify({"success": False, "message": "Not logged in."})

    data = request.get_json()
    receiver = data.get("account_number", "").strip()

    if receiver not in accounts:
        return jsonify({"success": False, "message": "Account not found."})

    if receiver == acc_no:
        return jsonify({"success": False, "message": "This is your own account."})

    return jsonify({
        "success": True,
        "name": accounts[receiver]["Name"]
    })


# ---------- API: History ----------
@app.route("/api/history", methods=["GET"])
def api_history():
    acc_no = session.get("acc_no")
    if not acc_no or acc_no not in accounts:
        return jsonify({"success": False, "message": "Not logged in."})

    return jsonify({
        "success": True,
        "history": history.get(acc_no, [])
    })


# ---------- API: Logout ----------
@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("acc_no", None)
    return jsonify({"success": True, "message": "Logged out successfully."})


# ---------- Run ----------
if __name__ == "__main__":
    load_data()
    import threading, webbrowser
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        threading.Timer(1.0, lambda: webbrowser.open("http://127.0.0.1:5000")).start()
    app.run(debug=True, port=5000)
