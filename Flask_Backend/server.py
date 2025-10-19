from flask import Flask, jsonify, request
from google.cloud import vision
from google import genai
import json

# PROJECT_ID = "cobalt-abacus-475522-j2"  # @param {type: "string", placeholder: "[your-project-id]", isTemplate: true}
# if not PROJECT_ID or PROJECT_ID == "cobalt-abacus-475522-j2":
#     PROJECT_ID = str(os.environ.get("GOOGLE_CLOUD_PROJECT"))

# LOCATION = os.environ.get("GOOGLE_CLOUD_REGION", "global")
api_key = "<replace with your API key>"

# Initialize Google Cloud Vision client
vision_client = vision.ImageAnnotatorClient.from_service_account_file("api_key.json")

# Initialize Gemini API client
AI_client = genai.Client(api_key=api_key)


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
    gemini_response = None

    if labels is None:
        return jsonify({"error": "No ingredients detected. Please upload an image first."}), 400

    # Prepare input for Gemini
    model = "gemini-2.0-flash"
    contents = [
        f"Generate {recipe_count} recipe(s) using the following ingredients: " + ", ".join([label.description for label in labels])
    ]
    instruct = {"You are a helpful FDA-approved assistant that creates food recipes based on given ingredients. " +
    "You can also filter out non-food items from the ingredient list. Only include ingredients that might be usd in a recipe, something like produce may be too broad" + "speical case: if you see a human set recipe name as SNACK!!, set steps to be 'just be you!', and set ingredients 'you!" + "if ingredients are insufficient to make a recipe in in ingredients none found and in steps go to the store bruh."
    + "Do not attempt to use ingredients that are not food items."
    }
    try:
        gemini_response = AI_client.models.generate_content(
            model=model,
            contents=contents,
            config={
                "temperature": 0.7,
                "candidate_count": recipe_count,
                # FIX 1: Changed to singular 'system_instruction'
                "system_instruction": instruct,
                "response_schema": {
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
                                # FIX 3: Added 'items' definition for the nested array
                                "items": {
                                    "type": "string"
                                }
                            },
                            "steps": {
                                "type": "array",
                                "description": "A detailed list of steps using the provided ingredients. Exclude numbering or bullet points.",
                                # FIX 3: Added 'items' definition for the nested array
                                "items": {
                                    "type": "string"
                                }
                            }
                        },
                        # FIX 2: Moved 'required' inside the 'object' definition
                        "required": ["name", "ingredients", "steps"] 
                    },
                },
                "response_mime_type": "application/json",
                "frequency_penalty": 0.2,
                "presence_penalty": 0.4
            }
        )
        if(not gemini_response or not gemini_response.text):
            return jsonify({"No response": "Empty response from Gemini API"}), 500
        return jsonify(gemini_response.text), 200
    
    except Exception as e:
        return jsonify({"error": str(e), "gemini_response": str(gemini_response)}), 500


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

    recipe_count = int(request.form.get('numRecipes', 1))

    if recipe_count is None:
        return jsonify({"error": "Number of recipes not provided"}), 400


    try:
        vision_image = vision.Image(content=content)

        # Perform label detection
        vision_response = vision_client.label_detection(image=vision_image, max_results=100)
        labels = vision_response.label_annotations # Get labels from response
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500
    
    return jsonify({"message": "Image processed successfully"}), 200

    
    

    

if __name__ == '__main__':
    app.run(debug=True) 