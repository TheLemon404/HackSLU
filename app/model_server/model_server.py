from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import PorterStemmer
from scipy.sparse import hstack
import numpy as np
from flask import Flask, request, jsonify

import joblib
import json
import pickle 

app = Flask(__name__)

vectorizer = joblib.load('tfidf_vectorizer.pkl')

xgb_model = joblib.load('xgb_model.pkl')   

def remove_patterns(text):
    text = re.sub(r'http[s]?://\S+','', text)
    text = re.sub(r'\[.*?\]\(.*?\)','', text)
    text = re.sub(r'@\w+','', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text.strip()

def stem_tokens(tokens):
    stemmer = PorterStemmer()
    return " ".join(stemmer.stem(str(token)) for token in tokens)

def preprocess_new_text(raw_text):
    text_lower = raw_text.lower()
    text_cleaned = remove_patterns(text_lower)
    tokens = word_tokenize(text_cleaned)
    stemmed_str = stem_tokens(tokens)
    num_chars = len(text_cleaned)
    num_sents = len(sent_tokenize(text_cleaned))
    return stemmed_str, num_chars, num_sents

def to_daignosis(pred: int) -> str:
    '''
    0 = 'anxiety'
    1 = 'bipolar'
    2 = 'depression'
    3 = 'normal'
    4 = 'personality_disorder'
    5 = 'stress'
    6 = 'suicidal'
    '''
    match pred:
        case 0:
            return "anxiety"
        case 1:
            return "bipolar"
        case 2:
            return "depressed"
        case 3:
            return "normal"
        case 4:
            return "personality_disorder"
        case 5:
            return "stress"
        case 6:
            return "suicidal"
    return "normal"

@app.route("/", methods=["POST"])
def eval(): 

    json_data = request.get_json()

    stemmed_str, num_chars, num_sents = preprocess_new_text(json_data["user_text"])
    new_text_tfidf = vectorizer.transform([stemmed_str])  
    new_text_num = np.array([[num_chars, num_sents]])
    new_text_combined = hstack([new_text_tfidf, new_text_num]) 

    prediction = xgb_model.predict(new_text_combined)

    response_data = {"result": to_daignosis(prediction[0])}

    return jsonify(response_data)

if __name__ == "__main__":
    app.run(debug=False)