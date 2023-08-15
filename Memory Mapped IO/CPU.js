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
            "sp",
            "fp"
        ];

        this.registerMemory = createMemory(this.registerNames.length * 2)
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});

        this.setRegister('sp', memory.byteLength - 1 - 1)
        this.setRegister('fp', memory.byteLength - 1 - 1)

        this.stackFrameSize = 0;
    }

    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`Get Register: Register '${name}' not found`);
        }
        return this.registerMemory.getUint16(this.registerMap[name]);
    }

    setRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error(`Set Register: Register '${name}' not found`);
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

    push(value) {
        const spAddress = this.getRegister('sp')
        this.memory.setUint16(spAddress, value)
        this.setRegister('sp', spAddress - 2)
        this.stackFrameSize += 2
    }

    pop() {
        const nextAddress = this.getRegister('sp') + 2;
        console.log(nextAddress.toString(16))
        const value = this.memory.getUint16(nextAddress)
        this.stackFrameSize -= 2;
        this.setRegister('sp', nextAddress);
        return value;
    }

    execute(instruction) {
        // console.log(instruction);
        switch (instruction) {
            //Move Next 16 bits to a register
            case instructionsSet.MOV_LIT_REG: {
                const value = this.fetch16();
                const register = (this.fetch() % this.registerNames.length) * 2;
                // console.log(value,register)
                this.registerMemory.setUint16(register, value)
                return;
            }

            //Move Literal from Memory to Register
            case instructionsSet.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = (this.fetch() % this.registerNames.length) * 2;
                const value = this.memory.getUint16(address);
                this.registerMemory.setUint16(registerTo, value);
                return;
            }

            //Move Literal from Register to Memory
            case instructionsSet.MOV_REG_MEM: {
                const register = (this.fetch() % this.registerNames.length) * 2;
                const address = this.fetch16();
                const value = this.registerMemory.getUint16(register);
                this.memory.setUint16(address, value)
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

            case instructionsSet.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16()
                if (value != this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }
                return;
            }

            case instructionsSet.PSH_LIT: {
                const value = this.fetch16()
                this.push(value)
                return;
            }

            case instructionsSet.PSH_REG: {
                const registerLocation = this.fetch();
                const registerIndex = (registerLocation % this.registerNames.length) * 2
                const value = this.registerMemory.getUint16(registerIndex)
                this.push(value)
                return;
            }

            case instructionsSet.POP: {
                const registerIndex = (this.fetch() % this.registerNames.length) * 2
                const value = this.pop();
                this.registerMemory.setUint16(registerIndex, value)
                return;
            }

            case instructionsSet.CAL_LIT: {
                const address = this.fetch16();
                this.push(this.getRegister('r1'));
                this.push(this.getRegister('r2'));
                this.push(this.getRegister('r3'));
                this.push(this.getRegister('r4'));
                this.push(this.getRegister('r5'));
                this.push(this.getRegister('r6'));
                this.push(this.getRegister('r7'));
                this.push(this.getRegister('r8'));
                this.push(this.getRegister('ip'));
                this.push(this.stackFrameSize + 2)
                this.setRegister('fp', this.getRegister('sp'));
                this.setRegister('ip', address);
                this.stackFrameSize = 0;

                return
            }

            case instructionsSet.CAL_REG: {
                const registerIndex = (this.fetch() % this.registerNames.length) * 2
                const address = this.registerMemory.getUint16(registerIndex);
                this.push(this.getRegister('r1'));
                this.push(this.getRegister('r2'));
                this.push(this.getRegister('r3'));
                this.push(this.getRegister('r4'));
                this.push(this.getRegister('r5'));
                this.push(this.getRegister('r6'));
                this.push(this.getRegister('r7'));
                this.push(this.getRegister('r8'));
                this.push(this.getRegister('ip'));
                this.setRegister('ip', address)
                this.push(this.stackFrameSize + 2)
                this.setRegister('fp', this.getRegister('sp'));
                this.stackFrameSize = 0;
                return
            }

            case instructionsSet.RET: {
                const framePointerAddress = this.getRegister('fp')
                //Safely start from where we need to start
                this.setRegister('sp', framePointerAddress);

                this.stackFrameSize = this.pop();
                const currentFrameSize = this.stackFrameSize;

                this.setRegister('ip', this.pop());
                this.setRegister('r8', this.pop());
                this.setRegister('r7', this.pop());
                this.setRegister('r6', this.pop());
                this.setRegister('r5', this.pop());
                this.setRegister('r4', this.pop());
                this.setRegister('r3', this.pop());
                this.setRegister('r2', this.pop());
                this.setRegister('r1', this.pop());
                this.setRegister('fp', framePointerAddress + currentFrameSize)

                this.registerNames.forEach((t) => {
                    console.log(
                        t + ": 0x" + this.getRegister(t).toString(16).padStart(4, "0")
                    );
                });
                console.log();

                let n = this.pop();
                while (n-- > 0) {
                    this.pop();
                }

                return;
            }

            case instructionsSet.HLT: {
                return true;
            }
        }
    }

    step(address = null, size = 1) {

        if (address != null) {
            this.viewMemoryAt(address, size)
        }

        const fetchedInstruction = this.fetch();
        return this.execute(fetchedInstruction);
    }

    viewMemoryAt(address, n = 8) {
        // 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F ...
        const nextNBytes = Array.from({ length: n }, (_, i) =>
            this.memory.getUint8(address + i)
        ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextNBytes.join(' ')}`);
    }

    run() {
        const st = this.step()
        if (!st) {
            setImmediate(() => this.run())
        }
    }
}

module.exports = CPU;
