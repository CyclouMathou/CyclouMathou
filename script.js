// Calendar functionality with menstruation date tracking

function initCalendar() {
    // Initialize calendar UI
    // Include code to create the modal and handle date selections
}

function trackMenstruationDates(selectedDate) {
    // Store selected menstruation dates in local storage or a database
}

function calculatePhase(cycleLength, lastMenstruationDate) {
    const today = new Date();
    const lastDate = new Date(lastMenstruationDate);
    const daysSinceLast = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    const phase = daysSinceLast % cycleLength;

    if (phase < 5) {
        return "Menstrual Phase";
    } else if (phase < 14) {
        return "Follicular Phase";
    } else if (phase < 21) {
        return "Luteal Phase";
    } else {
        return "Pre-Menstrual Phase";
    }
}

// Example usage
document.addEventListener('DOMContentLoaded', initCalendar);