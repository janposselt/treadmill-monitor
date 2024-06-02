export class HrMonitor {
    constructor() {
        this.currentHeartRate = null;
        this.targetHeartRate = null;
        this.distance = null;
        this.speed = null;
        this.duration = null;
        this.calories = null;
        this.incline = null;
    }

    // Herzfrequenz
    setCurrentHeartRate(bpm) {
        this.currentHeartRate = bpm;
        document.getElementById('current-heart-rate').innerText = `${bpm} bpm`;
    }

    setTargetHeartRate(target) {
        this.targetHeartRate = target;
        document.getElementById('target-heart-rate').innerText = `Ziel: ${target} bpm`;
    }

    setTargetHeartRateRange(min, max) {
        this.targetHeartRate = `${min}-${max}`;
        document.getElementById('target-heart-rate').innerText = `Ziel: ${min} bis ${max} bpm`;
    }

    // Distanz
    setDistance(meters) {
        const km = (meters / 1000).toFixed(2);
        this.distance = km;
        document.getElementById('distance').innerText = `${km} km`;
    }

    // Geschwindigkeit
    setSpeed(kmh) {
        if (kmh <= 0) {
            this.speed = 0;
            document.getElementById('speed').textContent = `-- min/km`;
        }
        else {
            const minutesPerHour = 60;
            const minPerKm = minutesPerHour / kmh;
            const minutes = Math.floor(minPerKm);
            const seconds = Math.round((minPerKm - minutes) * 60);

            this.speed = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            document.getElementById('speed').textContent = `${this.speed} min/km`;
        }
    }

    // Dauer
    setDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const durationStr = h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
        this.duration = durationStr;
        document.getElementById('duration').innerText = durationStr;
    }

    // Kcal
    setCalories(kcal) {
        this.calories = kcal;
        document.getElementById('calories').innerText = `${kcal} kcal`;
    }

    // Steigung
    setIncline(percentage) {
        this.incline = percentage;
        document.getElementById('incline').innerText = `${percentage} %`;
    }

    // Verbindungsstatus
    setDeviceName(name) {
        document.getElementById('device-name').innerText = `Gerät: ${name}`;
    }
}