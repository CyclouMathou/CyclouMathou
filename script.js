// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateDateDisplay();
    updatePhaseDisplay();
    initMoodTracking();
    initNeedsTracking();
    loadTodaysMood();
    loadTodaysNeeds();
});

// Calculate cycle phase based on cycle day
function getCyclePhase(cycleDay) {
    // Standard 28-day cycle phases:
    // Days 1-5: Menstruation
    // Days 6-13: Follicular phase
    // Days 14-16: Ovulation
    // Days 17-28: Luteal phase
    
    if (cycleDay >= 1 && cycleDay <= 5) {
        return 'menstruation';
    } else if (cycleDay >= 6 && cycleDay <= 13) {
        return 'folliculaire';
    } else if (cycleDay >= 14 && cycleDay <= 16) {
        return 'ovulation';
    } else if (cycleDay >= 17 && cycleDay <= 28) {
        return 'lutéale';
    } else {
        // If beyond 28 days, cycle repeats
        return getCyclePhase(((cycleDay - 1) % 28) + 1);
    }
}

// Update phase display
function updatePhaseDisplay() {
    const phaseDisplay = document.getElementById('phaseDisplay');
    
    // Get or initialize cycle start date
    let cycleStartDate = localStorage.getItem('cycleStartDate');
    
    if (!cycleStartDate) {
        // Initialize with today as day 1 of cycle
        cycleStartDate = new Date().toDateString();
        localStorage.setItem('cycleStartDate', cycleStartDate);
    }
    
    // Calculate current cycle day
    const startDate = new Date(cycleStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = ((diffDays % 28) === 0) ? 28 : (diffDays % 28);
    
    // Get phase name
    const phase = getCyclePhase(cycleDay);
    
    // Capitalize first letter
    const phaseName = phase.charAt(0).toUpperCase() + phase.slice(1);
    
    phaseDisplay.textContent = phaseName;
}

// Update date display in the circle
function updateDateDisplay() {
    const dateDisplay = document.getElementById('dateDisplay');
    const today = new Date();
    
    const day = today.getDate();
    const month = today.toLocaleDateString('fr-FR', { month: 'long' });
    
    // Capitalize first letter of month
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    
    dateDisplay.innerHTML = `<div class="day">${day}</div><div class="month">${capitalizedMonth}</div>`;
}

// Mood Tracking
function initMoodTracking() {
    const moodButtons = document.querySelectorAll('.mood');

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove previous selection
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selection to clicked button
            button.classList.add('selected');
            
            const mood = button.dataset.mood;
            const moodLabel = button.getAttribute('aria-label');
            
            // Save today's mood
            saveTodaysMood(mood, moodLabel);
        });
    });
}

// Save today's mood
function saveTodaysMood(mood, label) {
    const today = new Date().toDateString();
    const moodData = {
        date: today,
        mood: mood,
        label: label
    };
    localStorage.setItem('todaysMood', JSON.stringify(moodData));
}

// Load today's mood
function loadTodaysMood() {
    const savedMood = localStorage.getItem('todaysMood');
    if (savedMood) {
        const moodData = JSON.parse(savedMood);
        const today = new Date().toDateString();
        
        if (moodData.date === today) {
            const button = document.querySelector(`[data-mood="${moodData.mood}"]`);
            if (button) {
                button.classList.add('selected');
            }
        }
    }
}

// Needs Tracking
function initNeedsTracking() {
    const needButtons = document.querySelectorAll('.need');

    needButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle selection
            button.classList.toggle('selected');
            
            // Get all selected needs
            const selectedNeeds = Array.from(document.querySelectorAll('.need.selected'))
                .map(btn => btn.dataset.need);
            
            // Save today's needs
            saveTodaysNeeds(selectedNeeds);
        });
    });
}

// Save today's needs
function saveTodaysNeeds(needs) {
    const today = new Date().toDateString();
    const needsData = {
        date: today,
        needs: needs
    };
    localStorage.setItem('todaysNeeds', JSON.stringify(needsData));
}

// Load today's needs
function loadTodaysNeeds() {
    const savedNeeds = localStorage.getItem('todaysNeeds');
    if (savedNeeds) {
        const needsData = JSON.parse(savedNeeds);
        const today = new Date().toDateString();
        
        if (needsData.date === today) {
            needsData.needs.forEach(need => {
                const button = document.querySelector(`[data-need="${need}"]`);
                if (button) {
                    button.classList.add('selected');
                }
            });
        }
    }
}