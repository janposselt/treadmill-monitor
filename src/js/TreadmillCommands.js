
export class TreadmillCommands {
    constructor(treadmillControl) {
        this.treadmillControl = treadmillControl;
    }

    async requestControl() {
        const data = new Uint8Array([0]);
        await this.treadmillControl.sendCommand(data);
    }

    async start() {
        const data = new Uint8Array([7]);
        await this.treadmillControl.sendCommand(data);
    }

    async stop() {
        const data = new Uint8Array([8, 1]);
        await this.treadmillControl.sendCommand(data);
    }

    async setSpeed(value) {
        const buffer = new ArrayBuffer(3); // 1 Byte für uint8 + 2 Bytes für uint16
        const view = new DataView(buffer);

        // Schreibe den uint8 und uint16 in den Buffer
        const uint8Value = 2; // Beispiel uint8 Wert
        const uint16Value = value * 100; // Beispiel uint16 Wert in Little Endian
        view.setUint8(0, uint8Value);
        view.setUint16(1, uint16Value, true); // true für Little Endian
        await this.treadmillControl.sendCommand(buffer);
    }

    async getSupportedSpeedRange() {
        try {
            const value = await supportedSpeedRangeCharacteristic.readValue();

            return {
                min: value.getUint16(0, true) / 100,
                max: value.getUint16(2, true) / 100,
                minIncrement: value.getUint16(4, true) / 100
            };

        } catch (error) {
            console.error('Fehler beim Lesen des unterstützten Geschwindigkeitsbereichs', error);
        }
    }

    async getSupportedInclinationRange() {
        try {
            const value = await supportedInclinationRangeCharacteristic.readValue();

            return {
                min: value.getUint16(0, true) / 100,
                max: value.getUint16(2, true) / 100,
                minIncrement: value.getUint16(4, true) / 100
            };
        } catch (error) {
            console.error('Fehler beim Lesen des unterstützten Steigungsbereich', error);
        }
    }

    async setInclination(value) {
        const buffer = new ArrayBuffer(3);
        const view = new DataView(buffer);
        const uint8Value = 3;
        const int16Value = value * 10;
        view.setUint8(0, uint8Value);
        view.setInt16(1, int16Value, true);
        await this.treadmillControl.sendCommand(buffer);
    }
}
