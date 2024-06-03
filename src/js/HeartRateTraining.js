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
        this.smallAdjustment = 0.1;
        this.largeAdjustment = 0.5;
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

        if (averageHeartRate < this.targetHeartRate - this.tolerance) {
            if (averageHeartRate < this.targetHeartRate - 2 * this.tolerance) {
                newSpeed += this.largeAdjustment;
            } else {
                newSpeed += this.smallAdjustment;
            }
        } else if (averageHeartRate > this.targetHeartRate + this.tolerance) {
            if (averageHeartRate > this.targetHeartRate + 2 * this.tolerance) {
                newSpeed -= this.largeAdjustment;
            } else {
                newSpeed -= this.smallAdjustment;
            }
        }

        newSpeed = Math.max(1, Math.min(newSpeed, this.maxSpeed));

        if (newSpeed !== this.currentSpeed) {
            await this.treadmillCommands.setSpeed(newSpeed);
        }
    }


    startHFTraining() {
        if (!this.trainingInterval) {
            this.enableAdjustSpeed = true;
            this.trainingInterval = setInterval(this.adjustSpeed.bind(this), 10000);
        }
    }

    stopHFTraining() {
        if (this.trainingInterval) {
            this.enableAdjustSpeed = false;
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
    }
}
