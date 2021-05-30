class Register {
    constructor(wordSize, name){
        this._wordSize = wordSize;
        this._value = 0;
        this._name = name || "";
    }

    getValue = () => {
        return this._value;
    }

    setValue = value => {
        this._value = value & 2**this._wordSize -1;
    }

    increment(){
        this.setValue(this.getValue() + 1);
    }

    decrement(){
        this.setValue(this.getValue() - 1);
    }
    _debugName(){
        return this._name;
    }
}

module.exports = Register;