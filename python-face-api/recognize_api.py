from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import base64
import time
import traceback

app = Flask(__name__)
CORS(app)


# --------------------------
# ENROLL WITH 20 TRAINING IMAGES
# --------------------------
@app.route("/enroll", methods=["POST"])
def enroll():
    data = request.get_json()
    prn = data["prn"]
    image_data = data["image"].split(",")[1]

    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    captured_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    student_folder = os.path.join("faces", prn)
    os.makedirs(student_folder, exist_ok=True)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades +
                                         "haarcascade_frontalface_default.xml")

    gray = cv2.cvtColor(captured_img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.2, 5)

    if len(faces) == 0:
        return jsonify({"message": "No face detected"}), 400

    (x, y, w, h) = faces[0]
    face_only = gray[y:y + h, x:x + w]

    # Save 20 slightly augmented images
    for i in range(1, 21):
        img_name = f"{prn}_{i}.jpg"
        img_path = os.path.join(student_folder, img_name)

        augmented = cv2.resize(face_only, (200, 200))

        noise = np.random.randint(0, 5, (200, 200), dtype="uint8")
        augmented = cv2.add(augmented, noise)

        cv2.imwrite(img_path, augmented)

    return jsonify({"message": f"{prn} enrolled with 20 face samples!"})


# --------------------------
# TRAIN LBPH MODEL
# --------------------------
def train_model():
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    faces = []
    labels = []
    label_map = {}
    current_label = 0

    if not os.path.exists("faces"):
        return None, None

    for prn in os.listdir("faces"):
        folder = os.path.join("faces", prn)
        if not os.path.isdir(folder):
            continue

        if prn not in label_map:
            label_map[prn] = current_label
            current_label += 1

        for file in os.listdir(folder):
            path = os.path.join(folder, file)
            img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)

            if img is None:
                continue

            faces.append(img)
            labels.append(label_map[prn])

    if len(faces) < 5:
        raise ValueError("Not enough training images.")

    recognizer.train(faces, np.array(labels))
    return recognizer, {v: k for k, v in label_map.items()}


# --------------------------
# FACE RECOGNITION ENDPOINT
# --------------------------
@app.route("/recognize", methods=["POST", "OPTIONS"])
def recognize():
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    try:
        data = request.get_json()
        image_data = data["image"].split(",")[1]

        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        recognizer, name_map = train_model()

        if recognizer is None or name_map is None:
            return jsonify({"error": "Model not trained. No face samples found in the system."}), 400

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades +
                                             "haarcascade_frontalface_default.xml")

        faces = face_cascade.detectMultiScale(gray, 1.2, 5)

        if len(faces) == 0:
            return jsonify({"prn": "No face detected"})

        (x, y, w, h) = faces[0]
        face_img = gray[y:y + h, x:x + w]

        # Resize to match training size (200, 200)
        face_img = cv2.resize(face_img, (200, 200))

        label, confidence = recognizer.predict(face_img)
        prn = name_map.get(label, "Unknown")

        print(f"Predicted Label: {label}, Confidence: {confidence:.2f}, PRN: {prn}")
        print(f"Available labels: {name_map}")

        # Set confidence threshold (lower is better match)
        # LBPH typically returns 0-100, where <50 is good match
        if confidence > 70:
            prn = "Not found"
            print(f"Confidence {confidence:.2f} too high, marking as 'Not found'")

        return jsonify({
            "prn": prn,
            "confidence": float(confidence)
        })

    except Exception as e:
        print(f"ERROR in /recognize endpoint:")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000)
