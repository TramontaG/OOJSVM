class Clock {
    constructor(hardware){
        this.hardware = hardware;
    }

    pulse(){
        this.hardware.forEach(hardware => {
            hardware.presetValues();
        });
        this.hardware.forEach(hardware => {
            hardware.onClock();
        });
    }
}

module.exports = Clock;