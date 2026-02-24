from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
import re

import re

def clean_text_for_speech(text):
    text = re.sub(r'\.', '', text)  # remove all dots
    text = text.replace("Dr", "Doctor")
    text = text.replace("Sr", "Sister")
    text = text.replace("AC", "AC")
    return text

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
excel_path = os.path.join(BASE_DIR, "college_data.xlsx")

print("Excel path:", excel_path)

# Load Excel
try:
    df = pd.read_excel(excel_path)
    df.columns = df.columns.str.strip().str.lower()
    print("Excel loaded successfully!")
except Exception as e:
    print("Error loading Excel:", e)
    df = None

# Simple text cleaner
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

# Remove common words
STOPWORDS = {"the", "is", "are", "a", "an", "of", "in", "on", "for", "to", "and", "what"}
stop_words = {"who", "is", "the", "of", "in", "at", "what", "about", "tell", "me"}
def remove_stopwords(text):
    words = text.split()
    return [word for word in words if word not in STOPWORDS]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    if df is None:
        return jsonify({"response": "Excel data not loaded."})

    user_message = request.json.get("message", "")
    user_message = clean_text(user_message)

    user_words = remove_stopwords(user_message)

    best_match = None
    highest_score = 0

    for _, row in df.iterrows():
        field = clean_text(row["field"])
        value = str(row["value"]).strip()

        field_words = remove_stopwords(field)

        # Count matching words
        score = len(set(user_words) & set(field_words))

        # Bonus if full phrase matches
        if user_message in field:
            score += 2

        if score > highest_score:
            highest_score = score
            best_match = value

    # If good match found
    if highest_score >= 1:
        return jsonify({"response": best_match})

    # Suggest similar fields
    possible_fields = df["field"].tolist()[:5]

    return jsonify({
        "response": "Sorry, I couldn't find exact information. Try asking about:\n"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)