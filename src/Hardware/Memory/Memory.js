const Word = require("./Word");

class Memory {
    constructor(addressSpace, wordSize){
        this.bytes = Array.from(new Array (addressSpace))
            .map(() => new Word(wordSize));
    }

    getWordValue = address => {
        return this.bytes[address].getValue();
    }

    setWordValue = (address, value) => {
        this.bytes[address].setValue(value);
    }
}

module.exports = Memory;