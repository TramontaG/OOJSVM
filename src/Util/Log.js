const instructionMap = require('../Hardware/Processor/InstructionMap');
const util = require('util');

class Log {
	static getStringFromByte = byte => {
		return '0x' + byte.toString(16).toUpperCase().padStart(2, '0');
	};

	static getStringFrom16Bits = bits => {
		return '0x' + bits.toString(16).toUpperCase().padStart(4, '0');
	};

	static getInstructionFromByte = byte => {
		const byteString = this.getStringFromByte(byte);
		return instructionMap[byteString];
	};

	static deepLog = obj => {
		console.log(
			util.inspect(obj, {
				colors: true,
				depth: null,
				showHidden: true,
			})
		);
	};
}

module.exports = Log;
