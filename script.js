// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCycleSettings();
    updateDateDisplay();
    updatePhaseDisplay();
    initMoodTracking();
    initNeedsTracking();
    loadTodaysMood();
    loadTodaysNeeds();
    initCalendar();
    initSettings();
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
    } else {
        return 'lutéale';
    }
}

// Update phase display
function updatePhaseDisplay() {
    const phaseDisplay = document.getElementById('phaseDisplay');
    
    const cycleDay = getCurrentCycleDay();
    
    // If no period data, show a default message
    if (cycleDay === null) {
        phaseDisplay.textContent = 'Ajoutez vos dates de règles';
        return;
    }
    
    const settings = loadCycleSettings();
    
    // Determine phase based on cycle day and settings
    let phase;
    if (cycleDay >= 1 && cycleDay <= settings.periodLength) {
        phase = 'menstruation';
    } else if (cycleDay <= Math.floor(settings.cycleLength * 0.45)) {
        phase = 'folliculaire';
    } else if (cycleDay <= Math.floor(settings.cycleLength * 0.55)) {
        phase = 'ovulation';
    } else {
        phase = 'lutéale';
    }
    
    phaseDisplay.textContent = phase;
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

// Calendar functionality
let currentWeekStart = new Date();

function initCalendar() {
    // Set to start of week (Monday)
    currentWeekStart.setDate(currentWeekStart.getDate() - (currentWeekStart.getDay() || 7) + 1);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    renderCalendar();
    
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderCalendar();
    });
    
    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderCalendar();
    });
}

function renderCalendar() {
    const monthDisplay = document.getElementById('calendarMonth');
    const datesContainer = document.getElementById('calendarDates');
    
    // Display month and year
    const monthName = currentWeekStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    monthDisplay.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    
    // Clear previous dates
    datesContainer.innerHTML = '';
    
    // Get period dates and predictions
    const periodDates = getPeriodDates();
    const predictedDates = getPredictedPeriodDates();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Render 7 days of the week
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        
        const dateElement = document.createElement('div');
        dateElement.className = 'calendar-date';
        dateElement.textContent = date.getDate();
        
        const dateString = date.toDateString();
        
        // Add classes based on date type
        if (date.getTime() === today.getTime()) {
            dateElement.classList.add('today');
        }
        
        if (periodDates.includes(dateString)) {
            dateElement.classList.add('period');
        } else if (predictedDates.includes(dateString)) {
            dateElement.classList.add('predicted-period');
        }
        
        // Add click handler to mark/unmark period
        dateElement.addEventListener('click', () => togglePeriodDate(dateString));
        
        datesContainer.appendChild(dateElement);
    }
}

function togglePeriodDate(dateString) {
    let periodDates = JSON.parse(localStorage.getItem('periodDates') || '[]');
    
    const index = periodDates.indexOf(dateString);
    if (index > -1) {
        periodDates.splice(index, 1);
    } else {
        periodDates.push(dateString);
    }
    
    localStorage.setItem('periodDates', JSON.stringify(periodDates));
    renderCalendar();
    updatePhaseDisplay();
}

function getPeriodDates() {
    return JSON.parse(localStorage.getItem('periodDates') || '[]');
}

// Cycle Settings
function loadCycleSettings() {
    const settings = {
        cycleLength: parseInt(localStorage.getItem('cycleLength') || '28'),
        periodLength: parseInt(localStorage.getItem('periodLength') || '5'),
        cycleRegular: localStorage.getItem('cycleRegular') === 'true'
    };
    return settings;
}

function saveCycleSettings(cycleLength, periodLength, cycleRegular) {
    localStorage.setItem('cycleLength', cycleLength);
    localStorage.setItem('periodLength', periodLength);
    localStorage.setItem('cycleRegular', cycleRegular);
}

function initSettings() {
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveButton = document.getElementById('saveSettings');
    
    // Load current settings
    const settings = loadCycleSettings();
    document.getElementById('cycleLength').value = settings.cycleLength;
    document.getElementById('periodLength').value = settings.periodLength;
    document.getElementById('cycleRegular').value = settings.cycleRegular;
    
    // Toggle settings panel
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
    });
    
    // Save settings
    saveButton.addEventListener('click', () => {
        const cycleLength = parseInt(document.getElementById('cycleLength').value);
        const periodLength = parseInt(document.getElementById('periodLength').value);
        const cycleRegular = document.getElementById('cycleRegular').value === 'true';
        
        saveCycleSettings(cycleLength, periodLength, cycleRegular);
        settingsPanel.classList.remove('open');
        renderCalendar();
        updatePhaseDisplay();
    });
}

// Cycle prediction algorithm
function getPredictedPeriodDates() {
    const periodDates = getPeriodDates();
    if (periodDates.length === 0) {
        return [];
    }
    
    const settings = loadCycleSettings();
    const sortedDates = periodDates.map(d => new Date(d)).sort((a, b) => a - b);
    
    // Find the most recent period start
    const lastPeriodStart = sortedDates[sortedDates.length - 1];
    
    // Calculate next period start
    const nextPeriodStart = new Date(lastPeriodStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + settings.cycleLength);
    
    // Generate predicted period dates
    const predictedDates = [];
    for (let i = 0; i < settings.periodLength; i++) {
        const date = new Date(nextPeriodStart);
        date.setDate(date.getDate() + i);
        predictedDates.push(date.toDateString());
    }
    
    return predictedDates;
}

// Update phase display based on actual period data
function getCurrentCycleDay() {
    const periodDates = getPeriodDates();
    if (periodDates.length === 0) {
        return null;
    }
    
    const sortedDates = periodDates.map(d => new Date(d)).sort((a, b) => a - b);
    const lastPeriodStart = sortedDates[sortedDates.length - 1];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastPeriodStart.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastPeriodStart;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const settings = loadCycleSettings();
    const cycleDay = (diffDays % settings.cycleLength) + 1;
    
    return cycleDay;
}