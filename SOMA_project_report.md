# SOMA: Smart Fitness & Nutrition Engine (Project Report)

This document breaks down the SOMA project in a simple, easy-to-understand format. It is designed to help team members quickly understand what the project is, the core concepts behind it, what it does, and how it is built under the hood.

---

## Part 1: The Core Concepts (Understanding the Basics)

Before diving into the features, here are the simple definitions of the main concepts our project uses:

- **Somatotype**: Your natural body shape. People generally fall into three categories:
  - **Ectomorph**: Naturally skinny, struggles to gain weight (needs more carbs).
  - **Mesomorph**: Naturally athletic, builds muscle easily (needs a balanced diet).
  - **Endomorph**: Naturally stocky, gains fat easily (needs fewer carbs, more protein/fat).
- **Computer Vision (CV)**: A field of Artificial Intelligence (AI) where computers are taught to "see" and understand images.
- **Macronutrients (Macros)**: The three main components of food: Protein, Carbohydrates, and Fats.
- **BMR (Basal Metabolic Rate)**: The number of calories your body burns just staying alive (even if you slept all day).
- **Progressive Overload**: The fitness principle of slowly lifting heavier weights or doing more work over time so your body keeps adapting and growing.

---

## Part 2: The Problem & Our Solution

### The Problem
Most fitness apps are "one-size-fits-all." They give a 25-year-old athlete the same generic chest workout as a 50-year-old office worker with a bad shoulder. Furthermore, users don't know exactly what to eat for their specific body shape. People end up confused, injured, or not seeing results.

### The Proposed Solution: SOMA
SOMA is a smart, automated backend "engine". It looks at a picture of you, figures out your body type, looks at your lifestyle (do you sit all day or are you active?), and checks if you have any injuries. It then acts like an expert personal trainer and dietitian, instantly generating a 100% customized diet and workout plan for you.

---

## Part 3: Features (How It Works for the User)

Here is a simple breakdown of every feature SOMA offers and what happens behind the scenes.

### 1. The "Magic" Body Scanner (Somatotype Classification)
- **What it is**: You take a photo of yourself and upload it. The app immediately knows your body type.
- **How it works**: We use an Artificial Intelligence model (MobileNetV2). The AI looks at the pixels in your photo, processes the shape of your body, and categorizes you as an Ectomorph, Mesomorph, or Endomorph. (It even has a safety check to make sure the photo is actually of a human!)

### 2. The Smart Dietitian (Rule-Based Nutrition Engine)
- **What it is**: Instead of guessing how much you should eat, SOMA builds your exact diet.
- **How it works**:
  - It calculates your resting calories (BMR).
  - It adds calories based on your lifestyle (a construction worker gets more calories than a desk worker).
  - It adjusts based on your goal (subtracts calories if you want to lose fat; adds calories if you want to build muscle).
  - Finally, it uses your AI-detected body type to split your food. (e.g., If the AI says you are an Endomorph, SOMA automatically lowers your prescribed carbohydrates).

### 3. The Expert Personal Trainer (Workout & Calendar Engine)
- **What it is**: Generates a weekly workout schedule exactly suited for your experience and body.
- **How it works**:
  - **Scheduling**: Beginners get simple 3-day full-body splits. Pros get intense 6-day splits.
  - **Auto-Posture Fix**: If you tell SOMA you sit at a desk all day (Sedentary), it automatically pushes "Posture-fixing" exercises (like back rows and face-pulls) to the very top of your workout list.
  - **Smart Weight Assigning**: It scales the starting weights of exercises based on your actual body weight, so you never start too heavy or too light.

### 4. The Virtual Physical Therapist (Injury Management)
- **What it is**: The system keeps you safe if you are hurt.
- **How it works**:
  - **Acute (Current) Injuries**: If you have a current bad knee, SOMA instantly deletes standard leg exercises (like heavy squats) and replaces them with clinical physical therapy exercises (like isometric holds).
  - **Chronic (Old) Injuries**: If you have a sensitive lower back from an old injury, SOMA will still let you do deadlifts, but it puts a hard cap to ensure you don't do them more than once a week. 

### 5. The "Level Up" System (Progression Engine)
- **What it is**: The app forces you to improve over time, like a video game.
- **How it works**: When you finish a workout program, SOMA checks your grade. If you finished at least 70% of your workouts, it automatically adds 2.5kg to your weights for next month. If you crushed 85% of your workouts, you "Level Up" from Beginner to Intermediate, unlocking brand new, harder routines.

---

## Part 4: Project Implementation (The Tech Under the Hood)

This section explains *how* we actually built it.

### A. The Artificial Intelligence (Machine Learning)
- **The Brain**: We use a famous AI architecture called **MobileNetV2** (built with TensorFlow/Keras). We chose MobileNet because it is extremely fast and lightweight, making it perfect for web and mobile apps.
- **The Process**: The AI takes a standard image, squashes it into a perfect square (224x224 pixels), and guesses between 4 categories: Ectomorph, Mesomorph, Endomorph, or "No Person". 
- **Training**: To make this work in production, this AI is fed thousands of pictures of different body types so it learns the patterns (Transfer Learning). 

### B. The Backend (The Engine Room)
- **Language**: Python.
- **Framework**: **FastAPI**. We use this because it is blazing fast and handles multiple requests at once easily.
- **Database**: We use **Supabase (PostgreSQL)**. Supabase acts as our database to securely store user profiles, food data, workout logs, and exercise libraries. It also handles secure user logins (Authentication).
- **Core Logic**: We use strict "If/Then" mathematical rules in Python to calculate diets and assign exercises based on the data we pull from Supabase.

### C. The Frontend (What the User Sees)
- **Language/Framework**: **React 19** powered by **Vite** (for incredibly fast loading and building).
- **Styling**: **Tailwind CSS**. This allows us to make beautiful, modern, and responsive designs quickly by writing styles directly into our code.
- **API Calls**: We use **Axios** to talk to our Python backend, sending user data and photos, and receiving the generated workout plans back.

---
### Summary
SOMA takes a photo and a few questions, uses an AI to figure out your body type, applies strict sports science math in a fast Python server, and sends a perfectly personalized, injury-safe plan to a sleek React interface.
