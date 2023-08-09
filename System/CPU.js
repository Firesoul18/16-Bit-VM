const instructionsSet = require("./Instructions");
const createMemory = require("./Memory");

class CPU {
    constructor(memory) {
        this.memory = memory;
        // this.instructionsSet = appData.instruction;
        this.registerNames = [
            "ip",
            "acc",
            "r1",
            "r2",
            "r3",
            "r4",
            "r5",
            "r6",
            "r7",
            "r8",
        ];

        this.registerMemory = createMemory(this.registerNames.length * 2);
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
    }

    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error("Get Register: Register `name` not found");
        }
        return this.registerMemory.getUint16(this.registerMap[name]);
    }

    setRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error("Set Register: Register `name` not found");
        }
        return this.registerMemory.setUint16(this.registerMap[name], value);
    }

    fetch() {
        const nextInstructionAddress = this.getRegister("ip");
        const _8BitInstructionValue = this.memory.getUint8(nextInstructionAddress);
        this.setRegister("ip", nextInstructionAddress + 1);
        return _8BitInstructionValue;
    }

    fetch16() {
        const nextInstructionAddress = this.getRegister("ip");
        const _16BitInstructionValue = this.memory.getUint16(
            nextInstructionAddress
        );
        this.setRegister("ip", nextInstructionAddress + 2);
        return _16BitInstructionValue;
    }

    execute(instruction) {
        // console.log(instruction);
        switch (instruction) {
            //Move Next 16 bits to a register
            case instructionsSet.MOV_LIT_REG: {
                const value = this.fetch16();
                const register = (this.fetch()%this.registerNames.length)*2;
                console.log(value,register)
                this.registerMemory.setUint16(register,value)
                return;
            }

            //Move Literal from Memory to Register
            case instructionsSet.MOV_MEM_REG:{
                const memoryLocation = this.fetch();
                const m = this.memory.getUint16(memoryLocation);
                const register = (this.fetch()%this.registerNames.length)*2;
                this.setRegister(register,m)
                return;
            }

            //Move Literal from Register to Memory
            case instructionsSet.MOV_REG_MEM:{
                const register = (this.fetch()%this.registerNames.length)*2;
                const address = this.fetch16();
                const value = this.registerMemory.getUint16(register);
                this.memory.setUint16(address,value)
                return;
            }

            //Move Literal from one register to another
            case instructionsSet.MOV_REG_REG: {
                const registerFrom = (this.fetch() % this.registerNames.length) * 2;
                const registerTo = (this.fetch() % this.registerNames.length) * 2;
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                return;
              }

            //Add values of two Registers
            case instructionsSet.ADD_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();
                const registerValue1 = this.registerMemory.getUint16(r1 * 2);
                const registerValue2 = this.registerMemory.getUint16(r2 * 2);
                this.setRegister("acc", registerValue1 + registerValue2);
                return;
            }
        }
    }

    step(address) {
        const fetchedInstruction = this.fetch();
        this.execute(fetchedInstruction);
        // console.log(this.registerMap);
        this.registerNames.forEach((t) => {
            console.log(
                t + ": 0x" + this.getRegister(t).toString(16).padStart(4, "0")
            );
        });
        console.log();
        this.viewMemoryAt(address)
    }

    viewMemoryAt(address){
        console.log(this.memory.getUint16(address))
    }
}

module.exports = CPU;
