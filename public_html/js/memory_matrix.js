/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */
'use strict';



function MemoryMatrix(length, htmlElement) {
    this.htmlElement = htmlElement;
    this.memory = Array.apply(null, Array(length)).map(function () {
        return new ObservableVar(0);
    });
}


MemoryMatrix.prototype = {
    constructor: MemoryMatrix,
    getValue: function (address) {
		return this.getCell(address).getValue();
	},
	getCell: function (address) {
		if (address >= this.memory.length) {
			throw new Error("Memory: out of range - tried getting " + address + ' when memory has ' + this.memory.length + ' cells');
		}
		return this.memory[address];
	},
	getByte: function (address) {
		var data = this.getValue(address >> 2);
		var shift = address & 0x3; // 4 - address %4
		return (data & (0xff << (8 * shift))) >> (8 * shift);
	},
	getWord: function (address) {
		var data = this.getValue(address >> 2);
		var shift = address & 0x3; // 4 - address %4
		if (shift & 1) {
			throw new Error('Trying to get word from memory with unaligned address: ' + address);
		}
		return (data & (0xffff << (16 * shift))) >> (16 * shift);
	},
	getDword: function (address) {
		var shift = address & 0x3; // 4 - address %4
		if (shift !== 0) {
			throw new Error('Trying to get dword from memory with unaligned address: ' + address);
		}
		var data = this.getValue(Math.floor(address >> 2));
		return data;

	},
	setCell: function (cell, address) {
		this.memory[address] = cell;
		return this;
	},
	setValue: function (address, newValue) {
		return this.getCell(address).setValue(newValue);
	},
	setByte: function (address, newValue) {
		var cell = this.getCell(address >> 2);
		var val = cell.getValue();
		var shift = 8 * (address & 3);
		val = val & ~(0xff << shift) | ((newValue & 0xff) << shift);
		return cell.setValue(val);
	},
	setHalf: function (address, newValue) {
		var cell = this.getCell(address >> 2); // cells are addressed with direct nr of cell (not byte)
		var val = cell.getValue();
		if ((address & 1) !== 0) {
			throw new Error('Address ' + address + ' is not aligned well to set value ' + newValue);
		}
		var shift = 8 * (address & 3);
		val = val & ~(0xffff << shift) | ((newValue & 0xffff) << shift);
		return cell.setValue(val);
	},
	setWord: function (address, newValue) {
		var cell = this.getCell(address >> 2); // cells are addressed with direct nr of cell (not byte)
		if ((address & 3) !== 0) {
			throw new Error('Address ' + address + ' is not aligned well to set value ' + newValue);
		}
		return cell.setValue(newValue);
	},
    getLength: function () {
        return this.memory.length;
    },
    export: function () {
        return $.map(this.memory, function (element) {
            return element.getValue();
        });
    },
    loadFromJson: function (dataArr) {
        this.memory = Array.apply(null, Array(dataArr.length)).map(function () {
            return new ObservableVar(0);
        });
        console.log(this.memory);
        $(this.htmlElement).memoryMatrix(dataArr.length, 8, dataArr, this);
        return this;
    },
    setMultipleValues: function (beginAddr, endAddr, value) {
        for (var i = beginAddr; i <= endAddr && i < this.memory.length; i++) {
            this.memory[i].setValue(value);
        }
        return this;
    }

};


(function ($) {

    $.fn.extend({
        memoryMatrix: function (length, cols, data,memoryMatrix) {
            var len = 0;
            var memMatrix = memoryMatrix || new MemoryMatrix(length,$(this));
            var tableCells = [];
            var $table = $(this);
            var $tbody = $('tbody',$(this));
            $tbody.find('tr').remove();
            while (len < length) {
                var $tr = $('<tr></tr>');
                var $th = $('<th></th>');
                $th.text(convertToHexWithLeading(parseInt(len * 4)));
                $th.appendTo($tr);
                for (var i = 0; i < cols && len < length; i++) {
                    var $td = $('<td></td>');
                    var cell = memMatrix.getCell(len);
                    if (data !== null && data !== undefined && data[len] !== null) {
                        cell.setValue(data[len]);
                    }

                    var observator = new Observator(cell, function (newValue) {
                        this.element.text(convertToHexWithLeading(parseInt(newValue)));
                    });
                    observator.element = $td;
                    tableCells.push(cell);
                    $td.data("cellNr", len);
                    cell.changed();
                    $td.appendTo($tr);
                    len++;
                }
                $(this).append($tr);
            }
            var selection = {begin: null, end: null};
            $('td', $(this)).click(function (e) {
                if ($(this).find('input').length === 0) {
                    if (!e.shiftKey) {
                        var $that = $(this);
                        var cell = tableCells[$that.data('cellNr')];
                        var $input = $('<input type="text" value="" spellcheck="false"/>');
                        $input.data("def", parseInt($that.text()));
                        $input.on("keyup", function (e) {
                            if (e.which === 13 || e.which === 10) {
                                var val = $(this).val();
                                $(this).remove();
                                cell.setValue(parseInt(val));
                            } else if (e.which === 27) {
                                $(this).remove();
                                cell.changed();
                            }
                        }).on("blur", function (e) {
                            $(this).remove();
                            cell.changed();
                        });
                        $input.val($(this).text());
                        $(this).html('');
                        $(this).append($input);
                        $input.focus();
                    } else {
                        e.stopPropagation();
                        if (selection.begin === null) {
                            selection.begin = $(this);
                            $(this).addClass("selected");
                        } else {
                            selection.end = $(this);
                            $(this).addClass("selected");
                            // zamieniamy miejscami jeśli zaznaczenie wsteczne
                            if (selection.begin.data('cellNr') > selection.end.data('cellNr')) {
                                var s = selection.begin;
                                selection.begin = selection.end;
                                selection.end = s;
                            }

                            selection.begin.nextUntil(selection.end).andSelf().addClass("selected");
                            var $tr = selection.begin.parent().next();
                            var begNr = selection.begin.data('cellNr');
                            var endNr = selection.end.data('cellNr');
                            var endRowNr = Math.floor(endNr / cols);
                            var $trs = $([]);
                            for (var i = Math.floor(begNr / cols) + 1; i <= endRowNr; i++) {
                                $trs = $trs.add($tr);
                                $tr = $tr.next();
                            }
                            $trs.find('td').each(function (el) {
                                if (parseInt($(this).data('cellNr')) <= endNr) {
                                    $(this).addClass("selected");
                                }
                            });
                            var newVal = prompt("Ustal nową wartość dla zaznaczonych komórek:", "0x00000000");
                            if (newVal) {
                                memMatrix.setMultipleValues(begNr, endNr, newVal);
                            }
                            $('.selected', $table).removeClass("selected");
                            // zdejmujemy zaznaczenie
                            selection.begin = null;
                            selection.end = null;
                        }
                        e.preventDefault();
                    }
                }
            });
            return memMatrix;
        }
    });

})(jQuery);
