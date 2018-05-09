/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */
"use strict";

var microcodeOptions = {
	aluOperations: {
		ADD: function (S1, S2) {
			return S1 + S2;
		},
		SUB: function (S1, S2) {
			return S1 - S2;
		},
		RSUB: function (S1, S2) {
			return S2 - S1;
		},
		AND: function (S1, S2) {
			return S1 & S2;
		},
		OR: function (S1, S2) {
			return S1 | S2;
		},
		XOR: function (S1, S2) {
			return S1 ^ S2;
		},
		MUL: function (S1, S2) {
			return S1 * S2;
		},
		S1: function (S1, S2) {
			return S1;
		},
		S2: function (S1, S2) {
			return S2;
		},
		S1S2: function (S1, S2) {
			return ((S1 & 0x0000ffff) << 16) | (S2 & 0x0000ffff);
		}

	},
	s1opts: ['A', 'Const', 'PC', 'MAR', 'MDR', 'IR'],
	s2opts: ['B', 'Const', 'PC', 'MAR', 'MDR', 'IR'],
	destOpts: ['C', 'PC', 'MAR', 'MDR'],
	extIrOpts: ['Byte', 'Half', 'Word'],
	JCond: {
		// ten obiekt zostanie wstrzyknięty do interpretera mikrokodu
		// w funkcjach pod this zostanie podstawiony AsmInterpreter
		True: function () {
			return true;
		},
		EQ: function (result) {
			return result === 0;
		},
		NE: function (result) {
			return result !== 0;
		},
		LT: function (result) {
			return result < 0;
		},
		LE: function (result) {
			return result <= 0;
		},
		GT: function (result) {
			return result > 0;
		},
		GE: function (result) {
			return result >= 0;
		},
		MBusy: function () {
			return false;    // TODO: Ogarnąć memory latency
		},
		Jump1: function () {
			this.interpretCurrentInstruction();
			return null;
		} //, Jump2,Jump3 etc;
	},
	memOpts: {
		/**
		 * 
		 * @param {Number} address
		 * @param {RegisterAdapter} destReg
		 * @param {Number} regValue value of register from last cycle
		 * @returns {undefined}
		 */
		RB: function (address, destReg, regValue) {
//            var mask = 0x000000ff << 8 * (address % 4);
//            var value = this.memoryMatrix.getValue(address / 4) & mask;
			var value = this.memoryMatrix.getByte(address);
			destReg.setValue((regValue & ~(0x000000ff)) | value);
			return value;
		},
		RH: function (address, destReg, regValue) {
//            var value = this.memoryMatrix.getValue(address) & 0x0000ffff;
//            destReg.setValue((regValue & 0xffff0000) | value);
//            return value;
//            if (address % 2 !== 0) {
//                throw new Error("RH address is not aligned");
//            }
//            var mask = 0x0000ffff << 16 * (address % 4);
//            var value = this.memoryMatrix.getValue(address / 4) & mask;
			var value = this.memoryMatrix.getWord(address);
			destReg.setValue((regValue & ~(0x0000ffff)) | value);
			return value;

		},
		RW: function (address, destReg, regValue) {
//            if (address % 4 !== 0) {
//                throw new Error("RW address is not aligned");
//            }
//            var value = this.memoryMatrix.getValue(address / 4);
			var value = this.memoryMatrix.getDword(address);
			destReg.setValue(value);
			return value;
		},
		WB: function (address, destReg, regValue) {
			this.memoryMatrix.setByte(address, regValue);
			var value = regValue & 0x000000ff;
//            var memValue = this.memoryMatrix.getValue(address);
//            var newValue = (memValue & 0xffffff00) | value;
//            this.memoryMatrix.setValue(address, newValue);
			return value;
		},
		WH: function (address, destReg, regValue) {
			this.memoryMatrix.setHalf(address, regValue);
			var value = regValue & 0x000ffff;
//            var memValue = this.memoryMatrix.getValue(address);
//            var newValue = (memValue & 0xffff0000) | value;
//            this.memoryMatrix.setValue(address, newValue);
			return value;
		},
		WW: function (address, destReg, regValue) {
//            this.memoryMatrix.setValue(address, regValue);
			this.memoryMatrix.setWord(address, regValue);
			return regValue;
		}
	},
	mAdrOpts: ['MAR', 'PC'],
	mDestOpts: ['MDR', 'IR'],
	regsOpts: {
		RR: function () {
			var regA = this.architectureRegisters.getRegister('A');
			var regB = this.architectureRegisters.getRegister('B');
			var IrValue = this.savedState.architectureRegisters.IR;
			var r1Nr = (IrValue & 0x00f00000) >> 20;
			var r2Nr = (IrValue & 0x000f0000) >> 16;
			regA.setValue(this.savedState.registerList[r1Nr]);
			regB.setValue(this.savedState.registerList[r2Nr]);
		},
		WF1: function () {
			var regCvalue = this.savedState.architectureRegisters.C;
			var IrValue = this.savedState.architectureRegisters.IR;
			var regNr = (IrValue & 0x00f00000) >> 20;
			console.log(this.savedState);
			console.log("Zapisuję wartość rejestru nr " + regNr + " na " + regCvalue);
			this.registerList.registers()[regNr](regCvalue);
		},
		WF2: function () {
			var regCvalue = this.savedState.architectureRegisters.C;
			var IrValue = this.savedState.architectureRegisters.IR;
			var regNr = (IrValue & 0x000f0000) >> 16;
			this.registerList.registers()[regNr](regCvalue);
		},
		WF3: function () {
			var regCvalue = this.savedState.architectureRegisters.C;
			var IrValue = this.savedState.architectureRegisters.IR;
			var regNr = (IrValue & 0x0000f000) >> 12;
			this.registerList.registers()[regNr](regCvalue);
		}
	}
};

