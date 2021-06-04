const { instructionMap } = require('./../../Software/Parser/Compiler/meta');

getInstruction = opCode => {
	for (instruction in instructionMap) {
		for (variant in instructionMap[instruction]) {
			if (instructionMap[instruction][variant].opCode == opCode) {
				return `_${instruction}_${variant}`;
			}
		}
	}
};

module.exports = { getInstruction };
