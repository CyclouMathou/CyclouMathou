// Cycle Tracking Script for Menstruation Calendar

class CycleTracker {
    constructor() {
        this.cycleDays = 28; // Average cycle length
        this.menstruationDays = [];
        this.phases = ['Follicular', 'Ovulation', 'Luteal', 'Menstruation'];
        this.currentPhase = '';
        this.currentDate = new Date();
        this.loadData();
        this.updateUI();
    }

    // Load data from local storage
    loadData() {
        const storedDates = JSON.parse(localStorage.getItem('menstruationDates')) || [];
        this.menstruationDays = storedDates;
    }

    // Save data to local storage
    saveData() {
        localStorage.setItem('menstruationDates', JSON.stringify(this.menstruationDays));
    }

    // Mark a menstruation date
    markDate(date) {
        this.menstruationDays.push(date);
        this.saveData();
        this.calculatePhase();
        this.updateUI();
    }

    // Calculate the current phase based on marked menstruation dates
    calculatePhase() {
        const today = new Date();
        const lastMenstruationDate = new Date(this.menstruationDays[this.menstruationDays.length - 1]);
        const difference = Math.floor((today - lastMenstruationDate) / (1000 * 60 * 60 * 24));

        if (difference < 5) {
            this.currentPhase = this.phases[3]; // Menstruation
        } else if (difference < 14) {
            this.currentPhase = this.phases[0]; // Follicular
        } else if (difference < 17) {
            this.currentPhase = this.phases[1]; // Ovulation
        } else {
            this.currentPhase = this.phases[2]; // Luteal
        }
    }

    // Update the UI
    updateUI() {
        // For UI update, you'd implement DOM manipulation here
        console.log(`Current Phase: ${this.currentPhase}`);
        console.log(`Menstruation Dates: ${this.menstruationDays}`);
    }

    // Navigate months
    navigateMonth(direction) {
        if (direction === 'next') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        }
        this.updateCalendar();
    }

    // Implement additional methods for handling UI interactions
}

const cycleTracker = new CycleTracker();

// Example UI interaction
// cycleTracker.markDate('2026-02-01'); // Example of marking a date
