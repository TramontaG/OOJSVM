const instructionMap = require("../Hardware/Processor/InstructionMap");

class Log {
    static getStringFromByte = byte => {
        return "0x" + byte.toString(16).toUpperCase().padStart(2, '0');
    }
    
    static getStringFrom16Bits = bits => {
        return "0x" + bits.toString(16).toUpperCase().padStart(4, '0'); 
    }

    static getInstructionFromByte = byte => {
        const byteString = this.getStringFromByte(byte);
        return instructionMap[byteString];
    }
}

module.exports = Log;