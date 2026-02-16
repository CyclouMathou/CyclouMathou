// Profile and Splash Screen Management
let currentProfile = null;

function initSplashScreen() {
    // Check if profile was already selected
    const savedProfile = localStorage.getItem('cycleAppProfile');
    if (savedProfile) {
        currentProfile = savedProfile;
        hideSplashScreen();
        applyProfileSettings();
        return;
    }

    // Show splash screen and hide main content
    const mainContent = document.getElementById('mainContent');
    mainContent.classList.add('hidden');

    // Setup profile button listeners
    const mathildeButton = document.getElementById('mathildeButton');
    const joButton = document.getElementById('joButton');

    mathildeButton.addEventListener('click', () => selectProfile('mathilde'));
    joButton.addEventListener('click', () => selectProfile('jo'));
}

function selectProfile(profile) {
    currentProfile = profile;
    localStorage.setItem('cycleAppProfile', profile);
    hideSplashScreen();
    applyProfileSettings();
}

function hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
    }, 500);
}

function applyProfileSettings() {
    // Add profile indicator
    addProfileIndicator();
    
    // Initialize home button with profile-specific styling
    initHomeButton();

    // If viewer mode (Jo), apply read-only restrictions
    if (currentProfile === 'jo') {
        document.body.classList.add('read-only');
        adaptInterfaceForJo();
    }
}

function addProfileIndicator() {
    // Check if indicator already exists
    if (document.querySelector('.profile-indicator')) {
        return;
    }

    const indicator = document.createElement('div');
    indicator.className = `profile-indicator ${currentProfile}`;
    indicator.textContent = currentProfile === 'mathilde' ? 'La Queen Mathilde' : 'Jo';
    document.body.appendChild(indicator);
}

function isReadOnlyMode() {
    return document.body.classList.contains('read-only');
}

// Data Sharing via URL
function exportDataToURL() {
    const data = {
        periodDates: JSON.parse(localStorage.getItem('periodDates') || '[]'),
        cycleLength: localStorage.getItem('cycleLength') || '28',
        periodLength: localStorage.getItem('periodLength') || '5',
        cycleRegular: localStorage.getItem('cycleRegular') || 'false',
        todaysMood: localStorage.getItem('todaysMood') || null,
        todaysNeeds: localStorage.getItem('todaysNeeds') || null
    };
    
    // Compress and encode data for URL
    const jsonString = JSON.stringify(data);
    const base64Data = encodeURIComponent(btoa(jsonString));
    
    // Create shareable URL - without profile to allow recipient to choose
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('data', base64Data);
    
    return url.toString();
}

function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (!dataParam) {
        return false;
    }
    
    try {
        // Decode and decompress data
        const jsonString = atob(decodeURIComponent(dataParam));
        const data = JSON.parse(jsonString);
        
        // Import data to localStorage (excluding profile to allow user selection)
        if (data.periodDates) {
            localStorage.setItem('periodDates', JSON.stringify(data.periodDates));
        }
        
        if (data.cycleLength) {
            localStorage.setItem('cycleLength', data.cycleLength);
        }
        
        if (data.periodLength) {
            localStorage.setItem('periodLength', data.periodLength);
        }
        
        if (data.cycleRegular) {
            localStorage.setItem('cycleRegular', data.cycleRegular);
        }
        
        if (data.todaysMood) {
            localStorage.setItem('todaysMood', data.todaysMood);
        }
        
        if (data.todaysNeeds) {
            localStorage.setItem('todaysNeeds', data.todaysNeeds);
        }
        
        // Clean URL after loading data
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return true;
    } catch (error) {
        console.error('Error loading data from URL:', error);
        return false;
    }
}

