/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */


/* global microcodeOptions */


function ProcsimVM(updateAsmExecLineCb, updateUAdrLine, $textarea) {
	var self = this;

	self.$textarea = $textarea;

	self.registerList = new RegistersList(10);
	self.additionalRegistersNames = ['TEMP1', 'TEMP2', 'CPSR'];
	self.architectureRegisters = new ArchitectureRegisters(self.additionalRegistersNames);
	self.microcode = new MicrocodeTable(true);
	self.microcodeOpts = microcodeOptions;
	self.jumpTable = new JumpTable();

	self.multipleCycles = ko.observable(1);
	self.breakpoint = ko.observable(100);
	self.allCycles = ko.observable(0);

	if (localStorage.jumpTable !== undefined) {
		self.jumpTable.loadFromExport(JSON.parse(localStorage.jumpTable));
	}

	self.save = function () {
		localStorage.architectureRegs = JSON.stringify(self.architectureRegisters.exportValues());
		localStorage.registerList = JSON.stringify(self.registerList.exportValues());
		self.microcode.saveToStorage();
		localStorage.jumpTable = JSON.stringify(self.jumpTable.export());
	};

	self.jtAddRow = function () {
		self.jumpTable.addRow();
	};

	self.execLine = ko.computed(function () {
		var pc = self.architectureRegisters.getRegister('PC').register();
		updateAsmExecLineCb(pc);
		return pc;
	});
	self.execUCodeLine = ko.computed(function () {
		var uAR = self.architectureRegisters.getRegister('uAR').register();
		updateUAdrLine(uAR);
		return uAR;
	});

	self.architectureRegisters.additionalRegisters.subscribe(function () {
		connectAll();
	});

	self.mcAddRow = function () {
		self.microcode.addRow();
	};

	self.memoryMx = $('#tab-memory table').memoryMatrix(1024, 8, localStorage.ramMem ? JSON.parse(localStorage.ramMem) : null);


	self.interpreter = new AsmInterpreter(
			self.registerList,
			self.architectureRegisters,
			self.jumpTable,
			self.microcode,
			self.memoryMx,
			self.microcodeOpts
			);

	self.saveToFile = function () {
		var exportData = {
			asmText: self.$textarea.val(),
			ram: self.memoryMx.export(),
			architectureRegs: self.architectureRegisters.exportValues(),
			registers: self.registerList.exportValues(),
			microcode: self.microcode.export(),
			jumpTable: self.jumpTable.export()
		};

		var blob = new Blob([JSON.stringify(exportData)], {type: "application/json;charset=utf-8"});
		saveAs(blob, "projekt.mpr");
	};

	self.loadFromFile = function (json) {
		self.$textarea.val(json.asmText);
		self.architectureRegisters.loadFromExported(json.architectureRegs);
		self.registerList.loadFromExported(json.registers);

		self.memoryMx.loadFromJson(json.ram);
		self.microcode.loadFromExport(json.microcode);
		self.jumpTable.loadFromExport(json.jumpTable);
	};

	self.handleFileSelect = function (data, event, form) {
		console.log(data);
		console.log(this);
		console.log("####################################3");
		var files = event.target.files;
		if (files.length > 0) {

			var file = files[0];
			var reader = new FileReader();
			reader.onload = function (e) {
				self.loadFromFile(JSON.parse(e.target.result));
			};
			reader.readAsBinaryString(file);
			console.log(form);
			$(form).trigger('reset');
		}
	};

}
