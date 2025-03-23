import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
import joblib

def remove_patterns(text):
    """
    Same cleaning used during training.
    """
    # remove URLs
    text = re.sub(r'http\S+', '', text)
    # remove markdown-style links
    text = re.sub(r'\[.*?\]\(.*?\)', '', text)
    # remove punctuation and special characters
    text = re.sub(r'[^\w\s]', '', text)
    # remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def preprocess_text(text):
    """
    Replicate training-time preprocessing on new text.
    """
    # lowercase
    text = text.lower()
    # remove patterns
    text = remove_patterns(text)
    # tokenize
    tokens = word_tokenize(text)
    # stem
    stemmer = PorterStemmer()
    tokens_stemmed = [stemmer.stem(token) for token in tokens]
    # rejoin
    return " ".join(tokens_stemmed)

def predict_text(text):
    """
    Loads the saved vectorizer, model, and label encoder,
    then predicts on a single text block.
    """
    # load artifacts
    vectorizer_path = r"C:\C:\Users\isakh\Documents\HackSLU\data\tfidf_vectorizer.pkl"
    xgb_model_path = r"C:\Users\isakh\Documents\HackSLU\data\xgb_model.pkl"
    label_encoder_path = r"C:\Users\isakh\Documents\HackSLU\data\label_encoder.pkl"

    vectorizer = joblib.load(vectorizer_path)
    xgb_model = joblib.load(xgb_model_path)
    label_encoder = joblib.load(label_encoder_path)


    # preprocess
    processed_text = preprocess_text(text)
    # vectorize
    X = vectorizer.transform([processed_text])
    # predict
    y_pred = xgb_model.predict(X)
    # convert numeric label back to original
    predicted_label = label_encoder.inverse_transform(y_pred)
    return predicted_label[0]

if __name__ == "__main__":
    # Example usage
    sample_text = "I am going to self harm"
    prediction = predict_text(sample_text)
    print("Prediction:", prediction)