function initShareButton() {
    // Check if share button already exists
    if (document.getElementById('shareButton')) {
        return;
    }
    
    // Create share button
    const shareButton = document.createElement('button');
    shareButton.id = 'shareButton';
    shareButton.className = 'share-button';
    shareButton.innerHTML = '🔗 Partager';
    shareButton.setAttribute('aria-label', 'Partager mes données');
    
    // Add click handler
    shareButton.addEventListener('click', () => {
        const shareableURL = exportDataToURL();
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareableURL).then(() => {
            // Show success message
            const originalText = shareButton.innerHTML;
            shareButton.innerHTML = '✓ Lien copié!';
            shareButton.classList.add('copied');
            
            setTimeout(() => {
                shareButton.innerHTML = originalText;
                shareButton.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = shareableURL;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                const originalText = shareButton.innerHTML;
                shareButton.innerHTML = '✓ Lien copié!';
                shareButton.classList.add('copied');
                
                setTimeout(() => {
                    shareButton.innerHTML = originalText;
                    shareButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                alert('Impossible de copier le lien: ' + shareableURL);
            }
            document.body.removeChild(textarea);
        });
    });
    
    // Add button to the page (next to settings toggle)
    const settingsToggle = document.getElementById('settingsToggle');
    if (settingsToggle) {
        settingsToggle.parentNode.insertBefore(shareButton, settingsToggle.nextSibling);
    }
}

function initHomeButton() {
    // Check if home button already exists
    if (document.getElementById('homeButton')) {
        return;
    }
    
    // Create home button
    const homeButton = document.createElement('button');
    homeButton.id = 'homeButton';
    homeButton.className = `home-button ${currentProfile}`;
    homeButton.innerHTML = '🏠 Accueil';
    homeButton.setAttribute('aria-label', 'Retour à l\'accueil');
    
    // Add click handler
    homeButton.addEventListener('click', () => {
        // Clear profile selection
        localStorage.removeItem('cycleAppProfile');
        // Reload page to show splash screen
        window.location.reload();
    });
    
    // Add button to the page
    document.body.appendChild(homeButton);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load data from URL if present (for data sharing)
    const dataLoaded = loadDataFromURL();
    
    initSplashScreen();
    loadCycleSettings();
    updateDateDisplay();
    updatePhaseDisplay();
    updateCircleColor();
    initMoodTracking();
    initNeedsTracking();
    loadTodaysMood();
    loadTodaysNeeds();
    initCalendar();
    initSettings();
    drawHormoneGraph();
    initHormoneModal();
    initHormoneCheckboxes();
    updateHormoneInterpretation();
    initShareButton();
});

// Calculate cycle phase based on cycle day
function getCyclePhase(cycleDay, settings) {
    // Ovulation: Day 14 ±2 days = days 12-16 (5 days total)
    // Menstruation: Days 1 to periodLength
    // Follicular: After menstruation until ovulation
    // Luteal: After ovulation until end of cycle
    
    if (cycleDay >= 1 && cycleDay <= settings.periodLength) {
        return 'menstruation';
    } else if (cycleDay > settings.periodLength && cycleDay < 12) {
        return 'folliculaire';
    } else if (cycleDay >= 12 && cycleDay <= 16) {
        return 'ovulation';
    } else {
        return 'lutéale';
    }
}

// Get phase color for styling
function getPhaseColor(phase) {
    const colors = {
        'menstruation': '#ff0000',      // bright red
        'folliculaire': '#ffd700',      // yellow/gold
        'ovulation': '#00ff00',         // green
        'lutéale': '#40e0d0',          // turquoise
        'retard': '#ff00ff'            // magenta (late period)
    };
    return colors[phase] || '#ff00ff';
}

// Update circle border color based on current phase
function updateCircleColor() {
    const circle = document.getElementById('dateCircle');
    const cycleDay = getCurrentCycleDay();
    
    if (cycleDay === null) {
        // No period data, keep default magenta
        circle.style.borderColor = '#ff00ff';
        return;
    }
    
    const settings = loadCycleSettings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toDateString();
    const periodDates = getPeriodDates();
    const predictedDates = getPredictedPeriodDates();
    const isInPredictedPeriod = predictedDates.includes(todayString) && !periodDates.includes(todayString);
    
    let phase;
    if (isInPredictedPeriod) {
        phase = 'retard';
    } else {
        phase = getCyclePhase(cycleDay, settings);
    }
    
    const color = getPhaseColor(phase);
    circle.style.borderColor = color;
}

// Update phase display
function updatePhaseDisplay() {
    const phaseDisplay = document.getElementById('phaseDisplay');
    
    const cycleDay = getCurrentCycleDay();
    
    // If no period data, show a default message
    if (cycleDay === null) {
        phaseDisplay.textContent = 'Ajoutez vos dates de règles';
        // Update Jo's displays even if no data
        if (currentProfile === 'jo') {
            updateJoMoodDisplay();
            updateJoNeedsDisplay();
        }
        return;
    }
    
    const settings = loadCycleSettings();
    
    // Check if today is in predicted period dates (not confirmed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toDateString();
    const periodDates = getPeriodDates();
    const predictedDates = getPredictedPeriodDates();
    const isInPredictedPeriod = predictedDates.includes(todayString) && !periodDates.includes(todayString);
    
    // If today is in predicted period (dotted pink), show "retard de règles / phase lutéale"
    if (isInPredictedPeriod) {
        phaseDisplay.textContent = 'retard de règles / phase lutéale';
        updateCircleColor();
        // Update Jo's displays
        if (currentProfile === 'jo') {
            updateJoMoodDisplay();
            updateJoNeedsDisplay();
        }
        return;
    }
    
    // Determine phase based on cycle day and settings
    let phase;
    if (cycleDay >= 1 && cycleDay <= settings.periodLength) {
        phase = 'période de menstruation';
    } else if (cycleDay >= 12 && cycleDay <= 16) {
        phase = "phase d'ovulation";
    } else if (cycleDay > settings.periodLength && cycleDay < 12) {
        phase = 'phase folliculaire';
    } else {
        phase = 'phase lutéale';
    }
    
    phaseDisplay.textContent = phase;
    updateCircleColor();
    
    // Update Jo's displays
    if (currentProfile === 'jo') {
        updateJoMoodDisplay();
        updateJoNeedsDisplay();
    }
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
            // Check if in read-only mode
            if (isReadOnlyMode()) {
                return;
            }
            
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
            // Check if in read-only mode
            if (isReadOnlyMode()) {
                return;
            }
            
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
    // JavaScript's getDay() returns 0 for Sunday, so we convert 0 to 7 to treat Monday as day 1
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
        } else {
            // Apply phase color for non-period dates
            const phase = getPhaseForDate(date);
            if (phase) {
                dateElement.classList.add(`phase-${phase}`);
            }
        }
        
        // Add click handler to mark/unmark period
        dateElement.addEventListener('click', () => togglePeriodDate(dateString));
        
        datesContainer.appendChild(dateElement);
    }
}

function togglePeriodDate(dateString) {
    // Check if in read-only mode
    if (isReadOnlyMode()) {
        return;
    }
    
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
    updateCircleColor();
    updateHormoneInterpretation();
}

function getPeriodDates() {
    return JSON.parse(localStorage.getItem('periodDates') || '[]');
}

