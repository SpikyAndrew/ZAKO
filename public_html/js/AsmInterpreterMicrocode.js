/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */
	
function MipsState(interpreter) {
	var self = this;
	self.interpreter = interpreter;

	self.update = function () {
		self.registerList = self.interpreter.registerList.exportValues();
		self.architectureRegisters = self.interpreter.architectureRegisters.exportValues();
	};
	this.update();
}


function AsmInterpreter(registerList, architectureRegisters, jumpTable, microcode, memoryMx, microcodeOptions) {
	var self = this;

	this.registerList = registerList;
	this.instructionsToExec = [];
	this.architectureRegisters = architectureRegisters;
	this.jumpTable = jumpTable;
	this.labels = {};
	this.currentInstr = 0;
	this.memoryMatrix = memoryMx;
	this.microcode = microcode;
	this.uAddrReg = this.getRegisterForMc('uAR');
	this.IR = this.getRegisterForMc('IR');
	this.Creg = this.getRegisterForMc('C');
	this.microcodeOptions = microcodeOptions;

	this.savedState = new MipsState(this);
	this.currentMcRow = ko.computed(function () {
		try {
			return self.microcode.getRow(self.uAddrReg.getValue());
		} catch (e) {
		}
		return null;
	});


}

function parseWord(dword) {
	var f = dword & 0x0000ffff;
	if (f & 0x8000) {
		return f | 0xffff0000;
	}
	return f;
}
function parseHalf(dword) {
	return dword & 0x0000ffff;
}

function parseByte(dword) {
	return dword & 0x000000ff;
}

function parseVal(dword, part) {
	switch (part) {
		case 'Byte':
			return parseByte(dword);
		case 'Half':
			return parseHalf(dword);
		case 'Word':
			return parseWord(dword);
		default:
			return parseWord(dword);
	}
}


var _startInstructionNumber = 0;

