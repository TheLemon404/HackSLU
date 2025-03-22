import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

from imblearn.over_sampling import RandomOverSampler
from xgboost import XGBClassifier

import joblib

df = pd.read_csv('data.csv')
df.dropna(inplace=True)

def remove_patterns(text):
    """
    Removes URLs, markdown-style links, punctuation, and extra whitespace.
    """
    # remove URLs
    text = re.sub(r'http\S+', '', text)
    # remove markdown-style links [title](link)
    text = re.sub(r'\[.*?\]\(.*?\)', '', text)
    # remove punctuation and special characters
    text = re.sub(r'[^\w\s]', '', text)
    # remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def stem_tokens(tokens):
    """
    Applies Porter stemming to a list of tokens.
    """
    stemmer = PorterStemmer()
    return [stemmer.stem(token) for token in tokens]

if __name__ == "__main__":

    # 2. Convert statements to lowercase
    df['statement'] = df['statement'].str.lower()

    # 3. Clean text
    df['statement'] = df['statement'].apply(remove_patterns)

    # 4. Tokenize
    df['tokens'] = df['statement'].apply(word_tokenize)

    # 5. Stem tokens
    df['tokens_stemmed'] = df['tokens'].apply(stem_tokens)

    # 6. (Optional) Feature engineering
    #    For example, number of characters and number of sentences
    df['num_of_characters'] = df['statement'].apply(len)
    df['num_of_sentences'] = df['statement'].apply(lambda x: len(nltk.sent_tokenize(x)))

    # 7. Prepare features (X) and labels (y)
    #    Convert stemmed tokens back to string for TF-IDF
    X_text = df['tokens_stemmed'].apply(lambda x: " ".join(x))
    y = df['status']

    # 8. Label-encode the target column
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # 9. Train/test split
    X_train_text, X_test_text, y_train, y_test = train_test_split(
        X_text, 
        y_encoded, 
        test_size=0.2, 
        random_state=101
    )

    # 10. TF-IDF vectorization
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=50000)
    X_train_vec = vectorizer.fit_transform(X_train_text)
    X_test_vec = vectorizer.transform(X_test_text)

    # 11. Handle class imbalance with RandomOverSampler
    ros = RandomOverSampler(random_state=101)
    X_train_resampled, y_train_resampled = ros.fit_resample(X_train_vec, y_train)

    # 12. Train XGBoost
    xgb_model = XGBClassifier(
        learning_rate=0.2, 
        max_depth=7, 
        n_estimators=500, 
        random_state=101, 
        tree_method='gpu_hist'  # remove or change if not using GPU
    )
    xgb_model.fit(X_train_resampled, y_train_resampled)

    # 13. Evaluate on the test set
    y_pred = xgb_model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print("Accuracy:", accuracy)

    # 14. Save model, vectorizer, and label encoder
    joblib.dump(vectorizer, "tfidf_vectorizer.pkl")
    joblib.dump(xgb_model, "xgb_model.pkl")
    joblib.dump(label_encoder, "label_encoder.pkl")
