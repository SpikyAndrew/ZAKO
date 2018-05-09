/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */


function MipsState(registerList) {
    this.registerList = registerList; // TODO: kopiowanie listy rejestrów

}



function AsmInterpreter(instructions, registerList, memoryMx) {
    this.instructionsMap = instructions;
    this.registerList = registerList;
    this.instructionsToExec = [];
    this.labels = {};
    this.currentInstr = 0;
    this.memoryMatrix = memoryMx;
}

AsmInterpreter.prototype = {
    constructor: AsmInterpreter,
    interpret: function(instruction) {
        //        console.log(instruction);
        instruction = instruction.trim();
        var spaceEl = instruction.indexOf(' ');
        var mnemonic = instruction.slice(0, spaceEl);

        if (this.instructionsMap[mnemonic] !== null) {
            //            console.log(mnemonic);
            var args = instruction.slice(spaceEl + 1).split(',').map(function(el) {
                return el.trim();
            });
            this.instructionsMap[mnemonic].apply(this, args);
            return true;
        } else {
            return false;
        }
    },
    isRegister: function(name) {
        return this.registerList.isRegister(name);
    },
    interpretCurrentInstruction: function() {
        if (this.currentInstr >= this.instructionsToExec) {
            console.log('Koniec instrukcji');
        } else {
            this.interpret(this.instructionsToExec[this.currentInstr++]);
        }
        return this.currentInstr;
    },
    getRegister: function(regName) {
        return this.registerList.getRegister(regName);
    },
    setInstructionsToExec: function(instructions) {
        this.instructionsToExec = [];
        this.labels = [];
        for (var i = 0; i < instructions.length; i++) {
            var instr = instructions[i].split(';')[0].trim();
            var parts = instr.split(':');
            parts[0] = parts[0].trim();
            if (parts.length === 2) {
                parts[1] = parts[1].trim();
            }
            console.log(parts);
            if (parts.length === 1) {
                this.instructionsToExec.push(parts[0].trim());
            } else {
                this.instructionsToExec.push(parts[1].trim());
                this.labels[parts[0].trim()] = i;
            }
        }
        this.currentInstr = 0;
    },
    reset: function() {
        this.resetRegisters();

    },
    resetRegisters: function() {
        this.registerList.reset(0);
    }
};
