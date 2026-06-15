import pandas as pd
import numpy as np
from typing import List, Dict

class SymptomExplainer:
    def __init__(self, model, background_data):
        self.model = model
        self.background_data = background_data
        
        # We extract the global feature importances from the Random Forest
        if hasattr(model, 'feature_importances_'):
            self.importances = model.feature_importances_
        else:
            self.importances = np.ones(model.n_features_in_) / model.n_features_in_
            
    def explain_prediction(self, features: pd.DataFrame, feature_names: List[str]) -> List[Dict]:
        """
        Returns an ordered list of dictionaries showing feature importance for the predicted disease.
        """
        explanation = []
        
        # Active features (the symptoms the user actually selected)
        active_features = features.iloc[0].values
        
        # Multiply global importance by active feature to simulate local contribution
        for i, (val, importance) in enumerate(zip(active_features, self.importances)):
            # We only show explanations for symptoms that are present (val == 1) and have impact
            if val != 0 and importance > 0: 
                explanation.append({
                    "feature": feature_names[i],
                    "contribution": float(importance),
                    "impact": "positive" # Active symptoms positively contribute to the diagnosis
                })
                
        # Sort by contribution (highest impact first)
        explanation.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        return explanation
