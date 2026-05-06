import os
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

# ---- SETUP ----
app = Flask(__name__)
CORS(app, origins=["https://8th-sem-project.vercel.app", "http://localhost:3000"])

# ---- LOAD CLASS NAMES ----
with open("classes.json", "r") as f:
    CLASSES = json.load(f)

# ---- LOAD DISEASE DATABASE ----
with open("database/diseases.json", "r") as f:
    DISEASES = json.load(f)

# ---- LOAD MODEL ----
print("Loading model...")
MODEL = tf.keras.models.load_model("model/crop_disease_model.h5")
print("Model loaded successfully!")

# ---- CONFIDENCE THRESHOLD ----
CONFIDENCE_THRESHOLD = 0.60

# ---- HELPER FUNCTION ----
def prepare_image(image):
    image = image.convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image, dtype="float32") / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# ---- ROUTES ----
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Crop Disease Detector API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    try:
        image = Image.open(file.stream)
        prepared = prepare_image(image)

        predictions = MODEL.predict(prepared)
        confidence = float(np.max(predictions))
        predicted_index = int(np.argmax(predictions))
        predicted_class = CLASSES[predicted_index]

        # Confidence threshold check
        if confidence < CONFIDENCE_THRESHOLD:
            response = {
                "status": "low_confidence",
                "message": "Image is unclear. Please retake the photo in better lighting.",
                "confidence": round(confidence * 100, 2)
            }
            print("RESPONSE:", json.dumps(response))
            return jsonify(response)

        # Get disease info from database
        disease_info = DISEASES.get(predicted_class, {
            "name": predicted_class.replace("_", " "),
            "crop": "Unknown",
            "cause": "Information not available",
            "symptoms": "Information not available",
            "treatment": ["Consult a local agricultural officer"],
            "severity": "Unknown"
        })

        response = {
            "status": "success",
            "predicted_class": predicted_class,
            "confidence": round(confidence * 100, 2),
            "disease": disease_info
        } 
        return jsonify(response)
        
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ---- RUN ----
if __name__ == "__main__":
    app.run(debug=True, port=5000)