# Real Exercise Database

REHAB_DATABASE = {
    "lumbar_disc": [
        {"name": "Bird-Dog", "sets": 3, "target_reps": 10, "target_weight_kg": 0},
        {"name": "McGill Curl-up", "sets": 3, "target_reps": 10, "target_weight_kg": 0}
    ],
    "patellar_tendon": [
        {"name": "Spanish Squat Hold", "sets": 3, "target_reps": 45, "target_weight_kg": 0}, # reps can represent seconds here
        {"name": "Terminal Knee Extension", "sets": 3, "target_reps": 15, "target_weight_kg": 0}
    ],
    "rotator_cuff": [
        {"name": "Side-lying External Rotation", "sets": 3, "target_reps": 15, "target_weight_kg": 2},
        {"name": "Scapular Wall Slides", "sets": 3, "target_reps": 15, "target_weight_kg": 0}
    ],
    "cervical_spine": [
        {"name": "Chin Tucks", "sets": 3, "target_reps": 15, "target_weight_kg": 0},
        {"name": "Isometric Neck Hold", "sets": 3, "target_reps": 10, "target_weight_kg": 0}
    ],
    "ac_joint": [
        {"name": "Shoulder Shrugs (Light)", "sets": 3, "target_reps": 20, "target_weight_kg": 5},
        {"name": "Band Pull-Aparts", "sets": 3, "target_reps": 15, "target_weight_kg": 0}
    ],
    "tennis_elbow": [
        {"name": "Eccentric Wrist Extension", "sets": 3, "target_reps": 15, "target_weight_kg": 2},
        {"name": "Tyler Twist (FlexBar)", "sets": 3, "target_reps": 15, "target_weight_kg": 0}
    ],
    "plantar_fasciitis": [
        {"name": "Towel Scrunches", "sets": 3, "target_reps": 20, "target_weight_kg": 0},
        {"name": "Calf Stretch on Step", "sets": 3, "target_reps": 15, "target_weight_kg": 0}
    ],
    "wrist_tfcc": [
        {"name": "Wrist Supination/Pronation", "sets": 3, "target_reps": 15, "target_weight_kg": 1},
        {"name": "Grip Squeezes", "sets": 3, "target_reps": 20, "target_weight_kg": 0}
    ]
}


