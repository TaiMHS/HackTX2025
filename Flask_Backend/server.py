from flask import Flask, jsonify, request
from google.cloud import vision
from google import genai


# Initialize Google Cloud Vision client
vision_client = vision.ImageAnnotatorClient.from_service_account_file("api_key.json")

# Initialize Gemini API client
AI_client = genai.GeminiClient(api_key="AIzaSyCDvUjcNYQHMYuIeNDDlWDFjLyhTAotlH8")


app = Flask(__name__)

# Test image
image_path = "cake_ingredients.jpg"

content = None
recipe_count = 0
labels = None

@app.route('/create_recipe', methods=['GET'])
def create_recipe():
    global recipe_count
    global labels

    if labels is None:
        return jsonify({"error": "No ingredients detected. Please upload an image first."}), 400

    # Prepare input for Gemini
    model = "gemini-2.0-flash"
    contents = [
        f"Generate {recipe_count} recipe using the following ingredients: " + ", ".join([label.description for label in labels])
    ]

    try:
        gemini_response = AI_client.models.generate(
            model=model,
            contents=contents,
            temperature=1.1,
            system_instructions="You are a helpful FDA approved assistant that creates recipes based on given ingredients.",
            response_schema={
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Name of the recipe."
                        },
                        "ingredients": {
                            "type": "array",
                            "description": "List of ingredients detected from the image. Exclude numbering or bullet points.",
                        },
                        "steps": {
                            "type": "array",
                            "description": "A detailed list of steps using the provided ingredients. Exclude numbering or bullet points."
                        }
                    }
                },
                "required": ["name", "ingredients", "steps"]
            },
            response_mime_type="application/json",
            frequency_penalty=0.2,
            presence_penalty=0.5
        )
        
        return jsonify(gemini_response)
    
    except Exception as e:
        return jsonify({"error": f"Error generating recipe: {str(e)}"}), 500


# Endpoint to handle image upload and processing
@app.route('/img_grab', methods=['POST'])
def img_grab():
    global recipe_count
    global labels
    if 'myFile' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400 #HTTP 400 = Bad Request
    
    if 'numRecipes' not in request.form:
        return jsonify({"error": "Number of recipes not specified"}), 400
    
    # Grabbing inputs
    content = request.files.get('myFile').read()

    if content is None:
        return jsonify({"error": "No image provided"}), 400

    recipe_count = request.form.get('numRecipes', 1)

    if recipe_count is None:
        return jsonify({"error": "Number of recipes not provided"}), 400


    try:
        vision_image = vision.Image(content=content)

        # Perform label detection
        vision_response = vision_client.label_detection(image=vision_image, max_results=100)
        labels = vision_response.label_annotations # Get labels from response
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

    
    

    

if __name__ == '__main__':
    app.run(debug=True) 