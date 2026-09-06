import io
import math
from typing import List, Dict, Any
from uuid import UUID

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from schemas import (
    AnalysisResultResponse, MacroSplitResponse,
    WorkoutResetRequest
)
from exercises import get_exercises_for_group
from vision_pipeline import classify_body_type

router = APIRouter()



# ==========================================
# NUTRITION ENGINE (AI-Free Rule-Based)
# ==========================================
def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """Stage 2: Strict Mifflin-St Jeor formula"""
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    if gender.lower() == 'male':
        return base + 5
    elif gender.lower() == 'female':
        return base - 161
    else:
        return base - 78 # Average fallback

def calculate_calories(bmr: float, lifestyle_level: str, workout_level: str, goal: str) -> dict:
    """Stages 3, 4, 5, 6: Strict Energy Cost Rules"""
    # Stage 3: Lifestyle NEAT Baseline
    neat_multipliers = {
        'Sedentary': 1.15,
        'Lightly Active': 1.25,
        'Highly Active': 1.40
    }
    baseline = bmr * neat_multipliers.get(lifestyle_level, 1.15)

    # Stage 4: Exercise Energy Cost
    workout_costs = {
        'beginner': 150,
        'intermediate': 250,
        'pro': 400
    }
    workout_cost = workout_costs.get(workout_level, 150)

    # Stage 5: Hard Goal Modifiers
    goal_modifiers = {
        'Muscle_Gain': 400,
        'Fat_Loss': -450,
        'Maintenance': 0
    }
    goal_mod = goal_modifiers.get(goal, 0)

    # Stage 6: Finalize Targets
    rest_day = baseline + goal_mod
    workout_day = baseline + workout_cost + goal_mod

    return {
        "rest_day_calories": round(rest_day, 0),
        "workout_day_calories": round(workout_day, 0)
    }

def get_macro_split(somatotype: str) -> dict:
    """Stage 7: Fixed Percentage Allocation Based on Somatotype"""
    presets = {
        'Ectomorph': {'protein_pct': 30, 'carbs_pct': 50, 'fat_pct': 20}, # High Carb
        'Mesomorph': {'protein_pct': 30, 'carbs_pct': 40, 'fat_pct': 30}, # Balanced
        'Endomorph': {'protein_pct': 40, 'carbs_pct': 25, 'fat_pct': 35}, # Low Carb
    }
    return presets.get(somatotype, presets['Mesomorph'])


@router.post("/api/analyze", response_model=AnalysisResultResponse)
async def analyze_biometrics(
    age: int = Form(...),
    gender: str = Form(...),
    height_cm: float = Form(...),
    weight_kg: float = Form(...),
    target_goal: str = Form(...),
    plan_duration_weeks: int = Form(...),
    experience_level: str = Form(...),
    lifestyle_level: str = Form("Sedentary"),
    injury_tag: str = Form("None"),
    injury_state: str = Form("None"),
    schedule_choice: str = Form("Pre-Built"),
    photo: UploadFile = File(...)
):
    """
    Endpoint for initial user analysis.
    """
    contents = await photo.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image uploaded.")

    # Run the new MediaPipe classification pipeline
    classification_result = classify_body_type(image, age, gender, height_cm)
    
    if classification_result["status"] == "error":
        raise HTTPException(status_code=400, detail=classification_result["message"])
        
    somatotype = classification_result["body_type"]

    # Execute Rule-Based Nutrition Pipeline
    bmi = weight_kg / ((height_cm / 100) ** 2)
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    cal_targets = calculate_calories(bmr, lifestyle_level, experience_level, target_goal)
    macro_split = get_macro_split(somatotype)

    return AnalysisResultResponse(
        bmi=round(bmi, 1),
        bmr=round(bmr, 0),
        somatotype=somatotype,
        macro_split=MacroSplitResponse(**macro_split),
        rest_day_calories=cal_targets['rest_day_calories'],
        workout_day_calories=cal_targets['workout_day_calories']
    )


