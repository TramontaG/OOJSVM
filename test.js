const test  = [
    ["a", 'b', 'c'],
    ["a", 'b', 'c'],
    ["a", 'b', 'c'],
    ["a", 'b', 'c'],
    ["a", 'b', 'c'],
]

const process = arr => {
    return arr.map(e => {
        return ((e) => e)(e);
    })
}

console.log(...process(test));