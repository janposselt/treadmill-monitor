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
        let index = 0;

        while (index < text.length) {
            if (text[index] === '(') {
                const closingIndex = this.findClosingParenthesis(text, index);
                const nestedText = text.substring(index + 1, closingIndex);
                const nestedSegments = this.parse(nestedText);
                segments.push(...nestedSegments);
                index = closingIndex + 1;
            } else {
                let repeatMatch = text.substring(index).match(/^(\d+)x\(/);
                if (repeatMatch) {
                    const repeatCount = parseInt(repeatMatch[1]);
                    const closingIndex = this.findClosingParenthesis(text, index + repeatMatch[0].length - 1);
                    const repeatText = text.substring(index + repeatMatch[0].length, closingIndex);
                    const repeatSegments = this.parse(repeatText);

                    for (let i = 0; i < repeatCount; i++) {
                        segments.push(...repeatSegments);
                    }
                    index = closingIndex + 1;
                } else {
                    let endIndex = text.indexOf(',', index);
                    if (endIndex === -1) endIndex = text.length;

                    const segmentStr = text.substring(index, endIndex).trim();
                    if (segmentStr) {
                        segments.push(this.parseSegment(segmentStr));
                    }
                    index = endIndex + 1;
                }
            }
        }

        return segments;
    }

    findClosingParenthesis(text, openIndex) {
        let closeIndex = openIndex;
        let counter = 1;

        while (counter > 0 && closeIndex < text.length - 1) {
            closeIndex++;
            if (text[closeIndex] === '(') {
                counter++;
            } else if (text[closeIndex] === ')') {
                counter--;
            }
        }

        if (counter !== 0) {
            throw new Error('Ungültiges Format: Klammern sind nicht ausgeglichen');
        }

        return closeIndex;
    }
}
