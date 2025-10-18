from flask import Flask, jsonify
from google.cloud import vision
import io

# Initialize Google Cloud Vision client
client = vision.ImageAnnotatorClient.from_service_account_file("api_key.json")

app = Flask(__name__)

# Test image
image_path = "cake_ingredients.jpg"

with io.open(image_path, 'rb') as image_file:
    content = image_file.read()

image = vision.Image(content=content)

# Perform label detection
response = client.label_detection(image=image, max_results=100)
labels = response.label_annotations

# Members API Route
@app.route('/members')
def members():
    # "recipe" is part of the "data" object. In App.js, data.members has the labels
    # return sends back to the frontend
    return jsonify({
        "recipe": [label.description for label in labels]
    })

if __name__ == '__main__':
    app.run(debug=True) 