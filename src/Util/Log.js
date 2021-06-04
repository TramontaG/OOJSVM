const instructionMap = require('../Hardware/Processor/InstructionMap');
const util = require('util');
const colorLog = require('./ColorLogs');

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

	static debugMemory(memory, address) {
		let header = `|`;
		let debugString = '| ';
		for (let i = address; i < address + 16; i++) {
			header += ` ${this.getStringFromByte(i)} |`;
			debugString += `${this.getStringFromByte(memory.getWordValue(i))} | `;
		}
		colorLog('\nDEBUGGING MEMORY AROUND ' + Log.getStringFrom16Bits(address), 'blue');
		colorLog(header, 'cyan');
		colorLog(debugString + '\n', 'magenta');
	}

	static debugRegisters(cpu) {
		const header = () => `|  R1  |  R2  |  R3  |  R4  |  R5  |  R6  |  R7  |  R8  |`;

		let registerLog = '|';

		const logRegister = register => {
			return `${Log.getStringFrom16Bits(register.getValue())}|`;
		};

		header()
			.split('|')
			.map(register => register.trim())
			.map(register => {
				if (cpu[register]) registerLog += logRegister(cpu[register]);
			});

		registerLog += logRegister(cpu.accumulator);
		registerLog += logRegister(cpu.programCounter);
		colorLog(header() + '  ACC |  PC  |', 'cyan');
		colorLog(registerLog, 'magenta');
	}
}

module.exports = Log;