# ==========================================
# CALENDAR DISTRIBUTION ENGINE
# ==========================================
def generate_weekly_pattern(schedule_choice: str, experience_level: str, custom_array: list = None) -> list:
    """Stage 1: Process System Inputs for the Calendar Engine"""
    if schedule_choice == 'Custom' and custom_array:
        # User defined array (must be 7 days)
        return custom_array[:7]
    
    # Pre-Built logic
    if experience_level == 'beginner':
        return ["Pull", "Push", "Rest", "Legs", "Pull", "Rest", "Push"]
    elif experience_level == 'intermediate':
        return ["Pull", "Push", "Legs", "Rest", "Pull", "Push", "Rest"]
    else: # pro
        return ["Pull", "Push", "Legs", "Pull", "Push", "Legs", "Rest"]


# ==========================================
# WORKOUT ENGINE
# ==========================================
def evaluate_and_generate_workout(
    user_id: UUID,
    muscle_group: str,
    experience_level: str,
    injury_tag: str,
    injury_state: str,
    lifestyle_level: str,
    weight_kg: float,
    age: int,
    target_goal: str,
    equipment_preference: str = 'gym',
    weight_bump_applied: float = 0.0
) -> dict:
    """
    Executes the strict 5-Stage workout rule engine.
    """
    if muscle_group.lower() == 'rest':
        return None

    # Stage 4: Goal-Based Baseline Environment
    if target_goal == "Muscle_Gain":
        base_sets = 3
        base_reps = 10
        rest_seconds = 90
    elif target_goal == "Fat_Loss":
        base_sets = 3
        base_reps = 15
        rest_seconds = 45
    else: # Maintenance
        base_sets = 3
        base_reps = 12
        rest_seconds = 60

    # Progression logic for Sets and Reps
    if equipment_preference == 'calisthenics':
        if weight_bump_applied != 0:
            rep_increase = int(weight_bump_applied / 2.0)
            base_reps += rep_increase
            set_increase = int(weight_bump_applied / 5.0)
            base_sets += set_increase
    else: # Gym
        if weight_bump_applied != 0:
            # Weight is already progressed via effective_weight, but user requested set/rep scaling too
            rep_increase = int(weight_bump_applied / 5.0)
            base_reps += rep_increase
            set_increase = int(weight_bump_applied / 10.0)
            base_sets += set_increase
            
    # Ensure floors
    base_reps = max(5, base_reps)
    base_sets = max(2, base_sets)


    # Map the high-level program split names (Push, Pull, Upper, Lower, Full Body) 
    # to specific muscle groups to fetch from our exercise database.
    # In a full app, this would be highly robust. For MVP, we map them directly to DB keys.
    db_mapping = {
        "Push": ["Chest", "Shoulders"],
        "Pull": ["Back", "Arms"],
        "Legs": ["Legs"],
        "Upper": ["Chest", "Back", "Shoulders", "Arms"],
        "Lower": ["Legs", "Core"],
        "Full Body": ["Chest", "Back", "Legs", "Core"],
        "Chest": ["Chest"],
        "Back": ["Back"],
        "Core": ["Core"],
        "Arms": ["Arms"],
        "Shoulders": ["Shoulders"]
    }

    target_groups = db_mapping.get(muscle_group, ["Chest"]) # fallback

    # Determine exercise count per muscle group based on experience
    # Constraint: minimum of 4 exercises total per training day.
    base_total = {'beginner': 4, 'intermediate': 5, 'pro': 6}.get(experience_level, 5)
    
    # Use math.ceil to ensure we don't fall below the base_total when splitting across multiple groups
    per_group_count = math.ceil(base_total / len(target_groups))

    exercises_list = []
    
    for group in target_groups:
        # Stages 2, 3, 5 are handled inside get_exercises_for_group
        group_exercises = get_exercises_for_group(
            muscle_group=group,
            experience_level=experience_level,
            injury_tag=injury_tag,
            injury_state=injury_state,
            lifestyle_level=lifestyle_level,
            age=age,
            count=per_group_count,
            base_sets=base_sets,
            base_reps=base_reps,
            weight_kg=weight_kg,
            equipment_preference=equipment_preference
        )
        exercises_list.extend(group_exercises)

    return {
        "muscle_group": muscle_group,
        "rest_seconds": rest_seconds,
        "equipment_preference": equipment_preference,
        "exercises": exercises_list
    }


