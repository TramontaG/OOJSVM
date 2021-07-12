const Memory = require('./src/Hardware/Memory/Memory');

const attachedDevices = [
	{
		device: new Memory(0xff, 8),
		range: [0x00, 0xff],
	},
	{
		device: new Memory(0xff, 8),
		range: [0xff00, 0xffff],
	},
];

const setWord = (address, value, trying) => {
	const isBetween = (value, low, high) => {
		return value >= low && value <= high;
	};

	attachedDevices.forEach(item => {
		const [begin, end] = item.range;
		if (isBetween(address, begin, end)) {
			const relativeAddress = address - begin;
			console.log(
				`Adding value ${value} to address ${address} which translates to ${relativeAddress} on ${trying}`
			);
		}
	});
};

setWord(0x01, 0xff, 'lowMemory');
setWord(0xfff2, 0xff, 'highMemory');

//console.log(attachedDevices[0].device.getWordValue(0x01));
//console.log(attachedDevices[1].device.getWordValue(0xffff));
