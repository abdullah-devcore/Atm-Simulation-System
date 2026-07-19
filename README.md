# 🏦 NovaBank ATM System

A modern **ATM Banking Management System** built with **Python, Flask, HTML, CSS, and JavaScript**. NovaBank simulates a real-world ATM experience with secure authentication, account management, money transfers, transaction history, and a responsive user interface.

---

## 📖 Overview

NovaBank ATM is a full-stack banking application that demonstrates client-server architecture using a Flask REST API. The frontend communicates with the backend through HTTP requests, while all banking data is stored persistently in JSON files.

The application allows users to:

* Create a new bank account
* Securely log in using CNIC and PIN
* Deposit money
* Withdraw money
* Transfer funds between accounts
* View account balance
* View complete transaction history
* Switch between Dark and Light themes
* Log out securely

---

# 🚀 Features

* 🔐 Secure Login with CNIC & PIN
* 👤 New Account Registration
* 💰 Deposit Money
* 💸 Withdraw Money
* 🔄 Money Transfer
* 📜 Transaction History
* 📊 Live Balance Updates
* 🌙 Dark Mode
* ☀️ Light Mode
* 🗂 JSON-Based Persistent Storage
* 🌐 Flask REST API
* 🎨 Responsive Modern UI
* 🔒 Session-Based Authentication

---

# 🛠 Technologies Used

### Backend

* Python 3
* Flask
* Flask-CORS

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* Fetch API

### Storage

* JSON

---

# 📁 Project Structure

```text
Project PF/
│
├── Start NovaBank.bat
│
├── Backend/
│   ├── atm_system.py
│   │
│   ├── Flask & Rest API/
│   │   ├── app.py
│   │   └── requirements.txt
│   │
│   └── Storage/
│       ├── accounts.json
│       └── history.json
│
└── Frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/NovaBank-ATM.git
```

```bash
cd NovaBank-ATM
```

---

## 2. Install Dependencies

```bash
pip install -r Backend/"Flask & Rest API"/requirements.txt
```

---

## 3. Run the Application

### Option 1 (Recommended)

Double-click:

```text
Start NovaBank.bat
```

### Option 2

Run manually:

```bash
cd Backend/"Flask & Rest API"

python app.py
```

Open your browser:

```text
http://127.0.0.1:5000
```

---

# 📂 Storage

NovaBank stores all data locally.

## accounts.json

Stores:

* Account Number
* Name
* Father Name
* CNIC
* Phone
* Email
* City
* PIN
* Balance

---

## history.json

Stores:

* Deposits
* Withdrawals
* Transfers
* Account Creation

---

# 🔌 REST API Endpoints

| Endpoint              | Method | Description             |
| --------------------- | ------ | ----------------------- |
| `/api/login`          | POST   | User Login              |
| `/api/logout`         | POST   | User Logout             |
| `/api/create_account` | POST   | Create New Account      |
| `/api/account`        | GET    | Get Account Details     |
| `/api/deposit`        | POST   | Deposit Money           |
| `/api/withdraw`       | POST   | Withdraw Money          |
| `/api/transfer`       | POST   | Transfer Money          |
| `/api/lookup`         | POST   | Verify Receiver Account |
| `/api/history`        | GET    | Get Transaction History |

---

# 🔄 Application Workflow

```text
User

↓

Frontend (HTML/CSS/JavaScript)

↓

Fetch API

↓

Flask REST API

↓

Business Logic

↓

accounts.json + history.json

↓

JSON Response

↓

Frontend Updates UI
```

---

# 🖥 User Flow

### Account Creation

```
Home

↓

Create Account

↓

Fill Details

↓

Submit

↓

Account Created
```

---

### Login

```
Enter CNIC

↓

Enter PIN

↓

Authentication

↓

Dashboard
```

---

### Deposit

```
Dashboard

↓

Deposit

↓

Enter Amount

↓

Balance Updated

↓

Transaction Saved
```

---

### Withdraw

```
Dashboard

↓

Withdraw

↓

Balance Checked

↓

Cash Withdrawn

↓

History Updated
```

---

### Transfer

```
Dashboard

↓

Verify Receiver

↓

Enter Amount

↓

Transfer Successful

↓

Balances Updated

↓

History Saved
```

---

# 🔒 Security Features

* Session-Based Authentication
* PIN Verification
* CNIC Validation
* Duplicate Account Prevention
* Receiver Account Verification
* Insufficient Balance Protection
* Server-Side Validation
* Persistent Data Storage

---

# 🎨 User Interface

The application includes:

* Modern ATM-inspired design
* Responsive layout
* Interactive dashboard
* Dark & Light themes
* Smooth navigation
* Success and error messages

---

# 📌 Future Improvements

* MySQL or PostgreSQL database support
* Admin dashboard
* Password hashing
* OTP verification
* Email notifications
* PDF account statements
* User profile editing
* Mobile application
* QR code payments
* Online banking portal

---

# 📸 Screenshots

> Add screenshots of your application here.

Example:

```
screenshots/
│
├── home.png
├── login.png
├── dashboard.png
├── transfer.png
├── history.png
```

---

# 👨‍💻 Author

**Muhammad Abdullah**

* 🎓 BS Artificial Intelligence
* 🏫 Superior University, Lahore

GitHub:
https://github.com/abdullah-devcore

LinkedIn:
https://www.linkedin.com/in/muhammad-abdullah-ai-devcore-2029-pk

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute this project for educational and personal purposes.

---

# ⭐ Support

If you found this project helpful:

* ⭐ Star the repository
* 🍴 Fork the repository
* 🐞 Report issues
* 💡 Suggest improvements

Your support is greatly appreciated!

---

## Thank You ❤️

Thank you for checking out **NovaBank ATM**. If you like this project, don't forget to leave a ⭐ on GitHub!