@router.post("/api/workout/reset")
async def reset_workout(req: WorkoutResetRequest):
    """
    Manual Workout Reset Action.
    Checks the previous plan card's completion percentage and applies
    progressive overload (weight bump and/or level up) before generating the new plan.
    """

    # ── Stage 0: Progression Engine ──────────────────────────────
    # Evaluate previous plan card performance and decide adjustments
    new_weight_bump  = req.prev_weight_bump
    bumped_level     = False
    effective_level  = req.experience_level
    effective_weight = req.weight_kg

    level_order = ["beginner", "intermediate", "pro"]

    if req.prev_completion_pct is not None:
        pct = req.prev_completion_pct

        # Weight progression rules
        if pct < 50.0:
            delta = -2.5
        elif 50.0 <= pct < 75.0:
            delta = 1.5
        else:
            delta = 2.5
            
        new_weight_bump += delta
        
        # Floor the weight bump so weight never drops below 60% of original (-40%)
        min_bump = -0.4 * req.weight_kg
        if new_weight_bump < min_bump:
            new_weight_bump = min_bump
            
        effective_weight = req.weight_kg + new_weight_bump

    # Level progression rules (only increase, never decrease)
    current_idx = level_order.index(req.experience_level) if req.experience_level in level_order else 1
    calculated_idx = 0
    if req.high_score_count >= 6:
        calculated_idx = 2
    elif req.high_score_count >= 4:
        calculated_idx = 1
    
    final_idx = max(current_idx, calculated_idx)
    if final_idx > current_idx:
        effective_level = level_order[final_idx]
        bumped_level = True

    # ── Stage 1: Calendar Distribution Engine ─────────────────────
    weekly_pattern = generate_weekly_pattern(
        req.schedule_choice,
        effective_level,
        req.custom_weekly_array
    )

    # Count total scheduled (non-rest) workout days across the full plan duration
    total_workout_days = sum(
        1
        for week in range(req.plan_duration_weeks)
        for day in weekly_pattern
        if day.lower() != 'rest'
    )

    # ── Stage 2: Workout Generation Engine ───────────────────────
    new_routine = {}

    for i in range(7):
        day_muscle_group = weekly_pattern[i]

        if day_muscle_group.lower() == 'rest':
            continue

        if day_muscle_group not in new_routine:
            day_workout = evaluate_and_generate_workout(
                user_id=req.user_id,
                muscle_group=day_muscle_group,
                experience_level=effective_level,
                injury_tag=req.injury_tag,
                injury_state=req.injury_state,
                lifestyle_level=req.lifestyle_level,
                weight_kg=effective_weight,
                age=req.age,
                target_goal=req.target_goal,
                equipment_preference=req.equipment_preference,
                weight_bump_applied=new_weight_bump
            )
            new_routine[day_muscle_group] = day_workout

    return {
        "message": "Workout routine successfully reset.",
        "weekly_pattern": weekly_pattern,          # The 7-day structure
        "routine_data": new_routine,               # Actual workout data
        # Progression metadata — frontend uses these to create the plan card
        "plan_duration_weeks": req.plan_duration_weeks,
        "total_workout_days": total_workout_days,
        "experience_level_at_generation": effective_level,
        "weight_bump_applied": new_weight_bump,
        "equipment_preference": req.equipment_preference,
        "bumped_level": bumped_level,
        "prev_completion_pct": req.prev_completion_pct,
    }


from schemas import WorkoutSwapDayRequest

@router.post("/api/workout/swap_day")
async def swap_workout_day(req: WorkoutSwapDayRequest):
    """
    On-The-Fly swap to replace a gym day with a calisthenics day.
    """
    day_workout = evaluate_and_generate_workout(
        user_id=req.user_id,
        muscle_group=req.muscle_group,
        experience_level=req.experience_level,
        injury_tag=req.injury_tag,
        injury_state=req.injury_state,
        lifestyle_level=req.lifestyle_level,
        weight_kg=req.weight_kg,
        age=req.age,
        target_goal=req.target_goal,
        equipment_preference=req.equipment_preference,
        weight_bump_applied=req.weight_bump_applied
    )
    
    return {
        "message": f"Successfully swapped {req.muscle_group} to Calisthenics.",
        "day_workout": day_workout
    }
