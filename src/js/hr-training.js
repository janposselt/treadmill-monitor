import { HrMonitor } from "./HrMonitor.js";
import { TreadmillControl , TreadmillData} from "./TreadmillControl.js";
import { TreadmillCommands } from "./TreadmillCommands.js";
import { HeartRateTraining } from "./HeartRateTraining.js";
import { Workout, Segment } from "./Workout.js";
import { WorkoutParser } from "./WorkoutParser.js";

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

function setTargetHeartRate(targetHr) {
    
    if (targetHr && !isNaN(targetHr)) {
        targetHr = parseInt(targetHr, 10);
        monitor.setTargetHeartRate(targetHr);
        
        hrTraining.targetHeartRate = targetHr;
    }
    else {
        hrTraining.targetHeartRate = null;
        monitor.setTargetHeartRate('--');
    }
}

document.querySelector('#setTargetHr').addEventListener('click', function() {
    let targetHr = window.prompt('Ziel HF');

    setTargetHeartRate(targetHr);
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

const segments = [
    new Segment({ targetHeartRate: 137, duration: 10*60 }),
    new Segment({ targetHeartRate: 154, duration: 8*60 }),
    new Segment({ targetHeartRate: 124, duration: 3*60 }),
    new Segment({ targetHeartRate: 154, duration: 8*60 }),
    new Segment({ targetHeartRate: 124, duration: 3*60 }),
    new Segment({ targetHeartRate: 154, duration: 8*60 }),
    new Segment({ targetHeartRate: 124, duration: 3*60 }),
    new Segment({ targetHeartRate: 154, duration: 8*60 }),
    new Segment({ targetHeartRate: 137, duration: 10*60 }),
];

const workout = new Workout(segments);

workout.on('segmentChange', (event) => {
    let segment = event.segment;
    let index = event.index;
    let segments = workout.segments;

    document.querySelector('#currentSegment').textContent = JSON.stringify(event.segment);
    document.querySelector('#nextSegment').textContent = segments.length > index ? JSON.stringify(segments[index + 1]) : "";
    document.querySelector('#currentSegmentIndex').textContent = index + 1;
    document.querySelector('#numberOfSegments').textContent = segments.length;

    if (segment.targetHeartRate !== undefined) {
        setTargetHeartRate(segment.targetHeartRate);
        hrTraining.stopHFTraining();
        hrTraining.startHFTraining();
    }
    else {
        hrTraining.stopHFTraining();
    }

    if (segment.targetSpeed) {
        treadmillCommands.setSpeed(segment.targetSpeed);
    }
});

workout.on('workoutComplete', () => {
    treadmillCommands.setSpeed(4);
    hrTraining.stopHFTraining();
});

document.querySelector('#toggleWorkout').addEventListener('click', function() {
    if (!workout.running) {
        const parser = new WorkoutParser();
        const segments = parser.parse(document.querySelector('#workoutDefinition').value);
        workout.segments = segments;

        document.querySelector('#toggleWorkout').textContent = "Workout stoppen";
        workout.start();

        treadmillControl.addDataHandler((treadmillData) => {
            workout.update(treadmillData);
        })
    }
    else {
        document.querySelector('#toggleWorkout').textContent = "Workout starten";
        workout.stop();
    }
});


        // Funktion zum Anzeigen der Segmente im Overlay
        function displaySegments(segments) {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<button id="closeButton" class="close-button">Schließen</button>'; // Inhalt löschen und Schließen-Button neu einfügen

            segments.forEach(segment => {
                const segmentDiv = document.createElement('div');
                segmentDiv.classList.add('segment');
                segmentDiv.textContent = `Ziel-Geschwindigkeit: ${segment.targetSpeed ?? 'N/A'}, Ziel-Herzfrequenz: ${segment.targetHeartRate ?? 'N/A'}, Dauer: ${segment.duration ?? 'N/A'} min, Strecke: ${segment.distance ?? 'N/A'} km`;
                contentDiv.appendChild(segmentDiv);
            });

            document.getElementById('closeButton').addEventListener('click', () => {
                document.getElementById('overlay').classList.remove('visible');
            });
        }

        // Anzeige der Segmente beim Klick auf den Button
        document.getElementById('showOverlayButton').addEventListener('click', () => {
            displaySegments(workout.segments);
            document.getElementById('overlay').classList.add('visible');
        });

        // Schließen des Overlays beim Klick auf den Schließen-Button
        document.getElementById('closeButton').addEventListener('click', () => {
            document.getElementById('overlay').classList.remove('visible');
        });
