from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Any, Dict
from uuid import UUID
from datetime import datetime

class BiometricAnalysisRequest(BaseModel):
    age: int = Field(..., gt=0)
    gender: Literal['male', 'female', 'other']
    height_cm: float = Field(..., gt=0)
    weight_kg: float = Field(..., gt=0)
    target_goal: Literal['Muscle_Gain', 'Fat_Loss', 'Maintenance']
    plan_duration_weeks: Literal[4, 8, 12]
    experience_level: Literal['beginner', 'intermediate', 'pro']
    lifestyle_level: Literal['Sedentary', 'Lightly Active', 'Highly Active']
    injury_tag: Literal['lumbar_disc', 'patellar_tendon', 'rotator_cuff', 'cervical_spine', 'ac_joint', 'tennis_elbow', 'plantar_fasciitis', 'wrist_tfcc', 'None']
    injury_state: Literal['Acute', 'Chronic', 'None']
    schedule_choice: Literal['Pre-Built', 'Custom']
    custom_weekly_array: Optional[str] = None # Will receive as comma separated string from form data

class MacroSplitResponse(BaseModel):
    protein_pct: float
    carbs_pct: float
    fat_pct: float

class AnalysisResultResponse(BaseModel):
    bmi: float
    bmr: float
    somatotype: str
    macro_split: MacroSplitResponse
    rest_day_calories: float
    workout_day_calories: float

class WorkoutResetRequest(BaseModel):
    user_id: UUID
    experience_level: Literal['beginner', 'intermediate', 'pro']
    lifestyle_level: Literal['Sedentary', 'Lightly Active', 'Highly Active']
    injury_tag: str
    injury_state: str
    weight_kg: float
    target_goal: Literal['Muscle_Gain', 'Fat_Loss', 'Maintenance']
    schedule_choice: Literal['Pre-Built', 'Custom']
    custom_weekly_array: Optional[List[str]] = None
    plan_duration_weeks: int
    age: int
    equipment_preference: Literal['gym', 'calisthenics'] = 'gym'
    # Previous plan card data for progression logic
    prev_completion_pct: Optional[float] = None   # 0–100 float
    prev_plan_card_id: Optional[str] = None
    prev_weight_bump: float = 0.0
    high_score_count: int = 0

class ExerciseLogCreate(BaseModel):
    exercise_id: UUID
    rpe_score: int = Field(..., ge=1, le=10)
    set_number: int = Field(..., gt=0)
    target_reps: int = Field(..., gt=0)
    completed_reps: int = Field(..., ge=0)
    weight_kg: float = Field(..., ge=0)

class WorkoutSwapDayRequest(BaseModel):
    user_id: UUID
    muscle_group: str
    experience_level: str
    injury_tag: str
    injury_state: str
    lifestyle_level: str
    weight_kg: float
    age: int
    target_goal: str
    equipment_preference: str
    weight_bump_applied: float = 0.0

# ── Plan Card Models ────────────────────────────────────────────
class PlanCardCreate(BaseModel):
    user_id: UUID
    plan_duration_weeks: int
    total_workout_days: int
    experience_level_at_generation: str
    weight_bump_applied: float = 0.0
    equipment_preference: str = 'gym'
    routine: Dict[str, Any]

class PlanCardResponse(BaseModel):
    id: str
    user_id: str
    generated_at: Optional[datetime]
    plan_duration_weeks: int
    total_workout_days: int
    attended_days: int
    skipped_days: int
    streak: int
    completion_pct: float
    is_active: bool
    experience_level_at_generation: str
    weight_bump_applied: float
    routine: Optional[Dict[str, Any]]
