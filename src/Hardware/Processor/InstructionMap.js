const instructionMap = {
	'0x00': 'noOp',
	'0x10': 'moveImmediateToRegister',
	'0x11': 'moveRegisterToRegister',
	'0x12': 'moveImmediateToAddress',
	'0x13': 'moveRegisterToAddress',
	'0x14': 'moveAddressToRegister',

	'0x40': 'jumpImmediate',
	'0x41': 'jumpRegister',

	'0x42': 'jumpNotEqualImmediateRegister',
	'0x43': 'jumpNotEqualRegisterRegister',
	'0x44': 'jumpNotEqualImmediateAddress',
	'0x45': 'jumpNotEqualIRegisterRegister',
	'0x46': 'jumpNotEqualRegisterImmediate',

	'0x47': 'jumpEqualImmediateRegister',
	'0x48': 'jumpEqualRegisterRegister',
	'0x49': 'jumpEqualImmediateAddress',
	'0x4A': 'jumpEqualIRegisterRegister',
	'0x4B': 'jumpEqualRegisterImmediate',

	'0x4C': 'JumpSubRoutineImmediate',
	'0x4D': 'JumpSubRoutineRegister',
	'0x4E': 'JumpSubRoutineAddress',

	'0x4F': 'Return',

	'0x50': 'andRegisterRegister',
	'0x51': 'andImmediateRegister',
	'0x52': 'andRegisterImmediate',
	'0x53': 'andMemoryRegister',
	'0x54': 'andRegisterMemory',

	'0x55': 'orRegisterRegister',
	'0x56': 'orImmediateRegister',
	'0x57': 'orRegisterImmediate',
	'0x58': 'orMemoryRegister',
	'0x59': 'orRegisterMemory',

	'0x5a': 'xorRegisterRegister',
	'0x5b': 'xorImmediateRegister',
	'0x5c': 'xorRegisterImmediate',
	'0x5d': 'xorMemoryRegister',
	'0x5e': 'xorRegisterMemory',

	'0xA0': 'addRegisterRegister',
	'0xA1': 'addImmediateRegister',
	'0xA2': 'addRegisterImmediate',
	'0xA3': 'addMemoryRegister',
	'0xA4': 'addRegisterMemory',

	'0xA5': 'subRegisterRegister',
	'0xA6': 'subImmediateRegister',
	'0xA7': 'subRegisterImmediate',
	'0xA8': 'subMemoryRegister',
	'0xA9': 'subRegisterMemory',

	'0xAA': 'rotateRegisterRight',
	'0xAB': 'rotateRegisterLeft',
	'0xAC': 'incrementRegister',
	'0xAD': 'decrementRegister',
	'0xAE': 'clearFlags',
	'0xAF': 'setFlagsRegister',

	'0xB0': 'compareRegisterRegister',
	'0xB1': 'compareImmediateRegister',
	'0xB2': 'compareRegisterImmediate',
	'0xB3': 'compareMemoryRegister',
	'0xB4': 'compareRegisterMemory',

	'0xC0': 'pushRegister',
	'0xC1': 'pushImmediate',
	'0xC2': 'pushAddress',

	'0xC4': 'popRegister',
	'0xC5': 'popAddress',

	'0XFF': 'halt',
};

module.exports = instructionMap;
