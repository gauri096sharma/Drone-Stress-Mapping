import pickle
import numpy as np
from tensorflow.keras.models import load_model

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "crop_stress_cnn_model.h5")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
LABELS_PATH = os.path.join(BASE_DIR, "labels.pkl")

model = load_model(MODEL_PATH)

with open(SCALER_PATH, "rb") as file:
    scaler = pickle.load(file)

with open(LABELS_PATH, "rb") as file:
    labels = pickle.load(file)


def get_recommendation(stress_level):
    if stress_level == "Healthy":
        return {
            "status": "Healthy crop condition",
            "recommendation": "Crop condition is stable. Continue regular irrigation and nutrient monitoring."
        }

    if stress_level == "Moderate":
        return {
            "status": "Moderate stress detected",
            "recommendation": "Check soil moisture and nutrient levels. Apply balanced irrigation and monitor crop health again after a few days."
        }

    if stress_level == "HighStress":
        return {
            "status": "High crop stress detected",
            "recommendation": "Immediate action is needed. Inspect irrigation, nutrient deficiency, and disease symptoms in the field."
        }

    return {
        "status": "Unknown condition",
        "recommendation": "No recommendation available."
    }


def predict_stress(data):
    sample = np.array([[
        data["ndvi"],
        data["ndre"],
        data["gndvi"],
        data["moisture"],
        data["temperature"],
        data["nitrogen"],
        data["phosphorus"],
        data["potassium"]
    ]])

    sample_scaled = scaler.transform(sample)

    prediction = model.predict(sample_scaled, verbose=0)

    predicted_class = labels[np.argmax(prediction)]
    confidence = float(np.max(prediction) * 100)

    recommendation = get_recommendation(predicted_class)

    return {
        "stressLevel": predicted_class,
        "confidence": round(confidence, 2),
        "status": recommendation["status"],
        "recommendation": recommendation["recommendation"]
    }