// Get the phase for a specific date
function getPhaseForDate(date) {
    const periodDates = getPeriodDates();
    if (periodDates.length === 0) {
        return null;
    }
    
    const settings = loadCycleSettings();
    const sortedDates = periodDates.map(d => new Date(d)).sort((a, b) => a - b);
    
    // Find the most recent period start before or on the target date
    let lastPeriodStart = null;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (sortedDates[i] <= date) {
            lastPeriodStart = sortedDates[i];
            // Find the actual start by going backwards through consecutive dates
            for (let j = i - 1; j >= 0; j--) {
                const laterDate = sortedDates[j + 1];
                const earlierDate = sortedDates[j];
                const diffDays = Math.floor((laterDate - earlierDate) / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                    break;
                }
                lastPeriodStart = earlierDate;
            }
            break;
        }
    }
    
    if (!lastPeriodStart) {
        return null;
    }
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    lastPeriodStart.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - lastPeriodStart;
    if (diffTime < 0) {
        return null;
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If beyond one cycle length, don't show phase colors (predicted period will show instead)
    if (diffDays >= settings.cycleLength) {
        return null;
    }
    
    const cycleDay = diffDays + 1;
    
    // Check if this is a predicted period date
    const predictedDates = getPredictedPeriodDates();
    const dateString = targetDate.toDateString();
    const periodDatesSet = new Set(periodDates);
    const isInPredictedPeriod = predictedDates.includes(dateString) && !periodDatesSet.has(dateString);
    
    if (isInPredictedPeriod) {
        return 'retard';
    }
    
    return getCyclePhase(cycleDay, settings);
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
        updateCircleColor();
        drawHormoneGraph();
        updateHormoneInterpretation();
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
    
    // Find the most recent period start by grouping consecutive dates
    let lastPeriodStart = sortedDates[sortedDates.length - 1];
    for (let i = sortedDates.length - 1; i > 0; i--) {
        const current = sortedDates[i];
        const previous = sortedDates[i - 1];
        const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
        
        // If gap is more than 1 day, previous date is from a different period
        if (diffDays > 1) {
            break;
        }
        lastPeriodStart = previous;
    }
    
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
    
    // Find the most recent period start by grouping consecutive dates
    let lastPeriodStart = sortedDates[sortedDates.length - 1];
    for (let i = sortedDates.length - 1; i > 0; i--) {
        const current = sortedDates[i];
        const previous = sortedDates[i - 1];
        const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
        
        // If gap is more than 1 day, previous date is from a different period
        if (diffDays > 1) {
            break;
        }
        lastPeriodStart = previous;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastPeriodStart.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastPeriodStart;
    
    // If last period start is in the future, return null (invalid state)
    if (diffTime < 0) {
        return null;
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const settings = loadCycleSettings();
    const cycleDay = (diffDays % settings.cycleLength) + 1;
    
    return cycleDay;
}

// Get visible hormones based on checkbox state
function getVisibleHormones() {
    const visibleHormones = {};
    
    // Read state from checkboxes - default to true only if checkbox doesn't exist
    const checkboxes = document.querySelectorAll('.hormone-checkbox');
    checkboxes.forEach(checkbox => {
        const hormone = checkbox.getAttribute('data-hormone');
        visibleHormones[hormone] = checkbox.checked;
    });
    
    // If no checkboxes found, default all to visible
    if (Object.keys(visibleHormones).length === 0) {
        return {
            estrogene: true,
            progesterone: true,
            testosterone: true,
            lh: true,
            fsh: true
        };
    }
    
    return visibleHormones;
}

// Draw hormone graph with cycle phases and current day indicator
function drawHormoneGraph() {
    const canvas = document.getElementById('hormoneGraph');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const settings = loadCycleSettings();
    const cycleLength = settings.cycleLength;
    const periodLength = settings.periodLength;
    
    // Get current cycle day for indicator
    const currentCycleDay = getCurrentCycleDay();
    
    // Get visible hormones from checkboxes
    const visibleHormones = getVisibleHormones();
    
    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Graph dimensions
    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw phase backgrounds
    drawPhaseBackgrounds(ctx, padding, graphWidth, graphHeight, cycleLength, periodLength);
    
    // Draw axes
    drawAxes(ctx, padding, width, height, graphWidth, graphHeight, cycleLength);
    
    // Draw hormone curves (only visible ones)
    drawHormoneCurves(ctx, padding, graphWidth, graphHeight, cycleLength, visibleHormones);
    
    // Draw current day indicator
    if (currentCycleDay !== null) {
        drawCurrentDayIndicator(ctx, padding, graphWidth, graphHeight, cycleLength, currentCycleDay);
    }
}

// Draw phase backgrounds with colors
function drawPhaseBackgrounds(ctx, padding, graphWidth, graphHeight, cycleLength, periodLength) {
    // Calculate phase boundaries proportionally
    const ovulationDay = Math.round(cycleLength / 2);
    const follicularEnd = ovulationDay - 3;
    const ovulationEnd = ovulationDay + 2;
    
    const phases = [
        { start: 1, end: periodLength, color: 'rgba(255, 0, 0, 0.1)' }, // Menstruation
        { start: periodLength + 1, end: follicularEnd, color: 'rgba(255, 215, 0, 0.1)' }, // Follicular
        { start: follicularEnd + 1, end: ovulationEnd, color: 'rgba(0, 255, 0, 0.1)' }, // Ovulation
        { start: ovulationEnd + 1, end: cycleLength, color: 'rgba(64, 224, 208, 0.1)' } // Luteal
    ];
    
    phases.forEach(phase => {
        const startX = padding + (phase.start - 1) / cycleLength * graphWidth;
        const endX = padding + phase.end / cycleLength * graphWidth;
        const width = endX - startX;
        
        ctx.fillStyle = phase.color;
        ctx.fillRect(startX, padding, width, graphHeight);
    });
}

// Draw axes with labels
function drawAxes(ctx, padding, width, height, graphWidth, graphHeight, cycleLength) {
    ctx.strokeStyle = 'rgba(135, 206, 250, 0.5)';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // X-axis labels (cycle days)
    ctx.fillStyle = '#87ceeb';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // Draw labels for key days
    const keyDays = [1, 7, 14, 21, cycleLength];
    keyDays.forEach(day => {
        if (day <= cycleLength) {
            const x = padding + (day - 1) / cycleLength * graphWidth;
            ctx.fillText(`J${day}`, x, height - padding + 20);
            
            // Draw tick mark
            ctx.beginPath();
            ctx.moveTo(x, height - padding);
            ctx.lineTo(x, height - padding + 5);
            ctx.strokeStyle = 'rgba(135, 206, 250, 0.5)';
            ctx.stroke();
        }
    });
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Niveau hormonal', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Jour du cycle', width / 2, height - 5);
}

// Draw hormone curves (estrogen, progesterone, testosterone)
function drawHormoneCurves(ctx, padding, graphWidth, graphHeight, cycleLength, visibleHormones) {
    const points = 100; // Number of points for smooth curves
    
    // Calculate ovulation day proportionally (typically mid-cycle)
    const ovulationDay = cycleLength / 2;
    const ovulationStart = ovulationDay - 2;
    const ovulationEnd = ovulationDay + 2;
    
    // Estrogen curve (pink) - peaks at ovulation
    if (visibleHormones.estrogene) {
        ctx.strokeStyle = '#ff1493';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const day = (i / points) * cycleLength;
            const x = padding + (i / points) * graphWidth;
            
            // Estrogen: rises during follicular phase, peaks at ovulation, drops in luteal phase with small rise
            let estrogen;
            if (day < ovulationDay) {
                // Rising during follicular phase
                estrogen = 0.2 + 0.7 * (day / ovulationDay);
            } else if (day < ovulationEnd) {
                // Peak at ovulation
                estrogen = 0.9 - 0.3 * ((day - ovulationDay) / 2);
            } else {
                // Drop with small secondary rise in luteal phase
                const lutealDay = day - ovulationEnd;
                const lutealLength = cycleLength - ovulationEnd;
                estrogen = 0.6 - 0.3 * Math.sin((lutealDay / lutealLength) * Math.PI);
            }
            
            const y = padding + graphHeight - (estrogen * graphHeight * 0.9);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // Progesterone curve (purple) - rises after ovulation
    if (visibleHormones.progesterone) {
        ctx.strokeStyle = '#9370db';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const day = (i / points) * cycleLength;
            const x = padding + (i / points) * graphWidth;
            
            // Progesterone: low until ovulation, then rises and dominates luteal phase
            let progesterone;
            if (day < ovulationDay) {
                // Very low during follicular phase
                progesterone = 0.1;
            } else {
                // Rises after ovulation, peaks mid-luteal, then drops
                const lutealDay = day - ovulationDay;
                const lutealLength = cycleLength - ovulationDay;
                progesterone = 0.1 + 0.8 * Math.sin((lutealDay / lutealLength) * Math.PI);
            }
            
            const y = padding + graphHeight - (progesterone * graphHeight * 0.9);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // Testosterone curve (blue) - relatively stable with small peak at ovulation
    if (visibleHormones.testosterone) {
        ctx.strokeStyle = '#4169e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const day = (i / points) * cycleLength;
            const x = padding + (i / points) * graphWidth;
            
            // Testosterone: relatively stable with small peak around ovulation
            let testosterone;
            if (day < ovulationStart) {
                testosterone = 0.3 + 0.1 * (day / ovulationStart);
            } else if (day < ovulationEnd) {
                // Small peak at ovulation
                testosterone = 0.4 + 0.15 * Math.sin(((day - ovulationStart) / (ovulationEnd - ovulationStart)) * Math.PI);
            } else {
                testosterone = 0.3 + 0.1 * Math.sin(((day - ovulationEnd) / (cycleLength - ovulationEnd)) * Math.PI);
            }
            
            const y = padding + graphHeight - (testosterone * graphHeight * 0.9);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // LH curve (orange) - sharp peak at ovulation
    if (visibleHormones.lh) {
        const LH_BASELINE = 0.15;
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const day = (i / points) * cycleLength;
            const x = padding + (i / points) * graphWidth;
            
            // LH: low baseline with sharp surge just before ovulation
            let lh;
            if (day < ovulationDay - 2) {
                // Low baseline during early follicular phase
                lh = LH_BASELINE;
            } else if (day < ovulationDay + 1) {
                // Sharp LH surge triggering ovulation
                const surgeProgress = (day - (ovulationDay - 2)) / 3;
                lh = LH_BASELINE + 0.75 * Math.sin(surgeProgress * Math.PI);
            } else {
                // Returns to baseline after ovulation
                lh = LH_BASELINE;
            }
            
            const y = padding + graphHeight - (lh * graphHeight * 0.9);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // FSH curve (lime green) - peaks early follicular, drops at ovulation
    if (visibleHormones.fsh) {
        ctx.strokeStyle = '#32cd32';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const day = (i / points) * cycleLength;
            const x = padding + (i / points) * graphWidth;
            
            // FSH: high in early follicular phase, drops as estrogen rises, slight rise in luteal
            let fsh;
            if (day < 5) {
                // High at cycle start to stimulate follicle development
                fsh = 0.7 - 0.2 * (day / 5);
            } else if (day < ovulationDay) {
                // Gradual decrease as estrogen rises
                fsh = 0.5 - 0.3 * ((day - 5) / (ovulationDay - 5));
            } else if (day < ovulationDay + 2) {
                // Small surge at ovulation with LH
                const surgeProgress = (day - ovulationDay) / 2;
                fsh = 0.2 + 0.2 * Math.sin(surgeProgress * Math.PI);
            } else {
                // Low during luteal phase with slight increase at end
                const lutealDay = day - (ovulationDay + 2);
                const lutealLength = cycleLength - (ovulationDay + 2);
                fsh = 0.2 + 0.15 * (lutealDay / lutealLength);
            }
            
            const y = padding + graphHeight - (fsh * graphHeight * 0.9);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
}

// Draw current day indicator line
function drawCurrentDayIndicator(ctx, padding, graphWidth, graphHeight, cycleLength, currentDay) {
    const x = padding + ((currentDay - 1) / cycleLength) * graphWidth;
    
    // Draw vertical line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + graphHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Jour ${currentDay}`, x, padding - 10);
}

// Redraw graph on window resize
window.addEventListener('resize', function() {
    drawHormoneGraph();
    updateHormoneInterpretation();
});

// Hormone interpretation data based on cycle phase
const cycleInterpretations = {
    menstruation: {
        hormones: "Niveaux d'œstrogène et de progestérone bas. Le corps se remet à zéro pour un nouveau cycle.",
        mood: "Vous pouvez vous sentir plus fatiguée, introspective ou sensible. C'est normal et temporaire. La fatigue peut être accompagnée d'une envie de ralentir et de se reposer.",
        relational: "Besoin accru de confort, de douceur et de compréhension. Privilégiez les moments calmes avec vos proches. Vous pourriez préférer des activités tranquilles et peu d'interactions sociales intenses. C'est le moment de vous écouter et de respecter votre besoin de repos."
    },
    folliculaire: {
        hormones: "L'œstrogène augmente progressivement, stimulant votre énergie et votre confiance.",
        mood: "Vous vous sentez probablement plus optimiste, énergique et confiante. C'est une période propice aux nouveaux projets et aux défis. Votre créativité et votre clarté mentale sont au rendez-vous.",
        relational: "Phase idéale pour socialiser, rencontrer de nouvelles personnes et renforcer vos liens. Vous êtes plus ouverte aux autres et aux nouvelles expériences. C'est le moment parfait pour planifier des activités sociales ou des sorties."
    },
    ovulation: {
        hormones: "Pic d'œstrogène et de testostérone. Maximum d'énergie et de confiance.",
        mood: "Vous êtes au sommet de votre forme ! Énergie débordante, confiance maximale, communication fluide. Vous vous sentez attirante et sociable. C'est votre moment de rayonnement.",
        relational: "Période de forte sociabilité et de connexion. Votre charisme est à son maximum. C'est le moment idéal pour les rendez-vous importants, les présentations ou les conversations significatives. Vous êtes naturellement plus expressive et empathique."
    },
    lutéale: {
        hormones: "La progestérone domine, apportant un effet calmant mais pouvant causer des symptômes prémenstruels en fin de phase.",
        mood: "En début de phase : calme et stabilité. En fin de phase : possibles changements d'humeur, irritabilité ou anxiété (SPM). Vous pourriez vous sentir plus sensible émotionnellement et avoir besoin de plus de temps pour vous.",
        relational: "Besoin croissant d'intimité avec des personnes de confiance. Vous pourriez préférer les petits groupes aux grandes foules. Privilégiez la qualité des interactions à la quantité. En fin de phase, vous pourriez avoir besoin de plus d'espace personnel et de compréhension de vos proches."
    },
    retard: {
        hormones: "Si vos règles sont en retard, la progestérone peut rester élevée, ou chuter si un nouveau cycle commence.",
        mood: "Possibles inquiétudes ou stress liés au retard. Vous pourriez vous sentir dans l'attente ou l'incertitude. L'anxiété peut amplifier les symptômes physiques.",
        relational: "Besoin de soutien et de réassurance. Parlez à quelqu'un de confiance si vous vous sentez inquiète. Le soutien émotionnel de vos proches peut être particulièrement important."
    }
};

// Jo's profile - Mood emojis and emotions by cycle phase
const joMoodByPhase = {
    menstruation: {
        emoji: '😴',
        emotion: 'Fatiguée et introspective'
    },
    folliculaire: {
        emoji: '😊',
        emotion: 'Énergique et optimiste'
    },
    ovulation: {
        emoji: '⚡',
        emotion: 'Confiante et rayonnante'
    },
    lutéale: {
        emoji: '😌',
        emotion: 'Calme puis sensible'
    },
    retard: {
        emoji: '😟',
        emotion: 'Inquiète et incertaine'
    }
};

// Jo's profile - Daily partner suggestions by cycle phase
const joPartnerSuggestions = {
    menstruation: [
        "Prépare-lui un thé chaud ou son chocolat chaud préféré ☕",
        "Propose-lui de regarder sa série préférée ensemble en mode cocooning 📺",
        "Fais les courses ou prépare le dîner pour qu'elle n'ait pas à s'en soucier 🍽️",
        "Offre-lui un massage des pieds ou du dos sans rien demander en retour 💆",
        "Laisse-lui des petits mots doux dans la maison pour lui remonter le moral 💌",
        "Prends en charge les tâches ménagères aujourd'hui pour qu'elle puisse se reposer 🧹",
        "Propose une soirée calme avec des bougies et de la musique douce 🕯️"
    ],
    folliculaire: [
        "Propose-lui une sortie au restaurant ou un pique-nique improvisé 🍱",
        "Suggère une activité sportive ensemble comme une randonnée ou du vélo 🚴",
        "Planifie une sortie culturelle : musée, expo, concert 🎨",
        "Organise une soirée jeux de société ou karaoké avec des amis 🎲",
        "Emmène-la découvrir un nouveau quartier ou un nouveau café ☕",
        "Propose un atelier créatif ensemble : cuisine, bricolage, peinture 🎨",
        "Planifie un week-end surprise ou une escapade d'un jour 🚗"
    ],
    ovulation: [
        "Complimente son look, elle est au top de sa forme ! 💃",
        "Organise un dîner romantique aux chandelles avec sa musique préférée 🕯️",
        "Emmène-la danser ou à un concert qu'elle aime 💃",
        "Planifie une sortie photos pour capturer ce moment où elle rayonne 📸",
        "Propose une activité qu'elle a toujours voulu essayer ensemble 🎯",
        "Laisse-lui un message d'amour sincère sur pourquoi tu l'apprécies ❤️",
        "Organise une soirée surprise avec ses amis proches 🎉"
    ],
    lutéale: [
        "Sois patient et compréhensif si elle semble irritable ou fatiguée 🤗",
        "Complimente-la sincèrement sur ce qu'elle fait de bien aujourd'hui 💝",
        "Propose une soirée cocooning avec un film qu'elle choisit 🎬",
        "Prends les devants sur l'organisation du quotidien sans qu'elle demande 📋",
        "Prépare son plat réconfortant préféré pour le dîner 🍝",
        "Offre-lui de l'espace si elle en a besoin, tout en étant disponible 🤝",
        "Fais-lui un compliment authentique sur sa personnalité, pas son apparence 💕"
    ],
    retard: [
        "Sois présent et rassurant, écoute ses inquiétudes sans jugement 👂",
        "Propose de l'accompagner à la pharmacie si besoin 🏥",
        "Prends en charge le stress quotidien : courses, repas, ménage 🛒",
        "Rappelle-lui que tu es là quoi qu'il arrive ❤️",
        "Offre-lui une sortie pour se changer les idées si elle le souhaite 🌳",
        "Prépare-lui une tisane calmante et un moment tranquille ensemble 🍵",
        "Reste patient et disponible pour discuter quand elle le souhaite 💬"
    ]
};

// Adapt interface for Jo's profile
function adaptInterfaceForJo() {
    // Wait for DOM to be fully loaded
    setTimeout(() => {
        updateJoMoodDisplay();
        updateJoNeedsDisplay();
    }, 100);
}

// Update mood display for Jo's profile
function updateJoMoodDisplay() {
    const moodContainer = document.querySelector('.mood-container');
    if (!moodContainer) return;

    const cycleDay = getCurrentCycleDay();
    if (cycleDay === null) {
        moodContainer.innerHTML = '<div class="jo-mood-display">Ajoute des dates de règles pour voir l\'humeur du jour</div>';
        return;
    }

    const settings = loadCycleSettings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toDateString();
    const periodDates = getPeriodDates();
    const predictedDates = getPredictedPeriodDates();
    const isInPredictedPeriod = predictedDates.includes(todayString) && !periodDates.includes(todayString);

    let phase;
    if (isInPredictedPeriod) {
        phase = 'retard';
    } else {
        phase = getCyclePhase(cycleDay, settings);
    }

    const moodData = joMoodByPhase[phase];
    if (moodData) {
        moodContainer.innerHTML = `
            <div class="jo-mood-display">
                <div class="jo-mood-emoji">${moodData.emoji}</div>
                <div class="jo-mood-emotion">${moodData.emotion}</div>
            </div>
        `;
    }
}

// Update needs display for Jo's profile with daily suggestions
function updateJoNeedsDisplay() {
    const needsContainer = document.querySelector('.needs-container');
    if (!needsContainer) return;

    const cycleDay = getCurrentCycleDay();
    if (cycleDay === null) {
        needsContainer.innerHTML = '<div class="jo-suggestion-display">Ajoute des dates de règles pour voir les suggestions du jour</div>';
        return;
    }

    const settings = loadCycleSettings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toDateString();
    const periodDates = getPeriodDates();
    const predictedDates = getPredictedPeriodDates();
    const isInPredictedPeriod = predictedDates.includes(todayString) && !periodDates.includes(todayString);

    let phase;
    if (isInPredictedPeriod) {
        phase = 'retard';
    } else {
        phase = getCyclePhase(cycleDay, settings);
    }

    const suggestions = joPartnerSuggestions[phase];
    if (suggestions && suggestions.length > 0) {
        // Use day of year to select a suggestion (changes daily)
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const suggestionIndex = dayOfYear % suggestions.length;
        const todaySuggestion = suggestions[suggestionIndex];

        needsContainer.innerHTML = `
            <div class="jo-suggestion-display">
                <div class="jo-suggestion-title">💡 Suggestion du jour pour toi</div>
                <div class="jo-suggestion-text">${todaySuggestion}</div>
                <div class="jo-suggestion-phase">Phase: ${phase === 'menstruation' ? 'Menstruation' : phase === 'folliculaire' ? 'Folliculaire' : phase === 'ovulation' ? 'Ovulation' : phase === 'lutéale' ? 'Lutéale' : 'Retard'}</div>
            </div>
        `;
    }
}

// Update hormone interpretation based on current cycle day
function updateHormoneInterpretation() {
    const hormoneLevel = document.getElementById('hormoneLevel');
    const moodInterpretation = document.getElementById('moodInterpretation');
    const relationalNeeds = document.getElementById('relationalNeeds');
    
    if (!hormoneLevel || !moodInterpretation || !relationalNeeds) return;
    
    const cycleDay = getCurrentCycleDay();
    
    if (cycleDay === null) {
        hormoneLevel.textContent = 'Ajoutez vos dates de règles pour voir l\'interprétation';
        moodInterpretation.textContent = 'Non disponible';
        relationalNeeds.textContent = 'Non disponible';
        return;
    }
    
    const settings = loadCycleSettings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toDateString();
    const periodDates = getPeriodDates();
    const predictedDates = getPredictedPeriodDates();
    const isInPredictedPeriod = predictedDates.includes(todayString) && !periodDates.includes(todayString);
    
    let phase;
    if (isInPredictedPeriod) {
        phase = 'retard';
    } else {
        phase = getCyclePhase(cycleDay, settings);
    }
    
    const interpretation = cycleInterpretations[phase];
    if (interpretation) {
        hormoneLevel.textContent = interpretation.hormones;
        moodInterpretation.textContent = interpretation.mood;
        relationalNeeds.textContent = interpretation.relational;
    }
}

// Hormone Information Data - Medical and precise
const hormoneInfo = {
    estrogene: {
        title: 'Œstrogène (Estradiol)',
        content: `
            <p>L'<strong>œstrogène</strong>, principalement sous forme d'estradiol, est une hormone stéroïdienne sécrétée par les follicules ovariens. Elle joue un rôle central dans le cycle menstruel et la physiologie reproductive féminine.</p>
            
            <p><strong>Rôle physiologique dans le cycle menstruel :</strong></p>
            <ul>
                <li><strong>Phase folliculaire (J1 à J14) :</strong> L'estradiol est sécrété en quantités croissantes par le follicule dominant en développement. Il stimule la prolifération de l'endomètre (muqueuse utérine), augmentant son épaisseur de 1 à 5-7 mm pour préparer une éventuelle nidation.</li>
                <li><strong>Pic pré-ovulatoire (J12-14) :</strong> Le taux d'estradiol atteint son maximum (200-400 pg/mL), déclenchant par rétrocontrôle positif une libération massive de LH (hormone lutéinisante) par l'hypophyse, provoquant l'ovulation.</li>
                <li><strong>Phase lutéale (J14 à J28) :</strong> Après l'ovulation, les niveaux d'estradiol diminuent puis remontent légèrement grâce au corps jaune (follicule transformé post-ovulation).</li>
            </ul>
            
            <p><strong>Autres effets physiologiques :</strong></p>
            <ul>
                <li>Favorise la sécrétion de glaire cervicale claire et élastique facilitant la migration des spermatozoïdes en période péri-ovulatoire</li>
                <li>Augmente la densité osseuse (prévention de l'ostéoporose)</li>
                <li>Effet cardio-protecteur par action sur le métabolisme lipidique</li>
                <li>Influence l'humeur et le bien-être psychologique</li>
                <li>Stimule la libido en période péri-ovulatoire</li>
            </ul>
        `
    },
    progesterone: {
        title: 'Progestérone',
        content: `
            <p>La <strong>progestérone</strong> est une hormone stéroïdienne sécrétée principalement par le corps jaune ovarien après l'ovulation. Elle est essentielle pour préparer l'utérus à une grossesse potentielle.</p>
            
            <p><strong>Rôle physiologique dans le cycle menstruel :</strong></p>
            <ul>
                <li><strong>Phase folliculaire (J1 à J14) :</strong> Les niveaux de progestérone restent très bas (< 1 ng/mL), car elle n'est pratiquement pas sécrétée avant l'ovulation.</li>
                <li><strong>Phase lutéale (J14 à J28) :</strong> Après l'ovulation, le corps jaune sécrète massivement de la progestérone, atteignant un pic vers J21 du cycle (10-20 ng/mL). Cette élévation transforme l'endomètre prolifératif en endomètre sécrétoire, riche en glycogène et en vaisseaux sanguins, optimal pour l'implantation d'un embryon.</li>
                <li><strong>Absence de grossesse :</strong> Si la fécondation n'a pas lieu, le corps jaune régresse après 12-14 jours, entraînant une chute brutale de la progestérone qui provoque la desquamation de l'endomètre (menstruation).</li>
            </ul>
            
            <p><strong>Autres effets physiologiques :</strong></p>
            <ul>
                <li>Épaissit la glaire cervicale, la rendant imperméable aux spermatozoïdes après l'ovulation</li>
                <li>Augmente la température corporelle basale de 0,3-0,5°C en phase lutéale (effet thermogénique)</li>
                <li>Action sédative et anxiolytique via ses métabolites actifs sur le système nerveux central</li>
                <li>Prépare les glandes mammaires à la lactation</li>
                <li>Effet relaxant sur la musculature utérine (prévention des contractions prématurées)</li>
                <li>Peut entraîner une rétention hydrique et des symptômes prémenstruels (tension mammaire, ballonnements)</li>
            </ul>
        `
    },
    testosterone: {
        title: 'Testostérone',
        content: `
            <p>La <strong>testostérone</strong> est une hormone androgène principalement connue comme hormone masculine, mais elle est également présente chez la femme en quantités plus faibles. Elle est produite par les ovaires et les glandes surrénales.</p>
            
            <p><strong>Rôle physiologique dans le cycle menstruel :</strong></p>
            <ul>
                <li><strong>Niveaux de base :</strong> Les concentrations de testostérone chez la femme sont relativement stables tout au long du cycle (15-70 ng/dL), soit environ 10 fois moins que chez l'homme.</li>
                <li><strong>Pic péri-ovulatoire (J12-14) :</strong> Une légère augmentation de la testostérone est observée autour de l'ovulation, contribuant à l'augmentation de la libido et de l'énergie à cette période propice à la conception.</li>
                <li><strong>Phase lutéale :</strong> Les niveaux demeurent relativement constants avec une légère diminution possible en fin de cycle.</li>
            </ul>
            
            <p><strong>Autres effets physiologiques :</strong></p>
            <ul>
                <li>Contribue significativement à la libido et au désir sexuel chez la femme</li>
                <li>Maintien de la masse musculaire et de la force physique</li>
                <li>Favorise la densité osseuse en synergie avec les œstrogènes</li>
                <li>Influence l'humeur, l'énergie et la motivation</li>
                <li>Participe à la production de nouveaux follicules ovariens</li>
                <li>Action sur la distribution de la masse grasse et le métabolisme</li>
                <li>En excès (hyperandrogénie), peut causer de l'acné, une pilosité excessive (hirsutisme) et des troubles du cycle (syndrome des ovaires polykystiques)</li>
            </ul>
        `
    },
    lh: {
        title: 'LH (Hormone Lutéinisante)',
        content: `
            <p>La <strong>LH (hormone lutéinisante)</strong> est une hormone gonadotrope sécrétée par l'hypophyse antérieure (glande pituitaire). Elle joue un rôle crucial dans le déclenchement de l'ovulation et la formation du corps jaune.</p>
            
            <p><strong>Rôle physiologique dans le cycle menstruel :</strong></p>
            <ul>
                <li><strong>Phase folliculaire (J1 à J12) :</strong> Les niveaux de LH restent relativement bas et stables (2-10 mUI/mL), permettant la maturation progressive du follicule dominant sous l'influence de la FSH et de l'estradiol.</li>
                <li><strong>Pic de LH (J12-14) :</strong> Lorsque l'estradiol atteint son pic pré-ovulatoire, il déclenche par rétrocontrôle positif une libération massive de LH (pic à 25-100 mUI/mL). Ce pic de LH survient environ 24-36 heures avant l'ovulation.</li>
                <li><strong>Ovulation :</strong> Le pic de LH provoque la rupture du follicule mature et la libération de l'ovocyte (ovulation), généralement vers J14 d'un cycle de 28 jours.</li>
                <li><strong>Phase lutéale (J14 à J28) :</strong> Après l'ovulation, la LH stimule la transformation du follicule rompu en corps jaune, qui sécrète progestérone et estradiol pour maintenir l'endomètre.</li>
            </ul>
            
            <p><strong>Autres effets physiologiques :</strong></p>
            <ul>
                <li>Stimule la production d'androgènes (dont la testostérone) par les cellules thécales de l'ovaire</li>
                <li>Essentielle pour la lutéinisation et le maintien du corps jaune en début de phase lutéale</li>
                <li>Les tests d'ovulation détectent ce pic de LH dans les urines pour prédire la période fertile</li>
                <li>Des niveaux élevés constants peuvent indiquer un syndrome des ovaires polykystiques (SOPK) ou une ménopause</li>
            </ul>
        `
    },
    fsh: {
        title: 'FSH (Hormone Folliculo-Stimulante)',
        content: `
            <p>La <strong>FSH (hormone folliculo-stimulante)</strong> est une hormone gonadotrope sécrétée par l'hypophyse antérieure. Elle est essentielle pour la croissance et la maturation des follicules ovariens.</p>
            
            <p><strong>Rôle physiologique dans le cycle menstruel :</strong></p>
            <ul>
                <li><strong>Début de phase folliculaire (J1 à J5) :</strong> Les niveaux de FSH augmentent au début du cycle (5-20 mUI/mL) pour recruter un groupe de follicules ovariens et stimuler leur croissance. Cette augmentation fait suite à la chute de progestérone et d'estradiol en fin de cycle précédent.</li>
                <li><strong>Phase folliculaire moyenne (J5 à J12) :</strong> La FSH diminue progressivement grâce au rétrocontrôle négatif exercé par l'estradiol croissant sécrété par le follicule dominant. Seul le follicule le plus sensible (dominant) continue de croître malgré la baisse de FSH.</li>
                <li><strong>Pic pré-ovulatoire (J12-14) :</strong> Un petit pic de FSH accompagne le pic de LH, contribuant à la maturation finale de l'ovocyte et à la rupture folliculaire.</li>
                <li><strong>Phase lutéale (J14 à J28) :</strong> Les niveaux de FSH restent bas pendant la phase lutéale en raison des taux élevés d'estradiol et de progestérone sécrétés par le corps jaune.</li>
            </ul>
            
            <p><strong>Autres effets physiologiques :</strong></p>
            <ul>
                <li>Stimule les cellules de la granulosa du follicule à produire de l'estradiol (via l'aromatisation des androgènes)</li>
                <li>Augmente le nombre de récepteurs à la LH sur le follicule dominant, le préparant à répondre au pic de LH</li>
                <li>Favorise la prolifération des cellules de la granulosa et l'expansion du follicule</li>
                <li>Le ratio LH/FSH est utilisé cliniquement pour diagnostiquer certaines pathologies (ex : ratio LH/FSH > 2-3 dans le SOPK)</li>
                <li>Des niveaux élevés constants de FSH peuvent indiquer une insuffisance ovarienne ou une ménopause</li>
            </ul>
        `
    }
};

// Initialize hormone modal functionality
function initHormoneModal() {
    const modal = document.getElementById('hormoneModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (!modal || !closeBtn) return;
    
    // Add click events to legend items
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.addEventListener('click', function() {
            const hormone = this.getAttribute('data-hormone');
            if (hormone) {
                showHormoneInfo(hormone);
            }
        });
    });
    
    // Close modal on close button click
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Initialize hormone visibility checkboxes
function initHormoneCheckboxes() {
    const checkboxes = document.querySelectorAll('.hormone-checkbox');
    
    // Load saved checkbox states from localStorage
    checkboxes.forEach(checkbox => {
        const hormone = checkbox.getAttribute('data-hormone');
        const savedState = localStorage.getItem(`hormone-${hormone}-visible`);
        
        // If saved state exists, use it; otherwise default to checked
        if (savedState !== null) {
            checkbox.checked = savedState === 'true';
        }
    });
    
    // Add change event listeners to redraw graph when checkboxes change
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const hormone = this.getAttribute('data-hormone');
            // Save checkbox state to localStorage
            localStorage.setItem(`hormone-${hormone}-visible`, this.checked);
            // Redraw the graph
            drawHormoneGraph();
        });
    });
}

// Close modal on Escape key (global handler registered once)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('hormoneModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    }
});

// Show hormone information in modal
function showHormoneInfo(hormone) {
    const modal = document.getElementById('hormoneModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const info = hormoneInfo[hormone];
    if (!info) return;
    
    modalTitle.textContent = info.title;
    modalBody.innerHTML = info.content;
    modal.classList.add('active');
}