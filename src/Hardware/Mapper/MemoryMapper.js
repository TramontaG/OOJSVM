const Memory = require('./../Memory/Memory');

class MemoryMapper extends Memory {
	constructor(addressSpace, wordSize) {
		super(addressSpace, wordSize);
		this.attachedDevices = [];
	}

	attachDevice = (range, device) => {
		const newDevice = {
			device: device,
			range: range,
		};
		this.attachedDevices.push(newDevice);
	};

	getRelativeAddressAndDevice = address => {
		let relativeAddress, device;
		this.attachedDevices.forEach(item => {
			const [begin, end] = item.range;
			if (this.isBetween(address, begin, end)) {
				relativeAddress = address - begin;
				device = item.device;
			}
		});
		return [relativeAddress, device];
	};

	setWordValue = (address, value) => {
		const [relativeAddress, device] = this.getRelativeAddressAndDevice(address);
		if (!device) throw `No device mapped to address ${address}`;
		device.setWordValue(relativeAddress, value);
	};

	getWordValue = address => {
		const [relativeAddress, device] = this.getRelativeAddressAndDevice(address);
		if (!device) throw `No device mapped to address ${address}`;
		return device.getWordValue(relativeAddress);
	};

	isBetween = (value, low, high) => value >= low && value <= high;
}

module.exports = MemoryMapper;
