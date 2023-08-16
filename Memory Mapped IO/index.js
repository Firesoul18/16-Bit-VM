const CPU = require("./CPU");
const createMemory = require("./Memory");
const instruction = require('./Instructions')
const MemoryMapper = require("./MemoryMapper");
const createNewDevice = require("./CreateNewDevice")

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const MM = new MemoryMapper()

const memory = createMemory(256*256);
MM.map(memory, 0, 0xffff);
MM.map(createNewDevice(),0x3000,0x30ff,true)

const writableBytes = new Uint8Array(memory.buffer)
let i=0;

const cpu = new CPU(MM)

function writeOnScreen(char,position){

console.log(char,char.charCodeAt(0))

writableBytes[i++] = instruction.MOV_LIT_REG
writableBytes[i++] = 0x00
writableBytes[i++] = char.charCodeAt(0)
writableBytes[i++] = R1

writableBytes[i++] = instruction.MOV_REG_MEM
writableBytes[i++] = R1
writableBytes[i++] = 0x30
writableBytes[i++] = position

}

"Hello World".split().forEach((char,index)=>{
    writeOnScreen(char,index)
})


writableBytes[i++] = instruction.HLT




cpu.run()