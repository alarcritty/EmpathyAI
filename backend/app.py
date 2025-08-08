from flask import Flask, request, jsonify  # Removed render_template since React will handle the UI
from flask_cors import CORS  # Import Flask-CORS to handle cross-origin requests
import traceback
from main import ChatbotProcessor

app = Flask(__name__)
processor = ChatbotProcessor()

# Enable CORS for all routes, or limit it to specific origins if needed
CORS(app, origins=["http://localhost:5173"])  # Allow requests from React frontend running on localhost:5173

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Welcome to the Chatbot API! React frontend should handle the UI."})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()  # Expecting JSON data from React frontend
        if not data or "message" not in data:
            return jsonify({"error": "Invalid input. 'message' is required."}), 400

        user_input = data["message"]
        response = processor.handle_query(user_input)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002)
