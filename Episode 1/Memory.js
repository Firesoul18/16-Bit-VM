const createMemory = (size) => {
    var memoryBuffer = new ArrayBuffer(size);
    var dv = new DataView(memoryBuffer);
    return dv;
}

module.exports = createMemory;