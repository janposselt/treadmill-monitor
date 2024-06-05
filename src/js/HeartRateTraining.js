export class HeartRateTraining {

    constructor(treadmillCommands) {
        this.trainingInterval = null;
        this.enableAdjustSpeed = false;
        this.heartRates = [];
        this.targetHeartRate = 0;
        this.maxSpeed = 14;
        this.treadmillCommands = treadmillCommands;
        this.currentSpeed = 0;
        this.tolerance = 5;
        this.smallAdjustment = 0.2;
        this.largeAdjustment = 0.5;
        this.smallTimeout = 5000;
        this.largeTimeout = 10000;
    }

    handleHeartRateChanged(heartRate) {
        this.heartRates.push(heartRate);
        if (this.heartRates.length > 20) this.heartRates.shift();
    }

    calculateAverageHeartRate() {
        const sum = this.heartRates.reduce((a, b) => a + b, 0);
        return (sum / this.heartRates.length) || 0;
    }

    async adjustSpeed() {
        if (!this.enableAdjustSpeed) {
            return;
        }

        const averageHeartRate = this.calculateAverageHeartRate();
        let newSpeed = this.currentSpeed;

        let timeout;

        if (averageHeartRate < this.targetHeartRate - this.tolerance) {
            if (averageHeartRate < this.targetHeartRate - 2 * this.tolerance) {
                newSpeed += this.largeAdjustment;
                timeout = this.largeTimeout;
            } else {
                newSpeed += this.smallAdjustment;
                timeout = this.smallTimeout;
            }
        } else if (averageHeartRate > this.targetHeartRate + this.tolerance) {
            if (averageHeartRate > this.targetHeartRate + 2 * this.tolerance) {
                newSpeed -= this.largeAdjustment;
                timeout = this.largeTimeout;
            } else {
                newSpeed -= this.smallAdjustment;
                timeout = this.smallTimeout;
            }
        }

        newSpeed = Math.max(1, Math.min(newSpeed, this.maxSpeed));

        if (newSpeed !== this.currentSpeed) {
            await this.treadmillCommands.setSpeed(newSpeed);
        }

       this.trainingInterval = setTimeout(this.adjustSpeed.bind(this), timeout);
    }


    startHFTraining() {
        if (!this.trainingInterval) {
            this.enableAdjustSpeed = true;
            this.trainingInterval = setTimeout(this.adjustSpeed.bind(this), 0);
        }
    }

    stopHFTraining() {
        if (this.trainingInterval) {
            this.enableAdjustSpeed = false;
            clearTimeout(this.trainingInterval);
            this.trainingInterval = null;
        }
    }
}
