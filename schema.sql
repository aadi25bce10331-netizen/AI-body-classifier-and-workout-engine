-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for experience level
CREATE TYPE experience_level_enum AS ENUM ('beginner', 'intermediate', 'pro');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    experience_level experience_level_enum DEFAULT 'beginner',
    past_injury VARCHAR(50) DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food items reference table
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    protein_per_100g DECIMAL(5, 2) NOT NULL,
    carbs_per_100g DECIMAL(5, 2) NOT NULL,
    fat_per_100g DECIMAL(5, 2) NOT NULL,
    calories_per_100g DECIMAL(6, 2) NOT NULL
);

-- Enum for somatotypes (target features)
CREATE TYPE somatotype_enum AS ENUM ('Ectomorph', 'Mesomorph', 'Endomorph');

-- Macro presets
CREATE TABLE macro_presets (
    target_feature somatotype_enum PRIMARY KEY,
    protein_pct DECIMAL(5, 2) NOT NULL,
    carbs_pct DECIMAL(5, 2) NOT NULL,
    fat_pct DECIMAL(5, 2) NOT NULL
);

-- Exercises bank
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tier INT DEFAULT 1,
    contraindicated_injury VARCHAR(50),
    substitution_exercise_id UUID REFERENCES exercises(id)
);

-- Workout logs
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercise logs (performance tracking)
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rpe_score INT CHECK (rpe_score >= 1 AND rpe_score <= 10),
    set_number INT NOT NULL,
    target_reps INT NOT NULL,
    completed_reps INT NOT NULL,
    weight_kg DECIMAL(6, 2) NOT NULL
);

-- Current user workout (cached routine state)
CREATE TABLE current_user_workout (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    workout_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_exercise_logs_user_muscle ON exercise_logs(user_id, exercise_id);
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, completed_at);
