from stressPredictor import predict_stress

sample_data = {
    "ndvi": 0.29,
    "ndre": 0.14,
    "gndvi": 0.21,
    "moisture": 30,
    "temperature": 39,
    "nitrogen": 28,
    "phosphorus": 22,
    "potassium": 25
}

result = predict_stress(sample_data)

print(result)