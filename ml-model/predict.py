import pickle
import numpy as np
from tensorflow.keras.models import load_model
from recommendation import get_recommendation

MODEL_PATH = "models/crop_stress_cnn_model.h5"
SCALER_PATH = "models/scaler.pkl"
LABELS_PATH = "models/labels.pkl"

model = load_model(MODEL_PATH)

with open(SCALER_PATH, "rb") as file:
    scaler = pickle.load(file)

with open(LABELS_PATH, "rb") as file:
    labels = pickle.load(file)

sample = np.array([[0.29, 0.14, 0.21, 30, 39, 28, 22, 25]])

sample_scaled = scaler.transform(sample)

prediction = model.predict(sample_scaled)

predicted_class = labels[np.argmax(prediction)]
confidence = np.max(prediction) * 100

recommendation = get_recommendation(predicted_class)

print("\nPredicted Stress Level:", predicted_class)
print(f"Confidence: {confidence:.2f}%")

print("\nStatus:")
print(recommendation["status"])

print("\nRecommendation:")
print(recommendation["recommendation"])