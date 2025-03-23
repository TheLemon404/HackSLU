import pickle
import json
import numpy as np

# Function to recursively convert model attributes to a JSON-compatible format
def convert_to_json_serializable(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()  # Convert NumPy arrays to lists
    elif isinstance(obj, dict):
        return {key: convert_to_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    else:
        return obj  # Return other types (int, float, str, etc.) as is

# Function to save model as a JSON file
def model_to_json(pkl_filename, json_filename):
    # Load the model from the pickle file
    with open(pkl_filename, 'rb') as pkl_file:
        model = pickle.load(pkl_file)

    # Convert the model's attributes to a JSON-serializable format
    model_json = convert_to_json_serializable(model)

    # Write the JSON data to the output file
    with open(json_filename, 'w') as json_file:
        json.dump(model_json, json_file, indent=4)

    print(f"Model successfully converted and saved as {json_filename}")

# Example usage
pkl_filename = 'tfidf_vectorizer.pkl'  # Replace with your .pkl file path
json_filename = 'model.json'     # Desired output .json file path
model_to_json(pkl_filename, json_filename)
