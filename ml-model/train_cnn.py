import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical

DATASET_PATH = "dataset/crop_stress_dataset.csv"
MODEL_PATH = "models/crop_stress_cnn_model.h5"
SCALER_PATH = "models/scaler.pkl"
LABELS_PATH = "models/labels.pkl"

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully")
print("Total rows:", len(df))

features = [
    "ndvi",
    "ndre",
    "gndvi",
    "moisture",
    "temperature",
    "nitrogen",
    "phosphorus",
    "potassium"
]

X = df[features].values
y = df["stress_label"].values

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
y_categorical = to_categorical(y_encoded)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y_categorical,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

model = Sequential([
    Dense(64, activation="relu", input_shape=(8,)),
    Dense(32, activation="relu"),
    Dense(16, activation="relu"),
    Dense(3, activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train,
    y_train,
    epochs=50,
    batch_size=4,
    validation_data=(X_test, y_test),
    verbose=1
)

loss, accuracy = model.evaluate(X_test, y_test)

print(f"\nModel Accuracy: {accuracy * 100:.2f}%")

model.save(MODEL_PATH)

with open(SCALER_PATH, "wb") as file:
    pickle.dump(scaler, file)

with open(LABELS_PATH, "wb") as file:
    pickle.dump(encoder.classes_, file)

print("\nModel saved successfully")
print("Scaler saved successfully")
print("Labels saved successfully")