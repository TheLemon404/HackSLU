from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import PorterStemmer
from scipy.sparse import hstack
import numpy as np

import joblib
import json
import pickle 

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

class MyHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def to_daignosis(self, pred: int) -> str:
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
        
    
    def do_POST(self):
        vectorizer = joblib.load('tfidf_vectorizer.pkl')

        xgb_model = joblib.load('xgb_model.pkl')    

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        json_data = json.loads(post_data.decode('utf-8'))

        stemmed_str, num_chars, num_sents = preprocess_new_text(json_data["user_text"])
        new_text_tfidf = vectorizer.transform([stemmed_str])  
        new_text_num = np.array([[num_chars, num_sents]])
        new_text_combined = hstack([new_text_tfidf, new_text_num]) 

        prediction = xgb_model.predict(new_text_combined)

        response_data = {"result": self.to_daignosis(prediction[0])}
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
        

def run(server_class=HTTPServer, handler_class=MyHandler, port=8000):
    nltk.download('punkt_tab')
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()