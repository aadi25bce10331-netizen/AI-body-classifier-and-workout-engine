# AI Body Classifier & Workout Engine 🏋️‍♂️🤖

An end-to-end, AI-powered fitness application that classifies body somatotypes using deep learning models and dynamically generates customized workout plans based on individual physical characteristics and fitness goals.

---

## 🌟 Key Features

* **AI Somatotype Classification**: Uses a custom-trained Keras model (`somatotype_model.h5`) to analyze body profiles and classify them into core somatotypes (**Ectomorph**, **Mesomorph**, **Endomorph**).
* **Personalized Workout Engine**: Custom algorithms mapping exercise regimens (`exercises.py`) to classified body types for optimized training results.
* **Full-Stack Architecture**: Lightweight Python backend paired with a dynamic JavaScript frontend.
* **Database Management**: Built-in SQL schema integration (`schema.sql`) for persistence of user profiles, classification history, and generated routines.

---

## 🛠️ Tech Stack

* **Frontend**: JavaScript, Node.js (`soma-frontend`)
* **Backend**: Python 3.8+ (`main.py`, `exercises.py`, `schemas.py`)
* **Machine Learning**: TensorFlow / Keras (`somatotype_model.h5`)
* **Data Validation**: Pydantic (`schemas.py`)
* **Database**: SQL (`schema.sql`)

---

## 📂 Project Structure

```text
├── soma-frontend/         # Frontend application UI & client logic
├── main.py                # Core API backend server & model inference handler
├── exercises.py           # Workout logic and somatotype exercise mapping
├── schemas.py             # Pydantic data schemas for request/response validation
├── schema.sql             # Database schema initialization script
├── somatotype_model.h5    # Pre-trained deep learning model for body classification
├── SOMA_project_report.md # Detailed technical report and architecture notes
└── README.md              # Project documentation

🚀 Quick Start Guide
Prerequisites
Ensure you have the following installed:

Python: v3.8 or higher
Node.js & npm: v14 or higher
SQL Server: PostgreSQL, MySQL, or SQLite

1. Backend Setup
1- Clone the Repository

Bash
git clone [https://github.com/aadi25bce10331-netizen/AI-body-classifier-and-workout-engine.git](https://github.com/aadi25bce10331-netizen/AI-body-classifier-and-workout-engine.git)cd AI-body-classifier-and-workout-engine

2-Create & Activate Virtual Environment

Linux/macOS:

Bash
python3 -m venv venv
source venv/bin/activate

Windows:

Bash
python -m venv venv
venv\Scripts\activate

3-Install Dependencies

Bash
pip install -r requirements.txt

4-Database Setup
Initialize your database instance using schema.sql:

Bash
psql -d your_database_name -f schema.sql

5-Start Backend Server

Bash
python main.py

2. Frontend Setup

1-Navigate to the Frontend Directory

Bash
cd soma-frontend

2-Install Node Modules

Bash
npm install

3-Run Application

Bash
npm start

🤝 Contributing-

Contributions are welcome! Please follow these steps:

1.Fork the Repository

2.Create your Feature Branch (git checkout -b feature/AwesomeFeature)

3.Commit your Changes (git commit -m 'Add some AwesomeFeature')

4.Push to the Branch (git push origin feature/AwesomeFeature)

5.Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.



