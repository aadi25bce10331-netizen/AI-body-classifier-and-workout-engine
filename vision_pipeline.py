import math
import cv2
import numpy as np
import mediapipe as mp


def classify_body_type(image, age, gender, height_cm=None):
    """
    Classifies body type using MediaPipe Pose and Segmentation.
    Compares waist flesh to shoulder flesh for highly accurate V-taper detection,
    using torso-isolating logic to exclude arms from the shoulder measurement.
    Falls back to skeletal bone ratios if segmentation is unclear.
    """
    if image is None:
        return {"status": "error", "message": "Invalid image data."}

    mp_pose = mp.solutions.pose
    mp_face = mp.solutions.face_detection

    # --- Person-count gate ---
    with mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detector:
        face_results = face_detector.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        num_faces = len(face_results.detections) if face_results and face_results.detections else 0
        if num_faces > 1:
            return {
                "status": "error",
                "message": f"Multiple persons detected ({num_faces}). Please upload a photo with only one person.",
            }

    image_h, image_w = image.shape[:2]

    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        enable_segmentation=True,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if not results.pose_landmarks:
            return {"status": "error", "message": "No person detected. Ensure full body is clearly visible."}

        lm = results.pose_landmarks.landmark

        def to_px(landmark):
            return int(landmark.x * image_w), int(landmark.y * image_h)

        l_shoulder = to_px(lm[11])
        r_shoulder = to_px(lm[12])
        l_hip      = to_px(lm[23])
        r_hip      = to_px(lm[24])
        l_ankle    = to_px(lm[27])
        r_ankle    = to_px(lm[28])
        nose       = to_px(lm[0])

        # 1. Base skeletal metrics
        skeletal_shoulder_width = math.sqrt(
            (l_shoulder[0] - r_shoulder[0]) ** 2 + (l_shoulder[1] - r_shoulder[1]) ** 2
        )
        skeletal_hip_width = math.sqrt(
            (l_hip[0] - r_hip[0]) ** 2 + (l_hip[1] - r_hip[1]) ** 2
        )
        mid_ankle_y    = (l_ankle[1] + r_ankle[1]) / 2
        body_height_px = abs(mid_ankle_y - nose[1])

        if body_height_px == 0 or skeletal_shoulder_width == 0:
            return {"status": "error", "message": "Invalid posture detection."}

        frame_index = skeletal_shoulder_width / body_height_px
        shr         = skeletal_shoulder_width / (skeletal_hip_width if skeletal_hip_width > 0 else 1)

        # 2. Flesh-to-flesh metrics (isolating the torso from arms)
        mask = results.segmentation_mask

        def get_flesh_width(y_index, expected_center_x):
            """Finds the torso width at a given row, ignoring detached arm pixels."""
            if mask is None or y_index >= image_h or y_index < 0:
                return 0

            row = mask[y_index, :] > 0.5

            # Find contiguous pixel blocks
            diff   = np.diff(row.astype(int))
            starts = np.where(diff == 1)[0] + 1
            ends   = np.where(diff == -1)[0] + 1

            if row[0]:  starts = np.insert(starts, 0, 0)
            if row[-1]: ends   = np.append(ends, len(row))

            if len(starts) == 0:
                return 0

            # Return the block that contains the body's center (spine X)
            for s, e in zip(starts, ends):
                if s <= expected_center_x <= e:
                    return int(e - s)

            # Fallback: widest continuous block
            return int(np.max(ends - starts))

        # Y coordinates and body center X coordinates
        shoulder_y        = min(int((l_shoulder[1] + r_shoulder[1]) / 2) + int(body_height_px * 0.02), image_h - 1)
        waist_y           = max(0, min(int((l_shoulder[1] + l_hip[1]) / 2), image_h - 1))
        shoulder_center_x = (l_shoulder[0] + r_shoulder[0]) // 2
        waist_center_x    = (l_hip[0] + r_hip[0]) // 2

        shoulder_flesh_width = get_flesh_width(shoulder_y, shoulder_center_x)
        waist_flesh_width    = get_flesh_width(waist_y, waist_center_x)

        # Fallback to skeletal bones if segmentation fails completely
        if shoulder_flesh_width == 0 or waist_flesh_width == 0:
            shoulder_flesh_width = skeletal_shoulder_width
            waist_flesh_width    = skeletal_hip_width

        # True flesh V-taper ratio
        flesh_ratio = waist_flesh_width / shoulder_flesh_width
        age_offset  = 0.02 if int(age) > 35 else 0.0

        gender_norm = str(gender).strip().lower()

        # 3. Final classification logic
        if gender_norm == "male":
            # ENDOMORPH: True waist flesh is extremely wide
            if flesh_ratio >= (0.95 - age_offset):
                body_type = "Endomorph"
            elif flesh_ratio >= (0.90 - age_offset) and shr < 1.40:
                body_type = "Endomorph"

            # ECTOMORPH: Expanded frame_index to catch lean, straight figures
            # (Bumped from 0.223 up to 0.228)
            elif frame_index < 0.228 and flesh_ratio < 0.94:
                body_type = "Ectomorph"

            # MESOMORPH: Must have genuinely broad shoulders (>= 0.228)
            # combined with a strong V-Taper
            elif flesh_ratio < 0.88 and frame_index >= 0.228:
                body_type = "Mesomorph"
            elif shr >= 1.48 and frame_index >= 0.228:
                body_type = "Mesomorph"

            # MILD ENDOMORPH: Explicit flesh check before fallback
            elif flesh_ratio > (0.91 - age_offset):
                body_type = "Endomorph"

            # FALLBACK: Purely skeletal checks
            else:
                if frame_index < 0.228:
                    body_type = "Ectomorph"
                elif shr < 1.42:
                    body_type = "Endomorph"
                else:
                    body_type = "Mesomorph"

        else:
            # FEMALE CALIBRATION (naturally wider pelvis/waist flesh)
            if flesh_ratio >= (0.96 - age_offset):
                body_type = "Endomorph"
            elif flesh_ratio >= (0.92 - age_offset) and shr < 1.30:
                body_type = "Endomorph"

            elif frame_index < 0.212 and flesh_ratio < 0.95:
                body_type = "Ectomorph"

            elif flesh_ratio < 0.89 and frame_index >= 0.212:
                body_type = "Mesomorph"
            elif shr >= 1.38 and frame_index >= 0.212:
                body_type = "Mesomorph"

            # MILD ENDOMORPH: Explicit flesh check before fallback
            elif flesh_ratio > (0.93 - age_offset):
                body_type = "Endomorph"

            # FALLBACK: Purely skeletal checks
            else:
                if frame_index < 0.215:
                    body_type = "Ectomorph"
                elif shr < 1.30:
                    body_type = "Endomorph"
                else:
                    body_type = "Mesomorph"

        return {
            "status": "success",
            "body_type": body_type,
            "metrics": {
                "flesh_ratio": round(flesh_ratio, 3),
                "frame_index": round(frame_index, 3),
                "skeletal_shr": round(shr, 3),
                "waist_flesh_px": round(float(waist_flesh_width), 1),
                "shoulder_flesh_px": round(float(shoulder_flesh_width), 1),
                "age_offset_applied": round(age_offset, 3),
                "age_applied": age,
                "gender_applied": gender_norm,
                "height_cm": height_cm,
            },
        }
