def get_recommendation(stress_level):
    if stress_level == "Healthy":
        return {
            "status": "Healthy crop condition",
            "recommendation": "Crop condition is stable. Continue regular irrigation and nutrient monitoring."
        }

    if stress_level == "Moderate":
        return {
            "status": "Moderate stress detected",
            "recommendation": "Check soil moisture and nutrient levels. Apply balanced irrigation and monitor NDVI/NDRE again after a few days."
        }

    if stress_level == "HighStress":
        return {
            "status": "High crop stress detected",
            "recommendation": "Immediate action is needed. Inspect the field for water stress, nutrient deficiency, or disease symptoms. Increase irrigation if soil is dry and consult an agronomy expert if stress continues."
        }

    return {
        "status": "Unknown condition",
        "recommendation": "Unable to generate recommendation for this stress level."
    }