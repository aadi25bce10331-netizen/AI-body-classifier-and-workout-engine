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
