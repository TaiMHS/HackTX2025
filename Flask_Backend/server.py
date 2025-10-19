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
    # Send to Gemini
    global recipe_count
    global labels

    model = "gemini-2.0-flash"
    contents = ["Generate" + recipe_count + "recipe using the following ingredients: " + ", ".join([label.description for label in labels])]

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

    # Generation configs:
    # temperature: 0.0 - 2.0, determines how creative the output is where 2.0 is the most creative
    # max_output_tokens: maximum number of tokens to generate in the output
    # top_p: controls diversity via nucleus sampling (0.0 - 1.0) 
    #        0.0 means only the most probable token is considered, 1.0 means all tokens are considered
    #        takes sum of probabilities until it reaches the top_p value, from most to least probable tokens
    # top_k: limits the next token selection to the top_k most probable tokens
    # stop_sequences: list of sequences where generation will stop if any is generated
    # system_instructions: provides context or guidelines for the model's behavior
    # response_schema: defines the expected structure of the response
    # response_mime_type: specifies the desired MIME type of the response ("application/json", "text/plain", etc.)
    # frequency_penalty: discourages the model from repeating the same tokens
    # presence_penalty: encourages the model to introduce new topics


    return jsonify(gemini_response)


# Endpoint to handle image upload and processing
@app.route('/img_grab', methods=['POST'])
def img_grab():
    global recipe_count
    global labels
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400 #HTTP 400 = Bad Request
    
    # Grabbing inputs
    content = request.files.get('image').read()
    recipe_count = request.files.get('recipe_count', 1)


    vision_image = vision.Image(content=content)

    # Perform label detection
    vision_response = vision_client.label_detection(image=vision_image, max_results=100)
    labels = vision_response.label_annotations # Get labels from response

    
    

    

if __name__ == '__main__':
    app.run(debug=True) 