// MicrocodeRow exported properties
var _microcodeRowProperties = ['label', 'ALU', 'S1', 'S2', 'Dest', 'ExtIR', 'Const', 'JCond', 'Adr', 'Mem', 'MAdr', 'MDest', 'Regs'];


function MicrocodeRow() {
	var self = this;
	self.label = ko.observable();
	self.ALU = ko.observable();
	self.S1 = ko.observable();
	self.S2 = ko.observable();
	self.Dest = ko.observable();
	self.ExtIR = ko.observable();
	self.Const = ko.observable();
	self.JCond = ko.observable();
	self.Adr = ko.observable();
	self.Mem = ko.observable();
	self.MAdr = ko.observable();
	self.MDest = ko.observable();
	self.Regs = ko.observable();

	self.export = function () {
		var ret = {};
		for (var i = 0; i < _microcodeRowProperties.length; i++) {
			var property = _microcodeRowProperties[i];
			ret[property] = this[property]();
		}
		console.log(ret);
		return ret;
	};

	self.loadFromExport = function (dataObj) {

		for (var i = 0; i < _microcodeRowProperties.length; i++) {
			var property = _microcodeRowProperties[i];
			if (dataObj[property]) {
				this[property](dataObj[property]);
			} else {
				this[property](null);
			}
		}
	};

}



var defaultMicrocodeSize = 50;

/**
 * 
 * @param {Boolean} loadFromStorage if content should be loaded from localStorage
 * @returns {MicrocodeTable}
 */
function MicrocodeTable(loadFromStorage) {
	var self = this;

	this.microcodeObsArr = ko.observableArray(
			Array.apply(null, {length: defaultMicrocodeSize}).map(
			function () {
				return new MicrocodeRow();
			}
	));

	/**
	 * Returns uAddr of row in microcode table
	 * @param {String} label label
	 * @returns {Number} >=0 when found or -1 otherwise
	 */
	this.getLabelAddr = function (label) {

		// TODO better performance
		var arr = this.microcodeObsArr();
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].label() === label) {
				return i;
			}
		}
		return -1;
	};

	/**
	 * 
	 * @param {Number} uAddr MicrocodeRow address
	 * @returns {MicrocodeRow} MicrocodeRow at uAddr in uCode table
	 */
	this.getRow = function (uAddr) {
		if (uAddr >= this.microcodeObsArr().length || uAddr < 0) {
			throw new Error("Invalid address of microinstruction!");
		} else {
			return this.microcodeObsArr()[uAddr];
		}
	};



	/**
	 * Loads data from localStorage
	 * @returns {Boolean} if loading was successful
	 */
	this.loadFromStorage = function () {
		if (localStorage.microcode !== undefined) {
			var json = JSON.parse(localStorage.microcode);
			this.loadFromExport(json);
			return true;
		}
		return false;
	};

	this.loadFromExport = function (json) {
		var microcodeArray = self.microcodeObsArr();
		var i = 0;
		for (; i < json.length; i++) {
			if (microcodeArray[i]) {
				microcodeArray[i].loadFromExport(json[i]);
			} else {
				var row = new MicrocodeRow(i);
				row.loadFromExport(json[i]);
				self.microcodeObsArr.push(row);
			}
		}
		while (i < self.microcodeObsArr().length) {
			self.microcodeObsArr.pop();
		}
	};

	this.saveToStorage = function () {
		localStorage.microcode = JSON.stringify(this.export());
	};

	this.export = function () {
		return this.microcodeObsArr()
				.map(function (element, i) {
					return element.export();
				});
	};

	this.removeRow = function (mcRow) {
		self.microcodeObsArr.remove(mcRow);
	};

	this.addRow = function () {
		self.microcodeObsArr.push(new MicrocodeRow());
	};


	if (loadFromStorage) {
		this.loadFromStorage();
	}

}

$.fn.extend({
	scrollableTableFixedHeader: function ()
	{
		var $table = $(this);
		var $ths = $('thead th', $table);
		var $elements = $($table).find('tbody tr th, tbody tr td');
		$ths.each(function (i) {
			$(this).css('width', $elements.eq(i).width() + 'px');
		});
	}

}
);
