class Word {
    constructor(size){
        this.wordSize = size
        this._value = 0
    }

    getValue = () => {
        return this._value;
    }

    setValue = value => {
        this._value = value & 2**this.wordSize -1;
    }

}

module.exports = Word;