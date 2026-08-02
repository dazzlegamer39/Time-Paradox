// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
    });
}

// ⚠️ IMPORTANT: Paste your secure Cloudflare proxy URL below! 
const API_URL = 'https://time-paradox-proxy.dazzlegamer39.workers.dev';

// UI Elements
const simulateBtn = document.getElementById('simulate-btn');
const resetBtn = document.getElementById('reset-btn');
const resultPanel = document.getElementById('result-panel');
const outcomeDiv = document.getElementById('timeline-outcome');
const interventionPanel = document.getElementById('intervention-panel');
const loadingText = document.getElementById('loading-text');

// Define our Case Files
const caseFiles = {
    "case-01": {
        era: "1914 AD",
        location: "Sarajevo, Bosnia",
        baseline: "Archduke Franz Ferdinand's driver takes a wrong turn into Sarajevo, stopping directly in front of Gavrilo Princip.",
        goal: "Prevent the outbreak of World War I without creating an uncontrolled temporal cascade or a dystopian future."
    },
    "case-02": {
        era: "1666 AD",
        location: "Woolsthorpe Manor, England",
        baseline: "An apple falls from a tree, inspiring Isaac Newton's theory of gravity.",
        goal: "Prevent the discovery of gravity in 1666, but ensure humanity still develops space travel by the year 2100."
    }
};

// Handle UI changes when a Case File is selected
const caseSelector = document.getElementById('case-file-selector');
const inputEra = document.getElementById('input-era');
const inputLocation = document.getElementById('input-location');

caseSelector.addEventListener('change', () => {
    const selectedCase = caseSelector.value;
    if (selectedCase === "custom") {
        inputEra.value = "";
        inputLocation.value = "";
        inputEra.disabled = false;
        inputLocation.disabled = false;
    } else {
        inputEra.value = caseFiles[selectedCase].era;
        inputLocation.value = caseFiles[selectedCase].location;
        inputEra.disabled = true; // Lock the WHEN/WHERE for Case Files
        inputLocation.disabled = true;
    }
});

// Run the Simulation
simulateBtn.addEventListener('click', async () => {
    const selectedCase = caseSelector.value;
    const era = document.getElementById('input-era').value || 'Unknown Time';
    const location = document.getElementById('input-location').value || 'Unknown Place';
    const action = document.getElementById('input-action').value || 'Did nothing';
    
    // Safely hide button and show loading text (if it exists)
    simulateBtn.classList.add('hidden');
    if (loadingText) loadingText.classList.remove('hidden');

    let promptText = "";

    // Build the Prompt based on the mode
    if (selectedCase === "custom") {
        promptText = `
        You are the "Causality Engine" for a time travel game. The user has made a historical intervention.
        WHEN: ${era}
        WHERE/WHO: ${location}
        WHAT: ${action}
        
        Calculate the historical ripple effect. Be creative, grounded in historical logic, but allow for absurd butterfly effects if the action is drastic.
        
        Return EXACTLY a JSON object with no markdown formatting or code blocks, strictly following this structure:
        {
          "outcomeTitle": "Name of the new timeline (e.g., The Mechanical Caesar)",
          "description": "A 2-3 sentence description of how history changed.",
          "status": "SUCCESS" (if it surprisingly works out), "FAILED" (if it causes a dystopia or doesn't work), or "PARADOX" (if it breaks logic completely)
        }`;
    } else {
        const currentCase = caseFiles[selectedCase];
        promptText = `
        You are the "Causality Engine" for a time travel game. The player is attempting a specific mission.
        MISSION BASELINE: ${currentCase.baseline}
        MISSION GOAL: ${currentCase.goal}
        
        The player made the following intervention:
        WHEN: ${era}
        WHERE/WHO: ${location}
        WHAT: ${action}
        
        Calculate the historical ripple effect of their action. Does it achieve the MISSION GOAL? 
        
        Return EXACTLY a JSON object with no markdown formatting or code blocks, strictly following this structure:
        {
          "outcomeTitle": "Name of the new timeline (e.g., The Pax Danubia)",
          "description": "A 2-3 sentence description of how history changed and whether they achieved the goal.",
          "status": "MISSION ACCOMPLISHED" (if they achieved the goal), "MISSION FAILED" (if they missed the goal, caused a dystopia, or worsened history), or "PARADOX" (if their action logically contradicts itself)
        }`;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const rawResponse = await response.text();
        
        let data;
        try {
            data = JSON.parse(rawResponse);
        } catch (parseError) {
            throw new Error("Proxy returned HTML instead of data. Check your API_URL!");
        }

        if (data.error) {
            throw new Error(`AI Error: ${data.error.message}`);
        }
        
        let timelineText;
        if (data.candidates) { 
             timelineText = data.candidates[0].content.parts[0].text;
        } else if (data.choices) { 
             timelineText = data.choices[0].message.content; // The typo is fixed here!
        } else {
            throw new Error("Unexpected AI response format.");
        }

        // ==========================================
        // BULLETPROOF JSON EXTRACTOR
        // ==========================================
        const startIndex = timelineText.indexOf('{');
        const endIndex = timelineText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("The AI didn't return a proper timeline format. Please try again!");
        }
        
        const cleanJsonString = timelineText.substring(startIndex, endIndex + 1);
        const outcome = JSON.parse(cleanJsonString);

        let statusClass = 'status-failed';
        if (outcome.status === 'SUCCESS' || outcome.status === 'MISSION ACCOMPLISHED') statusClass = 'status-success';
        if (outcome.status === 'PARADOX') statusClass = 'status-paradox';

        outcomeDiv.innerHTML = `
            <p><strong>Outcome: ${outcome.outcomeTitle}</strong></p>
            <p>${outcome.description}</p>
            <p class="${statusClass}">STATUS: ${outcome.status}</p>
        `;
    } catch (error) {
        console.error("API Error:", error);
        outcomeDiv.innerHTML = `<p class="status-failed">System Error: ${error.message}</p>`;
    }

    if (loadingText) loadingText.classList.add('hidden');
    simulateBtn.classList.remove('hidden');
    interventionPanel.classList.add('hidden');
    resultPanel.classList.remove('hidden');
});

// Reset the Game
resetBtn.addEventListener('click', () => {
    resultPanel.classList.add('hidden');
    interventionPanel.classList.remove('hidden');
    
    // Only clear the action if it's a Case File. Clear everything if Custom.
    const selectedCase = document.getElementById('case-file-selector').value;
    if (selectedCase === "custom") {
        document.getElementById('input-era').value = '';
        document.getElementById('input-location').value = '';
    }
    document.getElementById('input-action').value = '';
});
