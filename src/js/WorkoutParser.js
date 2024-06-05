import { Segment } from "./Workout.js";

export class WorkoutParser {
    constructor() {}

    parseTime(timeStr) {
        const parts = timeStr.split(':').map(part => parseFloat(part));
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1]; // Minuten und Sekunden
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2]; // Stunden, Minuten und Sekunden
        }
        return 0;
    }

    parsePace(paceStr) {
        const parts = paceStr.split(':').map(part => parseFloat(part));
        return (parts[0] * 60 + parts[1]) / 60; // Pace in Minuten pro Kilometer
    }

    parseDistance(distanceStr) {
        return parseFloat(distanceStr.replace('m', '').replace('km', '')) * (distanceStr.includes('km') ? 1000 : 1); // Meter
    }

    parseSegment(segmentStr) {
        const durationDistanceMatch = segmentStr.match(/(\d+[:\d+]*)[minkm]*/);
        const hrSpeedMatch = segmentStr.match(/@\d+[:\d+]*[bmpmin/km]+/);

        if (!durationDistanceMatch || !hrSpeedMatch) {
            throw new Error('Ungültiges Segmentformat');
        }

        const durationDistance = durationDistanceMatch[0];
        const hrSpeed = hrSpeedMatch[0].substring(1);

        let duration, distance, targetHeartRate, targetSpeed;

        if (durationDistance.includes('min')) {
            duration = this.parseTime(durationDistance.replace('min', ''));
        } else {
            distance = this.parseDistance(durationDistance);
        }

        if (hrSpeed.includes('bpm')) {
            targetHeartRate = parseInt(hrSpeed.replace('bpm', ''));
        } else {
            targetSpeed = this.parsePace(hrSpeed.replace('min/km', ''));
        }

        return new Segment({ targetSpeed, targetHeartRate, duration, distance });
    }

    parse(text) {
        const segments = [];
        const repeatPattern = /(\d+)x\(([^)]+)\)/g;
        let match;

        while ((match = repeatPattern.exec(text)) !== null) {
            const repeatCount = parseInt(match[1]);
            const repeatSegments = match[2].split(',').map(segmentStr => this.parseSegment(segmentStr));

            for (let i = 0; i < repeatCount; i++) {
                segments.push(...repeatSegments);
            }
        }

        const mainSegments = text.replace(repeatPattern, '').split(',').map(segmentStr => segmentStr.trim()).filter(Boolean);
        for (const segmentStr of mainSegments) {
            segments.push(this.parseSegment(segmentStr));
        }

        return segments;
    }
}


