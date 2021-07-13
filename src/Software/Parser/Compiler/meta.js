const instructionMap = {
	NOP: {
		NoArgs: {
			opCode: 0x00,
			sizeInBytes: 1,
		},
	},

	MOV: {
		ImmediateRegister: {
			opCode: 0x10,
			sizeInBytes: 4,
		},
		RegisterRegister: {
			opCode: 0x11,
			sizeInBytes: 3,
		},
		ImmediateAddress: {
			opCode: 0x12,
			sizeInBytes: 5,
		},
		RegisterAddress: {
			opCode: 0x13,
			sizeInBytes: 4,
		},
		AddressRegister: {
			opCode: 0x14,
			sizeInBytes: 4,
		},
		Immediate8Address: {
			opCode: 0x15,
			sizeInBytes: 4,
		},
	},

	JMP: {
		Immediate: {
			opCode: 0x40,
			sizeInBytes: 3,
		},
		Register: {
			opCode: 0x41,
			sizeInBytes: 2,
		},
	},
	JNE: {
		ImmediateRegister: {
			opCode: 0x42,
			sizeInBytes: 4,
		},
		RegisterRegister: {
			opCode: 0x43,
			sizeInBytes: 3,
		},
		ImmediateAddress: {
			opCode: 0x44,
			sizeInBytes: 5,
		},
		RegisterAddress: {
			opCode: 0x45,
			sizeInBytes: 4,
		},
		ImmediateImmediate: {
			opCode: 0x46,
			sizeInBytes: 5,
		},
	},
	JPE: {
		ImmediateRegister: {
			opCode: 0x47,
			sizeInBytes: 4,
		},
		RegisterRegister: {
			opCode: 0x48,
			sizeInBytes: 3,
		},
		ImmediateAddress: {
			opCode: 0x49,
			sizeInBytes: 5,
		},
		RegisterAddress: {
			opCode: 0x4a,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0x4b,
			sizeInBytes: 4,
		},
	},
	JSR: {
		Immediate: {
			opCode: 0x4c,
			sizeInBytes: 3,
		},
		Register: {
			opCode: 0x4d,
			sizeInBytes: 2,
		},
		Address: {
			opCode: 0x4e,
			sizeInBytes: 3,
		},
	},
	RET: {
		NoArgs: {
			opCode: 0x4f,
			sizeInBytes: 1,
		},
	},
	AND: {
		RegisterRegister: {
			opCode: 0x50,
			sizeInBytes: 3,
		},
		ImmediateRegister: {
			opCode: 0x51,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0x52,
			sizeInBytes: 4,
		},
		MemoryRegister: {
			opCode: 0x53,
			sizeInBytes: 4,
		},
		RegisterMemory: {
			opCode: 0x54,
			sizeInBytes: 4,
		},
	},
	OR: {
		RegisterRegister: {
			opCode: 0x55,
			sizeInBytes: 3,
		},
		ImmediateRegister: {
			opCode: 0x56,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0x57,
			sizeInBytes: 4,
		},
		MemoryRegister: {
			opCode: 0x58,
			sizeInBytes: 4,
		},
		RegisterMemory: {
			opCode: 0x59,
			sizeInBytes: 4,
		},
	},
	XOR: {
		RegisterRegister: {
			opCode: 0x5a,
			sizeInBytes: 3,
		},
		ImmediateRegister: {
			opCode: 0x5b,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0x5c,
			sizeInBytes: 4,
		},
		MemoryRegister: {
			opCode: 0x5d,
			sizeInBytes: 4,
		},
		RegisterMemory: {
			opCode: 0x5e,
			sizeInBytes: 4,
		},
	},
	ADD: {
		RegisterRegister: {
			opCode: 0xa0,
			sizeInBytes: 3,
		},
		ImmediateRegister: {
			opCode: 0xa1,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0xa2,
			sizeInBytes: 4,
		},
		MemoryRegister: {
			opCode: 0xa3,
			sizeInBytes: 4,
		},
		RegisterMemory: {
			opCode: 0xa4,
			sizeInBytes: 4,
		},
	},
	SUB: {
		RegisterRegister: {
			opCode: 0xa5,
			sizeInBytes: 3,
		},
		ImmediateRegister: {
			opCode: 0xa6,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0xa7,
			sizeInBytes: 4,
		},
		MemoryRegister: {
			opCode: 0xa8,
			sizeInBytes: 4,
		},
		RegisterMemory: {
			opCode: 0xa9,
			sizeInBytes: 4,
		},
	},
	ROR: {
		RegisterImmediate: {
			opCode: 0xaa,
			sizeInBytes: 2,
		},
	},
	ROL: {
		RegisterImmediate: {
			opCode: 0xab,
			sizeInBytes: 2,
		},
	},
	INC: {
		Register: {
			opCode: 0xac,
			sizeInBytes: 2,
		},
	},
	DEC: {
		Register: {
			opCode: 0xad,
			sizeInBytes: 2,
		},
	},
	CLRF: {
		NoArgs: {
			opCode: 0xae,
			sizeInBytes: 1,
		},
	},
	STF: {
		Register: {
			opCode: 0xaf,
			sizeInBytes: 2,
		},
	},

	CMP: {
		RegisterRegister: {
			opCode: 0xb0,
			sizeInBytes: 3,
		},
		ImmediateRegister: {
			opCode: 0xb1,
			sizeInBytes: 4,
		},
		RegisterImmediate: {
			opCode: 0xb2,
			sizeInBytes: 4,
		},
		MemoryRegister: {
			opCode: 0xb3,
			sizeInBytes: 4,
		},
		RegisterMemory: {
			opCode: 0xb4,
			sizeInBytes: 4,
		},
	},

	PSH: {
		Register: {
			opCode: 0xc0,
			sizeInBytes: 2,
		},
		Immediate: {
			opCode: 0xc1,
			sizeInBytes: 3,
		},
		Address: {
			opCode: 0xc2,
			sizeInBytes: 3,
		},
	},
	POP: {
		Register: {
			opCode: 0xc4,
			sizeInBytes: 2,
		},
		Address: {
			opCode: 0xc5,
			sizeInBytes: 3,
		},
	},

	HLT: {
		NoArgs: {
			opCode: 0xff,
			sizeInBytes: 1,
		},
	},
};

const registerMap = {
	R1: 1,
	R2: 2,
	R3: 3,
	R4: 4,
	R5: 5,
	R6: 6,
	R7: 7,
	R8: 8,
	PC: 0xa0,
	ACC: 0xa1,
};

module.exports = {
	registerMap,
	instructionMap,
};
