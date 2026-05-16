import os
import json
import sqlite3
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

# ---- SETUP ----
app = Flask(__name__)
CORS(app, origins="*")

# ---- LOAD CLASS NAMES ----
with open("classes.json", "r") as f:
    CLASSES = json.load(f)

# ---- LOAD DISEASE DATABASE ----
with open("database/diseases.json", "r") as f:
    DISEASES = json.load(f)

# ---- LOAD MODEL ----
print("Loading model...")
MODEL = tf.keras.models.load_model("model/crop_disease_model_v2.h5")
print("Model loaded successfully!")

# ---- CONFIDENCE THRESHOLD ----
CONFIDENCE_THRESHOLD = 0.60

# ---- DATABASE SETUP ----
DB_PATH = "database/predictions.db"

def init_db():
    os.makedirs("database", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp   TEXT    NOT NULL,
            predicted_class TEXT NOT NULL,
            confidence  REAL    NOT NULL,
            crop_type   TEXT    NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id INTEGER NOT NULL,
            feedback      TEXT    NOT NULL,
            timestamp     TEXT    NOT NULL,
            FOREIGN KEY (prediction_id) REFERENCES predictions(id)
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized!")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def save_prediction(predicted_class, confidence, crop_type):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO predictions (timestamp, predicted_class, confidence, crop_type) VALUES (?, ?, ?, ?)",
        (datetime.utcnow().isoformat(), predicted_class, confidence, crop_type)
    )
    prediction_id = c.lastrowid
    conn.commit()
    conn.close()
    return prediction_id

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

        # ---- TOP 3 PREDICTIONS ----
        top3_indices = np.argsort(predictions[0])[::-1][:3]
        top3 = [
            {
                "class": CLASSES[i],
                "confidence": round(float(predictions[0][i]) * 100, 2)
            }
            for i in top3_indices
        ]

        # ---- CONFIDENCE THRESHOLD CHECK ----
        if confidence < CONFIDENCE_THRESHOLD:
            response = {
                "status": "low_confidence",
                "message": "Image is unclear. Please retake the photo in better lighting.",
                "confidence": round(confidence * 100, 2),
                "top3": top3
            }
            print("RESPONSE:", json.dumps(response))
            return jsonify(response)

        # ---- GET DISEASE INFO ----
        disease_info = DISEASES.get(predicted_class, {
            "name": predicted_class.replace("_", " "),
            "crop": "Unknown",
            "cause": "Information not available",
            "symptoms": "Information not available",
            "treatment": ["Consult a local agricultural officer"],
            "severity": "Unknown"
        })

        crop_type = disease_info.get("crop", "Unknown")

        # ---- SAVE TO SQLITE ----
        prediction_id = save_prediction(predicted_class, round(confidence * 100, 2), crop_type)

        response = {
            "status": "success",
            "prediction_id": prediction_id,
            "predicted_class": predicted_class,
            "confidence": round(confidence * 100, 2),
            "disease": disease_info,
            "top3": top3
        }
        return jsonify(response)

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ---- STATS ENDPOINT ----
@app.route("/stats", methods=["GET"])
def stats():
    try:
        conn = get_db()
        c = conn.cursor()

        # Total scans
        c.execute("SELECT COUNT(*) as total FROM predictions")
        total_scans = c.fetchone()["total"]

        # Average confidence
        c.execute("SELECT ROUND(AVG(confidence), 2) as avg_conf FROM predictions")
        avg_confidence = c.fetchone()["avg_conf"] or 0.0

        # Disease breakdown (top 10)
        c.execute("""
            SELECT predicted_class, COUNT(*) as count
            FROM predictions
            GROUP BY predicted_class
            ORDER BY count DESC
            LIMIT 10
        """)
        disease_breakdown = [{"name": row["predicted_class"], "count": row["count"]} for row in c.fetchall()]

        # Crop breakdown
        c.execute("""
            SELECT crop_type, COUNT(*) as count
            FROM predictions
            GROUP BY crop_type
            ORDER BY count DESC
        """)
        crop_breakdown = [{"crop": row["crop_type"], "count": row["count"]} for row in c.fetchall()]

        # Healthy vs diseased
        c.execute("""
            SELECT
                SUM(CASE WHEN predicted_class LIKE '%healthy%' THEN 1 ELSE 0 END) as healthy,
                SUM(CASE WHEN predicted_class NOT LIKE '%healthy%' THEN 1 ELSE 0 END) as diseased
            FROM predictions
        """)
        row = c.fetchone()
        healthy_vs_diseased = {
            "healthy": row["healthy"] or 0,
            "diseased": row["diseased"] or 0
        }

        # Confidence distribution buckets
        c.execute("""
            SELECT
                SUM(CASE WHEN confidence >= 60 AND confidence < 70 THEN 1 ELSE 0 END) as c60,
                SUM(CASE WHEN confidence >= 70 AND confidence < 80 THEN 1 ELSE 0 END) as c70,
                SUM(CASE WHEN confidence >= 80 AND confidence < 90 THEN 1 ELSE 0 END) as c80,
                SUM(CASE WHEN confidence >= 90 THEN 1 ELSE 0 END) as c90
            FROM predictions
        """)
        row = c.fetchone()
        confidence_distribution = [
            {"range": "60-70%", "count": row["c60"] or 0},
            {"range": "70-80%", "count": row["c70"] or 0},
            {"range": "80-90%", "count": row["c80"] or 0},
            {"range": "90-100%", "count": row["c90"] or 0},
        ]

        conn.close()

        return jsonify({
            "total_scans": total_scans,
            "avg_confidence": avg_confidence,
            "disease_breakdown": disease_breakdown,
            "crop_breakdown": crop_breakdown,
            "healthy_vs_diseased": healthy_vs_diseased,
            "confidence_distribution": confidence_distribution
        })

    except Exception as e:
        print("STATS ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ---- HISTORY ENDPOINT ----
@app.route("/history", methods=["GET"])
def history():
    try:
        limit = request.args.get("limit", 20, type=int)
        conn = get_db()
        c = conn.cursor()

        c.execute("""
            SELECT id, timestamp, predicted_class, confidence, crop_type
            FROM predictions
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))

        rows = c.fetchall()
        conn.close()

        result = [{
            "id": row["id"],
            "timestamp": row["timestamp"],
            "predicted_class": row["predicted_class"],
            "confidence": row["confidence"],
            "crop_type": row["crop_type"]
        } for row in rows]

        return jsonify({"history": result, "count": len(result)})

    except Exception as e:
        print("HISTORY ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ---- FEEDBACK ENDPOINT ----
@app.route("/feedback", methods=["POST"])
def feedback():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        prediction_id = data.get("prediction_id")
        fb = data.get("feedback")  # "correct" or "incorrect"

        if not prediction_id or fb not in ("correct", "incorrect"):
            return jsonify({"error": "prediction_id and feedback ('correct'/'incorrect') are required"}), 400

        conn = get_db()
        c = conn.cursor()

        # Check prediction exists
        c.execute("SELECT id FROM predictions WHERE id = ?", (prediction_id,))
        if not c.fetchone():
            conn.close()
            return jsonify({"error": "Prediction not found"}), 404

        c.execute(
            "INSERT INTO feedback (prediction_id, feedback, timestamp) VALUES (?, ?, ?)",
            (prediction_id, fb, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Feedback recorded. Thank you!"})

    except Exception as e:
        print("FEEDBACK ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ---- RUN ----
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)

# ---- INIT DB ON STARTUP (for gunicorn) ----
init_db()