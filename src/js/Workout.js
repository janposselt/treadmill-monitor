export class Segment {
    constructor({ targetSpeed, targetHeartRate, duration, distance }) {
        if ((targetSpeed !== undefined && targetHeartRate !== undefined) || 
            (targetSpeed === undefined && targetHeartRate === undefined)) {
            throw new Error('Ein Segment muss entweder eine Ziel-Geschwindigkeit oder eine Ziel-Herzfrequenz haben, nicht beides und nicht keins.');
        }

        if ((duration !== undefined && distance !== undefined) || 
            (duration === undefined && distance === undefined)) {
            throw new Error('Ein Segment muss entweder eine Dauer oder eine Strecke haben, nicht beides und nicht keins.');
        }

        this.targetSpeed = targetSpeed;
        this.targetHeartRate = targetHeartRate;
        this.duration = duration;
        this.distance = distance;
    }
}

export class Workout {

    constructor(segments) {
        this.segments = segments;
        this.currentSegmentIndex = 0;
        this.startTime = null;
        this.startDistance = null;
        this.listeners = {
            segmentChange: [],
            workoutComplete: []
        };

        this.running = false;
    }

    on(event, listener) {
        if (this.listeners[event]) {
            this.listeners[event].push(listener);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(listener => listener(data));
        }
    }

    start() {
        if (this.segments.length === 0) {
            throw new Error('Das Workout hat keine Segmente.');
        }
        this.running = true;
        this.startTime = 0;
        this.startDistance = 0;
        this.emit('workoutStarted', this);
        this.emit('segmentChange', {segment: this.segments[this.currentSegmentIndex], index: this.currentSegmentIndex});
    }

    stop() {
        this.running = false;
        this.emit('workoutStopped', this);
    }

    update(treadmillData) {
        if (this.running == false) {
            return;
        }

        if (this.currentSegmentIndex >= this.segments.length) {
            this.emit('workoutComplete');
            return;
        }

        const currentSegment = this.segments[this.currentSegmentIndex];
        const elapsedTime = treadmillData.elapsedTime;
        const distanceCovered = treadmillData.totalDistance - this.startDistance;

        let segmentCompleted = false;
        if (currentSegment.duration !== undefined && elapsedTime >= this.startTime + currentSegment.duration) {
            segmentCompleted = true;
        } else if (currentSegment.distance !== undefined && distanceCovered >= currentSegment.distance) {
            segmentCompleted = true;
        }

        if (segmentCompleted) {
            this.currentSegmentIndex++;
            if (this.currentSegmentIndex < this.segments.length) {
                this.startTime = treadmillData.elapsedTime;
                this.startDistance = treadmillData.totalDistance;
                this.emit('segmentChange', {segment: this.segments[this.currentSegmentIndex], index: this.currentSegmentIndex});
            } else {
                this.emit('workoutComplete');
            }
        }
    }
}
