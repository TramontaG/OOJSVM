const Register = require("./Register");

class ProgramCounter extends Register {
    constructor(wordSize){
        super(wordSize);
    }
}

module.exports = ProgramCounter;