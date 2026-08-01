// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered!', reg.scope))
            .catch(err => console.error('Service Worker Registration Failed!', err));
    });
}

// Game Logic
const simulateBtn = document.getElementById('simulate-btn');
const resetBtn = document.getElementById('reset-btn');
const resultPanel = document.getElementById('result-panel');
const outcomeDiv = document.getElementById('timeline-outcome');
const interventionPanel = document.getElementById('intervention-panel');

simulateBtn.addEventListener('click', () => {
    const time = document.getElementById('time-select').value;
    const action = document.getElementById('action-select').value;
    
    let resultText = "";
    
    // Causality Engine Logic
    if (time === '1898' && action === 'swap_map') {
        resultText = `
            <p><strong>Outcome: The Pax Danubia</strong></p>
            <p>Whispering to the Transit Minister pays off. Sarajevo's streets are modernized. The driver never gets lost, the assassination fails, and economic reforms decentralize the empire.</p>
            <p class="status-success">MISSION SUCCESS</p>`;
    } else if (time === '1850' && action === 'metallurgy') {
        resultText = `
            <p><strong>Outcome: The Steampunk Dictatorship</strong></p>
            <p>Britain builds steam-powered automated dreadnoughts and conquers continental Europe by 1888, enforcing global martial law.</p>
            <p class="status-failed">FAILED: DYSTOPIAN STABLE</p>`;
    } else if (time === '100BC' && action === 'steam_blueprint') {
        resultText = `
            <p><strong>Outcome: The Mechanical Caesar</strong></p>
            <p>Roman legions deploy steam tanks against Carthage. By 1914, Latin is the universal programming language of steam-driven supercomputers.</p>
            <p class="status-paradox">PARADOX UNLOCKED</p>`;
    } else if (time === '1914' && action === 'distract') {
        resultText = `
            <p><strong>Outcome: Delayed Inevitability</strong></p>
            <p>The driver avoids Princip, but systemic tensions remain. WWI breaks out in 1916 with early-nuclear weapons.</p>
            <p class="status-failed">FAILED: OVER-CORRECTION</p>`;
    } else {
        resultText = `
            <p><strong>Outcome: Temporal Friction</strong></p>
            <p>The universe resists your change. The timeline absorbs the anomaly and corrects itself. Events proceed exactly as they did in the baseline.</p>
            <p class="status-failed">FAILED: INEFFECTIVE</p>`;
    }

    outcomeDiv.innerHTML = resultText;
    interventionPanel.classList.add('hidden');
    resultPanel.classList.remove('hidden');
});

resetBtn.addEventListener('click', () => {
    resultPanel.classList.add('hidden');
    interventionPanel.classList.remove('hidden');
});
