const instructionMap = require('../Hardware/Processor/InstructionMap');
const util = require('util');
const colorLog = require('./ColorLogs');

class Log {
	static getStringFromByte = byte => {
		return '0x' + this.getHexByte(byte);
	};

	static getStringFrom16Bits = bits => {
		return '0x' + this.getHex16(bits);
	};

	static getHexByte = byte => {
		return byte.toString(16).toUpperCase().padStart(2, '0');
	};

	static getHex16 = bits => {
		return bits.toString(16).toUpperCase().padStart(4, '0');
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

	static debugMemory(title, memory, address) {
		let header = `|`;
		let debugString = '| ';
		for (let i = address; i < address + 16; i++) {
			header += `${this.getHex16(i)}|`;
			debugString += `${this.getHexByte(memory.getWordValue(i))} | `;
		}
		colorLog(`\n${title}`, 'blue');
		colorLog(header, 'cyan');
		colorLog(debugString, 'green');
	}

	static debugRegisters(cpu) {
		const header = () => `| R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |`;

		let registerLog = '|';

		const logRegister = register => {
			return `${Log.getHex16(register.getValue())}|`;
		};

		header()
			.split('|')
			.map(register => register.trim())
			.map(register => {
				if (cpu[register]) registerLog += logRegister(cpu[register]);
			});

		registerLog += logRegister(cpu.accumulator);
		registerLog += logRegister(cpu.programCounter);
		colorLog('\n' + header() + 'ACC | PC |', 'cyan');
		colorLog(registerLog, 'green');
	}
}

module.exports = Log;
