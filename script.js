// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Draw hormone curves
    drawHormoneCurves(ctx, padding, graphWidth, graphHeight, cycleLength);
    
    // Draw current day indicator
    if (currentCycleDay !== null) {
        drawCurrentDayIndicator(ctx, padding, graphWidth, graphHeight, cycleLength, currentCycleDay);
    }
}

// Draw phase backgrounds with colors
function drawPhaseBackgrounds(ctx, padding, graphWidth, graphHeight, cycleLength, periodLength) {
    const phases = [
        { start: 1, end: periodLength, color: 'rgba(255, 0, 0, 0.1)' }, // Menstruation
        { start: periodLength + 1, end: 11, color: 'rgba(255, 215, 0, 0.1)' }, // Follicular
        { start: 12, end: 16, color: 'rgba(0, 255, 0, 0.1)' }, // Ovulation
        { start: 17, end: cycleLength, color: 'rgba(64, 224, 208, 0.1)' } // Luteal
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
function drawHormoneCurves(ctx, padding, graphWidth, graphHeight, cycleLength) {
    const points = 100; // Number of points for smooth curves
    
    // Estrogen curve (pink) - peaks at ovulation
    ctx.strokeStyle = '#ff1493';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const day = (i / points) * cycleLength;
        const x = padding + (i / points) * graphWidth;
        
        // Estrogen: rises during follicular phase, peaks at ovulation, drops in luteal phase with small rise
        let estrogen;
        if (day < 14) {
            // Rising during follicular phase
            estrogen = 0.2 + 0.7 * (day / 14);
        } else if (day < 16) {
            // Peak at ovulation
            estrogen = 0.9 - 0.3 * ((day - 14) / 2);
        } else {
            // Drop with small secondary rise in luteal phase
            const lutealDay = day - 16;
            const lutealLength = cycleLength - 16;
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
    
    // Progesterone curve (purple) - rises after ovulation
    ctx.strokeStyle = '#9370db';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const day = (i / points) * cycleLength;
        const x = padding + (i / points) * graphWidth;
        
        // Progesterone: low until ovulation, then rises and dominates luteal phase
        let progesterone;
        if (day < 14) {
            // Very low during follicular phase
            progesterone = 0.1;
        } else {
            // Rises after ovulation, peaks mid-luteal, then drops
            const lutealDay = day - 14;
            const lutealLength = cycleLength - 14;
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
    
    // Testosterone curve (blue) - relatively stable with small peak at ovulation
    ctx.strokeStyle = '#4169e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const day = (i / points) * cycleLength;
        const x = padding + (i / points) * graphWidth;
        
        // Testosterone: relatively stable with small peak around ovulation
        let testosterone;
        if (day < 12) {
            testosterone = 0.3 + 0.1 * (day / 12);
        } else if (day < 16) {
            // Small peak at ovulation
            testosterone = 0.4 + 0.15 * Math.sin(((day - 12) / 4) * Math.PI);
        } else {
            testosterone = 0.3 + 0.1 * Math.sin(((day - 16) / (cycleLength - 16)) * Math.PI);
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
});