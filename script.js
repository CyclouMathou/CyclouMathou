// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateDateDisplay();
    initMoodTracking();
    initNeedsTracking();
    loadTodaysMood();
    loadTodaysNeeds();
});

// Update date display in the circle
function updateDateDisplay() {
    const dateDisplay = document.getElementById('dateDisplay');
    const today = new Date();
    
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    };
    
    const formattedDate = today.toLocaleDateString('fr-FR', options);
    dateDisplay.innerHTML = formattedDate.replace(',', '<br>');
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