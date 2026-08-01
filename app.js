// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
    });
}

// ⚠️ IMPORTANT: Paste your secure Cloudflare proxy URL below! 
// It should look something like: 'https://time-paradox-proxy.yourusername.workers.dev'
const API_URL = 'https://time-paradox-proxy.dazzlegamer39.workers.dev/';

// UI Elements
const simulateBtn = document.getElementById('simulate-btn');
const resetBtn = document.getElementById('reset-btn');
const resultPanel = document.getElementById('result-panel');
const outcomeDiv = document.getElementById('timeline-outcome');
const interventionPanel = document.getElementById('intervention-panel');
const loadingText = document.getElementById('loading-text');

simulateBtn.addEventListener('click', async () => {
    const era = document.getElementById('input-era').value || 'Unknown Time';
    const location = document.getElementById('input-location').value || 'Unknown Place';
    const action = document.getElementById('input-action').value || 'Did nothing';
    
    simulateBtn.classList.add('hidden');
    loadingText.classList.remove('hidden');

    // The Prompt instructing Gemini how to behave
    const promptText = `
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

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        
        // Clean and parse the JSON response from Gemini
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const outcome = JSON.parse(rawText);

        // Map status to CSS classes
        let statusClass = 'status-failed';
        if (outcome.status === 'SUCCESS') statusClass = 'status-success';
        if (outcome.status === 'PARADOX') statusClass = 'status-paradox';

        outcomeDiv.innerHTML = `
            <p><strong>Outcome: ${outcome.outcomeTitle}</strong></p>
            <p>${outcome.description}</p>
            <p class="${statusClass}">STATUS: ${outcome.status}</p>
        `;
    } catch (error) {
        console.error("API Error:", error);
        outcomeDiv.innerHTML = `<p class="status-failed">System Error: Timeline connection lost. Check your Cloudflare Worker URL and setup.</p>`;
    }

    loadingText.classList.add('hidden');
    simulateBtn.classList.remove('hidden');
    interventionPanel.classList.add('hidden');
    resultPanel.classList.remove('hidden');
});

resetBtn.addEventListener('click', () => {
    resultPanel.classList.add('hidden');
    interventionPanel.classList.remove('hidden');
    document.getElementById('input-era').value = '';
    document.getElementById('input-location').value = '';
    document.getElementById('input-action').value = '';
});
