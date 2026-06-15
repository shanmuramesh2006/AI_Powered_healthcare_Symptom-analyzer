const API_BASE_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    
    const symptomsGrid = document.getElementById('symptoms-grid');
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnBack = document.getElementById('btn-back');
    const selectedSymptoms = new Set();
    
    // Application Views
    const viewSymptoms = document.getElementById('step-symptoms');
    const viewLoading = document.getElementById('step-loading');
    const viewResult = document.getElementById('step-result');

    // Fetch and render symptoms on load
    fetchSymptoms();

    async function fetchSymptoms() {
        try {
            // Call FastAPI backend to get the master list of symptoms
            const response = await fetch(`${API_BASE_URL}/api/symptoms`);
            if (response.ok) {
                const data = await response.json();
                renderSymptoms(data.symptoms);
            } else {
                // Fallback if backend is not ready
                renderSymptoms(["fever", "cough", "fatigue", "headache", "nausea"]);
            }
        } catch (error) {
            console.error("Failed to fetch symptoms:", error);
        }
    }

    function renderSymptoms(symptoms) {
        symptomsGrid.innerHTML = '';
        symptoms.forEach(symptom => {
            const chip = document.createElement('div');
            chip.className = 'symptom-chip';
            chip.textContent = symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            chip.dataset.value = symptom;
            
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');
                if (chip.classList.contains('selected')) {
                    selectedSymptoms.add(symptom);
                } else {
                    selectedSymptoms.delete(symptom);
                }
                
                // Enable button if at least one symptom selected
                btnAnalyze.disabled = selectedSymptoms.size === 0;
            });
            
            symptomsGrid.appendChild(chip);
        });
    }

    // Process Analysis
    btnAnalyze.addEventListener('click', async () => {
        if (selectedSymptoms.size === 0) return;
        
        switchView(viewLoading);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symptoms: Array.from(selectedSymptoms)
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                displayResults(result);
                switchView(viewResult);
            } else {
                alert("Error communicating with AI Engine.");
                switchView(viewSymptoms);
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Network Error. Ensure FastAPI backend is running.");
            switchView(viewSymptoms);
        }
    });

    function displayResults(data) {
        // Core diagnostic
        document.getElementById('res-disease').textContent = data.disease;
        document.getElementById('res-confidence').textContent = data.confidence + "%";
        
        const badge = document.getElementById('res-severity');
        badge.textContent = data.severity;
        badge.className = `severity-badge ${data.severity.toLowerCase()}`;
        
        // Explainable AI formatting
        const xaiList = document.getElementById('xai-bars');
        xaiList.innerHTML = '';
        
        data.explanation.forEach((exp, index) => {
            const xaiItem = document.createElement('div');
            xaiItem.className = 'xai-bar-row';
            
            // Text color logic based on impact
            const impactDesc = exp.impact === 'positive' ? 'Increases risk' : 'Protective/Low risk';
            const colorClass = exp.impact === 'positive' ? 'positive' : 'negative';
            
            xaiItem.innerHTML = `
                <div class="xai-label-row">
                    <span>${exp.feature} <span style="opacity:0.5; font-size:10px;">(${impactDesc})</span></span>
                    <strong>${exp.percentage}%</strong>
                </div>
                <div class="xai-track">
                    <div class="xai-fill ${colorClass}" style="width: 0%"></div>
                </div>
            `;
            xaiList.appendChild(xaiItem);
            
            // Animate bar widths after a small delay
            setTimeout(() => {
                const fillBar = xaiItem.querySelector('.xai-fill');
                fillBar.style.width = `${exp.percentage}%`;
            }, 100 * index + 300); // Staggered animation
        });
    }

    // Go Back functionality
    btnBack.addEventListener('click', () => {
        switchView(viewSymptoms);
    });

    function switchView(targetView) {
        // Hide all
        viewSymptoms.classList.remove('active-view');
        viewLoading.classList.remove('active-view');
        viewResult.classList.remove('active-view');
        
        // Show target
        targetView.classList.add('active-view');
    }

    // Add interactions to the bottom navigation bar
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach((navItem, index) => {
        navItem.addEventListener('click', () => {
            if (index > 0) {
                alert("This feature (History / User Profile) is coming soon!");
            }
        });
    });
});
