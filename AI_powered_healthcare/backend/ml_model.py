import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import json

# List of symptoms (features)
SYMPTOMS = [
    "fever", "cough", "fatigue", "difficulty_breathing", 
    "chest_pain", "nausea", "headache", "sore_throat", 
    "loss_of_taste_smell", "body_aches", "runny_nose", "sneezing"
]

# List of diseases (targets) and their severities
DISEASES = {
    0: {"name": "Common Cold", "severity": "Mild"},
    1: {"name": "Flu", "severity": "Normal"},
    2: {"name": "COVID-19", "severity": "Serious"},
    3: {"name": "Migraine", "severity": "Normal"},
    4: {"name": "Pneumonia", "severity": "Serious"},
    5: {"name": "Allergies", "severity": "Mild"}
}

def generate_synthetic_data(num_samples=2000):
    """
    Generates synthetic rule-based symptom data for training.
    """
    X = []
    y = []

    for _ in range(num_samples):
        target = np.random.randint(0, 6)
        row = {s: 0 for s in SYMPTOMS}
        
        # Determine features based on disease
        if target == 0: # Common Cold
            row["runny_nose"] = np.random.choice([0, 1], p=[0.2, 0.8])
            row["sneezing"] = np.random.choice([0, 1], p=[0.2, 0.8])
            row["sore_throat"] = np.random.choice([0, 1], p=[0.3, 0.7])
            row["cough"] = np.random.choice([0, 1], p=[0.5, 0.5])
        elif target == 1: # Flu
            row["fever"] = np.random.choice([0, 1], p=[0.1, 0.9])
            row["chills"] = np.random.choice([0, 1], p=[0.2, 0.8])
            row["fatigue"] = np.random.choice([0, 1], p=[0.1, 0.9])
            row["body_aches"] = np.random.choice([0, 1], p=[0.1, 0.9])
            row["cough"] = np.random.choice([0, 1], p=[0.3, 0.7])
        elif target == 2: # COVID-19
            row["fever"] = 1
            row["cough"] = 1
            row["loss_of_taste_smell"] = np.random.choice([0, 1], p=[0.4, 0.6])
            row["fatigue"] = 1
            row["difficulty_breathing"] = np.random.choice([0, 1], p=[0.5, 0.5])
        elif target == 3: # Migraine
            row["headache"] = 1
            row["nausea"] = np.random.choice([0, 1], p=[0.4, 0.6])
            row["fatigue"] = np.random.choice([0, 1], p=[0.5, 0.5])
        elif target == 4: # Pneumonia
            row["fever"] = 1
            row["cough"] = 1
            row["difficulty_breathing"] = 1
            row["chest_pain"] = np.random.choice([0, 1], p=[0.2, 0.8])
            row["fatigue"] = 1
        elif target == 5: # Allergies
            row["sneezing"] = 1
            row["runny_nose"] = 1
            row["itchy_eyes"] = np.random.choice([0, 1], p=[0.2, 0.8])
            row["cough"] = np.random.choice([0, 1], p=[0.8, 0.2])

        # Filter out features not in our master SYMPTOMS list
        clean_row = [row.get(s, 0) for s in SYMPTOMS]
        
        # Add some random noise
        for i in range(len(clean_row)):
            if np.random.rand() < 0.05:  # 5% chance to flip bit
                clean_row[i] = 1 - clean_row[i]

        X.append(clean_row)
        y.append(target)
        
    return pd.DataFrame(X, columns=SYMPTOMS), np.array(y)

def train_and_save_model():
    print("Generating synthetic data...")
    X, y = generate_synthetic_data(1000)
    
    print("Training Random Forest...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    print("Saving model to disk...")
    # joblib.dump(model, 'medical_rf_model.pkl')
    # Save the training background data for SHAP directly
    # joblib.dump(X.head(100), 'shap_background_data.pkl')
    
    return model, X

if __name__ == "__main__":
    train_and_save_model()
    print("Training complete!")
