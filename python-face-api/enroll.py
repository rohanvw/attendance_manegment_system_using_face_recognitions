from flask import Flask, request, jsonify
import cv2
import os
import numpy as np
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

@app.route('/enroll', methods=['POST'])
def enroll_person():
    data = request.json
    prn = data.get('prn')
    image_data = data.get('image')

    if not prn or not image_data:
        return jsonify({'message': 'PRN or image data missing'}), 400

    folder = os.path.join("faces", prn)
    os.makedirs(folder, exist_ok=True)

    # Convert base64 → image
    try:
        img_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return jsonify({'message': 'Invalid image format'}), 400

    # Detect face
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.2, 5)

    if len(faces) == 0:
        return jsonify({'message': 'No face detected'}), 400

    (x, y, w, h) = faces[0]
    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (200, 200))

    # Save 20 training images
    for i in range(1, 21):
        img_name = f"{prn}_{i}.jpg"
        path = os.path.join(folder, img_name)
        cv2.imwrite(path, face)

    return jsonify({'message': 'Enrollment complete with 20 images!'}), 200


if __name__ == "__main__":
    app.run(port=5000)