AsmInterpreter.prototype = {
	constructor: AsmInterpreter,
	/**
	 * Register with number of current microcode row to interpret
	 * @type RegisterAdapter
	 */
	uAddrReg: null,
	/**
	 * Instruction Register
	 * @type RegisterAdapter
	 */
	IR: null,
	/**
	 * 
	 * @type MemoryMatrix
	 */
	Creg: null,
	/**
	 * 
	 * @type MemoryMatrix
	 */
	memoryMatrix: null,
	/**
	 * 
	 * @type MicrocodeTable
	 */
	microcode: null,
	beginCodeExecution: function () {
		this.currentInstr = 0;
//        this.getRegisterForMc('IR').setValue(this.memoryMatrix.getValue(_startInstructionNumber));
		this.getRegisterForMc('PC').setValue(_startInstructionNumber);
		this.uAddrReg.setValue(0);
	},

	// no access from asm to internal architecture registers
	isRegister: function (name) {
		return this.registerList.isRegister(name); //|| this.architectureRegisters.isRegister(name);
	},
	/**
	 * 
	 * @param {String} name
	 * @returns {Boolean}
	 */
	isRegisterForMc: function (name) {
		return this.registerList.isRegister(name) || this.architectureRegisters.isRegister(name);
	},
	// executed when JumpX was selected
	interpretCurrentInstruction: function () {
		var instructionCode = (0xff000000 & this.savedState.architectureRegisters.IR) >> 24;
		console.log(instructionCode);
		var jumpTableRow = this.jumpTable.getMcLabelForInstructionCode(instructionCode);
		console.log(jumpTableRow.uCodeLabel());
		console.log(jumpTableRow.mnemonic());
		if (jumpTableRow.uCodeLabel() && jumpTableRow.uCodeLabel().length > 0) {
			var labelAddr = this.microcode.getLabelAddr(jumpTableRow.uCodeLabel());
			if (labelAddr === -1) {
				throw new Error('Nie można odnaleźć etykiety mikrokodu: ' + jumpTableRow.uCodeLabel());
			} else {
				this.uAddrReg.setValue(labelAddr);
			}
		} else {
			throw new Error('Brak przypisania etykiety dla instrukcji ' + this.jumpTable.jumpTable()[instructionCode].mnemonic());
		}
	},
	interpretCurrentMicroinstruction: function () {

		// Save registers into savedState (that will contain bare values) to read,
		// We will be write to actual registers of AsmInterpreter
		this.savedState.update();
//        console.log(this.savedState);
		var row = this.currentMcRow();
//        console.log(row.export());
		this.execAluPart(row);
		this.execJmpPart(row);
		this.execMemPart(row);
		this.execRegPart(row);
	},
	/**
	 * 
	 * @param {MicrocodeRow} microcodeRow
	 * @returns {undefined}
	 */
	execRegPart: function (microcodeRow) {
		var regInstr = microcodeRow.Regs();
		if (regInstr)
		{
			var func = this.microcodeOptions.regsOpts[regInstr];
			if (func) {
				func.apply(this);
			} else {
				throw new Error("Nieprawidłowa opcja dla rejestrów: " + regInstr);
			}
		}
	},
	/**
	 * 
	 * @param {MicrocodeRow} microcodeRow
	 * @returns {undefined}
	 */
	execMemPart: function (microcodeRow) {
		var memInstr = microcodeRow.Mem();
		if (memInstr && memInstr.length > 0)
		{
			var addrRegName = microcodeRow.MAdr() || 'MAR';
			var addr = this.savedState.architectureRegisters[addrRegName];
			var destName = microcodeRow.MDest() || 'MDR';
			var reg = this.getRegisterForMc(destName);
			var func = this.microcodeOptions.memOpts[memInstr];
			if (func) {
//                func.apply(this, [addr, reg, this.savedState.architectureRegisters[destName]]);
				func.apply(this, [addr, reg, this.savedState.architectureRegisters['MDR']]);
			} else {
				throw new Error("Instrukcja działania na pamięci: " + memInstr + " jest nieprawidłowa");
			}
		}

	},
	/**
	 * 
	 * @param {MicrocodeRow} microcodeRow
	 * @returns {undefined}
	 */
	execJmpPart: function (microcodeRow) {

//        console.log("execJmpPart");
		if (microcodeRow.JCond() && microcodeRow.JCond().length >= 0) {
			var cond = microcodeRow.JCond();
			var func = this.microcodeOptions.JCond[cond];
//			var result = func.apply(this, [this.architectureRegisters.getRegisterValue('C')]);
			var val = this.savedState.architectureRegisters.A;
			var result = func.apply(this, [val]);
			if (result===true) {
				var label = microcodeRow.Adr();
				if (label && label.length > 0) {
					this.uAddrReg.setValue(this.microcode.getLabelAddr(label));
				}
			} else if(result===false) {
				this.uAddrReg.setValue(this.savedState.architectureRegisters.uAR + 1);
			}
			return;
		} else {
			this.uAddrReg.setValue(this.savedState.architectureRegisters.uAR + 1);
		}

	},
	/**
	 * 
	 * @param {MicrocodeRow} microcodeRow
	 * @returns {undefined}
	 */
	execAluPart: function (microcodeRow) {
		if (microcodeRow.ALU() && microcodeRow.ALU().length > 0) {
			if (microcodeRow.Dest() && microcodeRow.Dest().length > 0) {
				var args = this.getAluArgsValues(microcodeRow);
				console.log(args);
				if(microcodeRow.BShifter==='Apply')
				{
			// TODO		args[1] = 
				}
				var result = this.microcodeOptions.aluOperations[microcodeRow.ALU()].apply(this, args);
				this.architectureRegisters.setRegisterValue(microcodeRow.Dest(), result);
			} else {
				console.warn('No destination found for ALU operation ' + microcodeRow.ALU() + ' at uAR: ' + this.savedState.architectureRegisters.uAR);
			}
		} else {
			console.log('ALU is empty at uAR:' + this.savedState.architectureRegisters.uAR);
		}
	},
	/**
	 * 
	 * @param {MicrocodeRow} microcodeRow
	 * @returns {Array}
	 */
	getAluArgsValues: function (microcodeRow) {
		var self = this;
		var arr = [microcodeRow.S1(), microcodeRow.S2()];
		console.log(arr);
		return arr.map(function (element) {
			if (element === undefined || element === null || element.length === 0) {
				return 0;
			} else if (element === 'IR') {
				var mask = 0xffffffff;
				switch (microcodeRow.ExtIR()) {
					case 'Byte':
						mask = 0x000000ff;
						break;
					case 'Half':
						mask = 0x0000ffff;
						break;
					case 'Word':
						return parseWord(self.savedState.architectureRegisters.IR);
						break;
				}
				return (self.savedState.architectureRegisters.IR & mask) | ((self.savedState.architectureRegisters.IR & ((mask + 1) >> 1)) > 0 ? ~mask : 0);
			} else if (element === 'Const') {
				return parseInt(microcodeRow.Const());
			} else {
				return self.savedState.architectureRegisters[element];
			}
		});
	},
	/**
	 * GetRegister for microcode usage
	 * @param {String} regName
	 * @returns {RegisterAdapter} 
	 */
	getRegisterForMc: function (regName) {
		return this.registerList.isRegister(regName) ? this.registerList.getRegister(regName) : this.architectureRegisters.getRegister(regName);
	},
	// no access from asm to internal architecture registers
	getRegister: function (regName) {
		return this.registerList.getRegister(regName);
	},
	setInstructionsToExec: function (instructions) {
		this.instructionsToExec = [];
		this.labels = {};
		for (var i = 0; i < instructions.length; i++) {
			var instr = instructions[i].split(';')[0].trim();
			var parts = instr.split(':');
			parts[0] = parts[0].trim();
			if (parts.length === 2) {
				parts[1] = parts[1].trim();
			}
			console.log(parts);
			if (parts.length === 1) {
				this.instructionsToExec.push(parts[0]);
			} else {
				this.instructionsToExec.push(parts[1]);
				this.labels[parts[0]] = i;
			}
		}
		this.currentInstr = 0;
		this.encodeInstructionsToMemory();
	},
	encodeInstructionsToMemory: function () {
		try {
			for (var i = 0; i < this.instructionsToExec.length; i++) {
				var instructionCode = this.encodeInstruction(this.instructionsToExec[i], i);
				this.memoryMatrix.setValue(i, instructionCode);
			}
		} catch (e) {
			console.log(e);
			alert('Błąd: ');
		}
	},
	/**
	 * 
	 * @param {String} instruction
	 * @param {Number} instructionNumber number of instruction (address in the memory where the instruction will be stored)
	 * @returns {Number} encoded instruction into 32-bit dword
	 */
	encodeInstruction: function (instruction, instructionNumber) {
		var spaceEl = instruction.indexOf(' ');// Znajdujemy pierwszą spację, po niej będą parametry
		var mnemonic = instruction.slice(0, spaceEl);
		var mnemonicNumber = this.jumpTable.getNumberOf(mnemonic); // [0-255]
		if (mnemonicNumber !== null) {
//            console.log(mnemonic);
			var args = instruction.slice(spaceEl + 1).split(',').map(function (el) {
				return el.trim();
			});
			// w args jest tablica typu: ['R1','152','R3']
			// args może zawierać też etykiety 

			var regs = [];
			var imms = [];
			var shifts = [];
			var conditionals = [];
			for (var i = 0; i < args.length; i++) {
				if (this.isRegister(args[i])) {
					regs.push(this.registerList.getRegisterNumber(args[i]));
				} else if (isShifterArg(args[i])){
					shifts.push(args[i]);
				} else if (isConditional(args[i])){
					shifts.push(args[i]);
				}
				else {
					var number = parseInt(args[i]);
					if (!isNaN(number)) {
						imms.push(number);

						// sprawdzamy czy nie jest to label
					} else if (this.labels[args[i]] !== undefined) {
//                        imms.push(this.labels[args[i]]); // bezpośredni adres do jakiej instrukcji skoczyć
						imms.push((this.labels[args[i]] - instructionNumber-1) * 4); // POŚREDNI adres do jakiej instrukcji skoczyć
					} else {
						throw new Error('Nieprawidłowy argument "' + args[i] + '" w linii: ' + instruction);
					}
				}
			}

			if (imms.length > 1) {
				throw new Error('Więcej niż jedna liczba podana wprost');
			}

			if (regs.length === 0) {
				if (imms.length === 1) 
					{
						if (shifts.length > 0){
							throw new Error('Użyto przesunięcia bitowego w poleceniu ze zmienną bezpośrednią')
						}
						// cond4|Opcode8|Imm20|
						return (encodeConditional(conditionals[0]) << 28 | mnemonicNumber << 20) | (imms[0] & 0x00ffffff); // 20 bitów na liczbę
					} 
				else if (regs.length === 0 && imms.length === 0) {
					return (encodeConditional(conditionals[0]) << 28 | mnemonicNumber << 20); // tylko kod rozkazu na najstarszym miejscu
				}
			} else if (regs.length <= 2) {

				if (imms[0] !== undefined && imms[0] > 0x0000ffff) {
					throw new Error('Liczba ' + imms[0] + ' w instrukcji ' + instruction + ' jest zbyt duża. Musi mieścić się na 16 bitach');
				}

				return (mnemonicNumber << 24)
						| ((regs[0] << 20) | (regs[1] !== undefined ? regs[1] << 16 : 0)) // dwa rejestry
						| (imms[0] !== undefined ? imms[0] & 0x0000ffff : 0); // immediete na 16 bitach
			} else { // liczba rejestrów >2
				var ret = (mnemonicNumber << 24);
				for (var i = 0; i < regs.length; i++) {
					ret |= regs[i] << 20 - i * 4;
				}
				return ret;
			}
		} else {
			throw new Error('Niezadeklarowany mnemonik rozkazu: ' + mnemonic + ' w linii: ' + instruction);
		}
	},
	reset: function () {
		this.resetRegisters();

	},
	resetRegisters: function () {
		this.registerList.reset();
		this.architectureRegisters.reset();
	}
};


