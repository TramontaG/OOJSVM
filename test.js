const getFibNumber = pos => {
	if (pos === 1) {
		return 0;
	}
	if (pos === 2) {
		return 1;
	}
	return getFibNumber(pos - 1) + getFibNumber(pos - 2);
};

for (let i = 1; i <= 16; i++) {
	console.log(getFibNumber(i));
}
