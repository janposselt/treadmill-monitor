import { HrMonitor } from "./HrMonitor.js";
import { TreadmillControl } from "./TreadmillControl.js";
import { TreadmillCommands } from "./TreadmillCommands.js";
import { HeartRateTraining } from "./HeartRateTraining.js";

let monitor = new HrMonitor();

let treadmillControl = new TreadmillControl();
let treadmillCommands = new TreadmillCommands(treadmillControl);
let hrTraining = new HeartRateTraining(treadmillCommands);

treadmillControl.addDataHandler(treadmillData => {
    monitor.setCurrentHeartRate(treadmillData.hr);
    monitor.setSpeed(treadmillData.speed);
    monitor.setDistance(treadmillData.totalDistance);
    monitor.setDuration(treadmillData.elapsedTime);
    monitor.setIncline(treadmillData.inclination);
    monitor.setCalories(treadmillData.kcal);
});

document.querySelector('#toggleConnection').addEventListener('click', async function() {
    if(!treadmillControl.connected()) {
        document.querySelector('#toggleConnection').textContent = 'Verbindung trennen';

        await treadmillControl.connect();
        await treadmillCommands.requestControl();
    
        monitor.setDeviceName(treadmillControl.device.name);
    }
    else {
        document.querySelector('#toggleConnection').textContent = 'Verbinden';
        treadmillControl.disconnect();
        monitor.setDeviceName('Nicht verbunden');
    }
});

document.querySelector('#setTargetHr').addEventListener('click', function() {
    let targetHr = window.prompt('Ziel HF');

    if (targetHr && !isNaN(targetHr)) {
        targetHr = parseInt(targetHr, 10);
        monitor.setTargetHeartRate(targetHr);
        
        hrTraining.targetHeartRate = targetHr;
    }
    else {
        hrTraining.targetHeartRate = null;
        monitor.setTargetHeartRate('--');
    }
});

document.querySelector('#toggleHrTraining').addEventListener('click', (function() {

    let element = document.querySelector('#toggleHrTraining');

    return function() {
        if (!treadmillControl.connected() || !hrTraining.targetHeartRate) {
            alert('Es muss zunächst eine Verbindung mit einem Laufband hergestellt und eine Ziel-Herzfrequenz ausgewählt werden.');
            return;
        }

        if (!hrTraining.trainingInterval) {
            element.textContent = 'HR Training stoppen';
            hrTraining.startHFTraining();
        }
        else {
            element.textContent = 'HR Training starten';
            hrTraining.stopHFTraining();
        }
    }

})());

treadmillControl.addDataHandler(treadmillData => {
   hrTraining.currentSpeed = treadmillData.speed;
   hrTraining.handleHeartRateChanged(treadmillData.hr);
   document.querySelector('#avgHr').textContent = hrTraining.calculateAverageHeartRate().toFixed(0);
});