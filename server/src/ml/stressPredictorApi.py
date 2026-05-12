import sys
import json
from stressPredictor import predict_stress

input_data = json.loads(sys.argv[1])

result = predict_stress(input_data)

print(json.dumps(result))