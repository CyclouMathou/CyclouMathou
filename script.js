// cycleTracking.js

class CycleTracker {
    constructor() {
        this.cycleData = [];
    }

    addCycle(startDate, endDate) {
        const cycle = { startDate, endDate };
        this.cycleData.push(cycle);
    }

    getCycles() {
        return this.cycleData;
    }

    getCycleCount() {
        return this.cycleData.length;
    }

    getCurrentCycle() {
        const now = new Date();
        return this.cycleData.filter(cycle => 
            new Date(cycle.startDate) <= now && 
            new Date(cycle.endDate) >= now
        );
    }
}

// Example usage:
const tracker = new CycleTracker();
tracker.addCycle('2026-02-15T21:00:00Z', '2026-02-16T21:00:00Z');
console.log(tracker.getCycles());
console.log('Current Cycle:', tracker.getCurrentCycle());