EXERCISE_DATABASE = {
    "Chest": [
        {"name": "Push-Up (Kneeling)", "difficulty": "beginner", "equipment": "calisthenics", "injury_tags": ["wrist_tfcc"], "is_posture": False, "min_age": 8, "max_age": 90, "default_weight_kg": 0},
        {"name": "Standard Push-Up", "difficulty": "intermediate", "equipment": "calisthenics", "injury_tags": ["wrist_tfcc", "ac_joint"], "is_posture": False, "min_age": 10, "max_age": 75, "default_weight_kg": 0},
        {"name": "Decline Push-Up", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["wrist_tfcc", "rotator_cuff"], "is_posture": False, "min_age": 14, "max_age": 60, "default_weight_kg": 0},
        {"name": "Diamond Push-Up", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["wrist_tfcc", "tennis_elbow"], "is_posture": False, "min_age": 14, "max_age": 60, "default_weight_kg": 0},
        
        {"name": "Barbell Bench Press", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["rotator_cuff", "ac_joint"], "is_posture": False, "min_age": 15, "max_age": 65, "default_weight_kg": 60},
        {"name": "Dumbbell Floor Press", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["rotator_cuff"], "is_posture": True, "min_age": 12, "max_age": 85, "default_weight_kg": 20},
        {"name": "Cable Chest Fly", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["ac_joint"], "is_posture": False, "min_age": 14, "max_age": 80, "default_weight_kg": 15},
        {"name": "Parallel Bar Dips", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["ac_joint", "rotator_cuff"], "is_posture": False, "min_age": 16, "max_age": 55, "default_weight_kg": 0},
        {"name": "Incline Dumbbell Press", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["ac_joint"], "is_posture": False, "min_age": 14, "max_age": 75, "default_weight_kg": 20},
    ],
    "Shoulders": [
        {"name": "Pike Push-Up (Feet on Floor)", "difficulty": "intermediate", "equipment": "calisthenics", "injury_tags": ["rotator_cuff", "cervical_spine"], "is_posture": False, "min_age": 12, "max_age": 65, "default_weight_kg": 0},
        {"name": "Elevated Pike Push-Up", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["rotator_cuff", "cervical_spine"], "is_posture": False, "min_age": 14, "max_age": 55, "default_weight_kg": 0},
        {"name": "Wall Walks", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["rotator_cuff", "wrist_tfcc"], "is_posture": False, "min_age": 14, "max_age": 50, "default_weight_kg": 0},
        
        {"name": "Seated Dumbbell Press", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["lumbar_disc", "rotator_cuff"], "is_posture": False, "min_age": 14, "max_age": 70, "default_weight_kg": 15},
        {"name": "Standing Overhead Press", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc", "cervical_spine"], "is_posture": False, "min_age": 16, "max_age": 60, "default_weight_kg": 40},
        {"name": "Dumbbell Lateral Raise", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["rotator_cuff"], "is_posture": False, "min_age": 12, "max_age": 85, "default_weight_kg": 10},
    ],
    "Arms": [
        {"name": "Chair Dips (Bent Knees)", "difficulty": "beginner", "equipment": "calisthenics", "injury_tags": ["ac_joint", "rotator_cuff"], "is_posture": False, "min_age": 10, "max_age": 85, "default_weight_kg": 0},
        {"name": "Chair Dips (Straight Legs)", "difficulty": "intermediate", "equipment": "calisthenics", "injury_tags": ["ac_joint", "rotator_cuff"], "is_posture": False, "min_age": 12, "max_age": 70, "default_weight_kg": 0},
        {"name": "Bodyweight Tricep Extensions", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["tennis_elbow"], "is_posture": False, "min_age": 14, "max_age": 60, "default_weight_kg": 0},
        
        {"name": "Tricep Rope Pushdown", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["tennis_elbow"], "is_posture": False, "min_age": 10, "max_age": 90, "default_weight_kg": 20},
        {"name": "Incline Dumbbell Curl", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["tennis_elbow"], "is_posture": False, "min_age": 14, "max_age": 70, "default_weight_kg": 12},
        {"name": "Hammer Dumbbell Curl", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["tennis_elbow"], "is_posture": False, "min_age": 12, "max_age": 85, "default_weight_kg": 14},
    ],
    "Back": [
        {"name": "Superman Holds", "difficulty": "beginner", "equipment": "calisthenics", "injury_tags": ["lumbar_disc"], "is_posture": True, "min_age": 8, "max_age": 90, "default_weight_kg": 0, "time_based": True},
        {"name": "Doorway Rows", "difficulty": "intermediate", "equipment": "calisthenics", "injury_tags": ["tennis_elbow"], "is_posture": True, "min_age": 12, "max_age": 80, "default_weight_kg": 0},
        {"name": "Towel Sliding Pull-Ins", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["tennis_elbow"], "is_posture": True, "min_age": 14, "max_age": 60, "default_weight_kg": 0},
        {"name": "Pull-Up / Chin-Up (Bodyweight)", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["rotator_cuff", "tennis_elbow"], "is_posture": False, "min_age": 14, "max_age": 60, "default_weight_kg": 0},

        {"name": "Lat Pulldown", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["cervical_spine", "rotator_cuff"], "is_posture": True, "min_age": 10, "max_age": 80, "default_weight_kg": 45},
        {"name": "Barbell Deadlift", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc", "wrist_tfcc"], "is_posture": False, "min_age": 16, "max_age": 60, "default_weight_kg": 80},
        {"name": "Chest-Supported Row", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["tennis_elbow"], "is_posture": True, "min_age": 12, "max_age": 85, "default_weight_kg": 30},
        {"name": "Pull-Up (Assisted)", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["rotator_cuff"], "is_posture": False, "min_age": 14, "max_age": 60, "default_weight_kg": 0},
        {"name": "Seated Cable Row", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["lumbar_disc"], "is_posture": True, "min_age": 12, "max_age": 80, "default_weight_kg": 40},
        {"name": "Single-Arm Dumbbell Row", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["lumbar_disc"], "is_posture": True, "min_age": 14, "max_age": 75, "default_weight_kg": 20},
        {"name": "Face Pulls", "difficulty": "beginner", "equipment": "gym", "injury_tags": [], "is_posture": True, "min_age": 10, "max_age": 90, "default_weight_kg": 15},
        {"name": "Barbell Bent-Over Row", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc"], "is_posture": False, "min_age": 16, "max_age": 65, "default_weight_kg": 50},
    ],
    "Legs": [
        {"name": "Bodyweight Squat", "difficulty": "beginner", "equipment": "calisthenics", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 8, "max_age": 90, "default_weight_kg": 0},
        {"name": "Walking Lunges", "difficulty": "intermediate", "equipment": "calisthenics", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 12, "max_age": 80, "default_weight_kg": 0},
        {"name": "Bulgarian Split Squat (No Weight)", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 14, "max_age": 70, "default_weight_kg": 0},
        {"name": "Pistol Squats (Assisted/Full)", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 16, "max_age": 50, "default_weight_kg": 0},

        {"name": "Goblet Squat", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 10, "max_age": 80, "default_weight_kg": 20},
        {"name": "Barbell Back Squat", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc", "patellar_tendon"], "is_posture": False, "min_age": 16, "max_age": 65, "default_weight_kg": 60},
        {"name": "Romanian Deadlift (RDL)", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc"], "is_posture": True, "min_age": 14, "max_age": 70, "default_weight_kg": 50},
        {"name": "Leg Press Machine", "difficulty": "beginner", "equipment": "gym", "injury_tags": [], "is_posture": False, "min_age": 14, "max_age": 85, "default_weight_kg": 100},
        {"name": "Bulgarian Split Squat (Dumbbells)", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 14, "max_age": 65, "default_weight_kg": 20},
        {"name": "Leg Extensions", "difficulty": "beginner", "equipment": "gym", "injury_tags": ["patellar_tendon"], "is_posture": False, "min_age": 12, "max_age": 85, "default_weight_kg": 35},
        {"name": "Lying Leg Curl", "difficulty": "beginner", "equipment": "gym", "injury_tags": [], "is_posture": False, "min_age": 12, "max_age": 90, "default_weight_kg": 30},
        {"name": "Kettlebell Swings", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc"], "is_posture": False, "min_age": 16, "max_age": 60, "default_weight_kg": 16},
    ],
    "Core": [
        {"name": "Knee Plank", "difficulty": "beginner", "equipment": "calisthenics", "injury_tags": ["cervical_spine"], "is_posture": False, "min_age": 8, "max_age": 90, "default_weight_kg": 0, "time_based": True},
        {"name": "Full Plank (Core Static)", "difficulty": "intermediate", "equipment": "calisthenics", "injury_tags": ["cervical_spine"], "is_posture": False, "min_age": 10, "max_age": 85, "default_weight_kg": 0, "time_based": True},
        {"name": "Lying Leg Raises", "difficulty": "pro", "equipment": "calisthenics", "injury_tags": ["lumbar_disc"], "is_posture": False, "min_age": 12, "max_age": 75, "default_weight_kg": 0},

        {"name": "Cable Crunches", "difficulty": "intermediate", "equipment": "gym", "injury_tags": ["lumbar_disc", "cervical_spine"], "is_posture": False, "min_age": 14, "max_age": 75, "default_weight_kg": 30},
        {"name": "Hanging Leg Raise", "difficulty": "pro", "equipment": "gym", "injury_tags": ["lumbar_disc", "wrist_tfcc"], "is_posture": False, "min_age": 14, "max_age": 60, "default_weight_kg": 0},
    ]
}


def get_exercises_for_group(
    muscle_group: str, 
    experience_level: str, 
    injury_tag: str, 
    injury_state: str,
    lifestyle_level: str,
    age: int,
    count: int,
    base_sets: int,
    base_reps: int,
    weight_kg: float,
    equipment_preference: str = 'gym'
) -> list:
    """
    STAGES 2, 3 & 5: Filters and scales exercises based on strict logic.
    """
    
    # Check if injury is Acute and matches the muscle group
    injury_to_muscle = {
        "lumbar_disc": ["Back", "Legs", "Core"],
        "patellar_tendon": ["Legs"],
        "rotator_cuff": ["Chest", "Shoulders", "Back"],
        "cervical_spine": ["Back", "Shoulders"],
        "ac_joint": ["Chest", "Shoulders"],
        "tennis_elbow": ["Arms", "Back"],
        "plantar_fasciitis": ["Legs"],
        "wrist_tfcc": ["Arms", "Chest"]
    }

    is_muscle_affected_by_injury = injury_tag != 'None' and muscle_group in injury_to_muscle.get(injury_tag, [])

    if is_muscle_affected_by_injury and injury_state == 'Acute':
        rehab_exs = REHAB_DATABASE.get(injury_tag, [])
        return rehab_exs

    all_exercises = EXERCISE_DATABASE.get(muscle_group, [])
    if not all_exercises:
        return []

    # Filter by Equipment
    equip_filtered = [ex for ex in all_exercises if ex.get('equipment', 'gym') == equipment_preference]
    
    # Fallback to any equipment if none found (safety net)
    if not equip_filtered:
        equip_filtered = all_exercises

    # The Age Gate
    age_filtered = [ex for ex in equip_filtered if ex['min_age'] <= age <= ex['max_age']]
    
    safe_exercises = []
    # Injury Severity Pathing
    for ex in age_filtered:
        if injury_tag != 'None' and injury_tag in ex['injury_tags']:
            if injury_state == 'Chronic':
                ex_copy = dict(ex)
                ex_copy['capped_frequency'] = 1
                safe_exercises.append(ex_copy)
            elif injury_state == 'Acute':
                continue
        else:
            safe_exercises.append(dict(ex))

    # Stage 3: Lifestyle Prioritization (Posture Auto-Correction)
    if lifestyle_level == "Sedentary":
        # Sort so that #posture exercises are at the top
        safe_exercises.sort(key=lambda x: not x['is_posture'])
    else:
        # Standard difficulty matching
        exp_order = {'beginner': 0, 'intermediate': 1, 'pro': 2}
        user_level = exp_order.get(experience_level, 1)
        safe_exercises.sort(key=lambda x: abs(exp_order.get(x['difficulty'], 1) - user_level))

    # Stage 5: Volume & Rest Scaling
    if experience_level == 'beginner':
        final_sets = base_sets
        final_reps = base_reps
        rest_sec = 90
    elif experience_level == 'intermediate':
        final_sets = round(base_sets * 1.33)
        final_reps = round(base_reps * 1.25)
        rest_sec = 60
    else: # Pro
        final_sets = round(base_sets * 1.66)
        final_reps = round(base_reps * 1.50)
        rest_sec = 45

    selected = []
    for i in range(count):
        if safe_exercises:
            ex = safe_exercises[i % len(safe_exercises)]
            
            # Personalize weight
            bw_ratio = weight_kg / 75.0
            personalized_weight = round(ex['default_weight_kg'] * bw_ratio, 1)

            selected.append({
                "name": ex['name'] + (" [Chronic Cap 1x/Wk]" if ex.get("capped_frequency") else "") + (" [Posture]" if ex['is_posture'] and lifestyle_level == "Sedentary" else ""),
                "sets": final_sets,
                "target_reps": final_reps,
                "target_weight_kg": personalized_weight,
                "time_based": ex.get('time_based', False),
                "rest_seconds": rest_sec
            })

    return selected
