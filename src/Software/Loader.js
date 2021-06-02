const loadToMemory = (memory, machineCode) => {
	let address = 0x00;

	machineCode.forEach(byte => {
		memory.setWordValue(address, byte);
		address++;
	});
};

module.exports = loadToMemory;
