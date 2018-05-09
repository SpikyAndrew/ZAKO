/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */
"use strict";

var _defaultJumpTableSize = 10;



// MicrocodeRow exported properties
var _jumpTableRowProperties = ['mnemonic', 'uCodeLabel'];

function JumpTableRow(mnemonic, uCodeLabel) {
    var self = this;
    self.mnemonic = ko.observable(mnemonic);
    self.uCodeLabel = ko.observable(uCodeLabel);


    self.export = function () {
        var ret = {};
        for (var i = 0; i < _jumpTableRowProperties.length; i++) {
            var property = _jumpTableRowProperties[i];
            ret[property] = this[property]();
        }
        return ret;
    };

    self.loadFromExport = function (dataObj) {
        for (var i = 0; i < _jumpTableRowProperties.length; i++) {
            var property = _jumpTableRowProperties[i];
            this[property](dataObj[property]);
        }
    };

    self.remove = function (data, array) {
        console.log(data);
        console.log(array);
        if (confirm('Na pewno chcesz usunąć ten wiersz?')) {
            array.remove(data);
        }
    };
}



/**
 * Creates jump table object
 * @returns {JumpTable}
 */
function JumpTable() {
    this.jumpTable = ko.observableArray(
            Array.apply(null, {length: _defaultJumpTableSize}).map(
            function (val, i) {
                return new JumpTableRow();
            }
    ));
}

JumpTable.prototype = {
    constructor: JumpTable,
    addRow: function () {
        this.jumpTable.push(new JumpTableRow());
    },
    getNumberOf: function (mnemonic) {
        var _jumpTable = this.jumpTable();
        for (var i = 0; i < _jumpTable.length; i++) {
            if (_jumpTable[i].mnemonic() === mnemonic) {
                return i;
            }
        }
        return -1;
    },
    getMcLabel: function (mnemonic) {
        var jumpTable = this.jumpTable();
        for (var i = 0; i < jumpTable.length; i++) {
            if (jumpTable[i].mnemonic() === mnemonic) {
                return jumpTable[i].uCodeLabel();
            }
        }
        return null;
    },
    /**
     * 
     * @param {Number} instructionCode
     * @returns {JumpTableRow}
     */
    getMcLabelForInstructionCode: function (instructionCode) {
        console.log(this.jumpTable().length);
        console.log(instructionCode);
        if (this.jumpTable().length > instructionCode) {
            return this.jumpTable()[instructionCode];
        } else {
            throw new Error('Instrukcja ' + instructionCode + ' jest poza zakresem jumpTable!');
        }
    },
    loadFromExport: function (json) {
        var i = 0;
        for (; i < json.length; i++) {
            if (i < this.jumpTable().length) {
                var row = this.jumpTable()[i];
                row.mnemonic(json[i].mnemonic);
                row.uCodeLabel(json[i].uCodeLabel);
            } else {
                this.jumpTable.push(new JumpTableRow(json[i].mnemonic, json[i].uCodeLabel));
            }
        }
        while (i < this.jumpTable().length) {
            this.jumpTable.pop();
        }
    },
    export: function () {
        return this.jumpTable().map(function (element) {
            return element.export();
        });
    }
};






