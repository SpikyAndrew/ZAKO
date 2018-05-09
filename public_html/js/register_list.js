/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */
'use strict';

/* global ObservableVar */

var registerLength = 32;
var registerCapacity = Math.pow(2, registerLength);
var registerMask = 1 << (registerLength - 1);




function Register(initValue) {
    if (initValue === null) {
        initValue = Math.round(Math.random() * 1000000) % registerCapacity;
    }
    ObservableVar.call(this, initValue);
    this.initValue = initValue;
}

Register.prototype = Object.create(ObservableVar.prototype, {
    done: {
        value: function () {
            var val = this.getValue();
            if (val < 0)
                val += registerCapacity;
            this.setValue(val % registerCapacity);
            return this;
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    reset: {
        value: function (val) {
            this.setValue(val === null ? this.getRandomValue() : val);
            return this;
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    getRandomValue: {
        value: function () {
            return Math.round(Math.random() * 1000000) % registerCapacity;
        },
        enumerable: true,
        configurable: true,
        writable: true
    }
});

Register.prototype.constructor = Register;


function RegisterList(numberOfRegisters) {
    this.registers = [];
    for (var i = 0; i < numberOfRegisters; i++) {
        this.registers.push(new Register(null));
    }
}

RegisterList.prototype = {
    constructor: RegisterList,
    namePrefix: 'R',
    registers: [],
    /**
     * 
     * @param {String} name
     * @returns {Register}
     */
    getRegister: function (name) {
        return this.registers[name.replace(this.namePrefix, '')];
    },
    isRegister: function (name) {
        return name.indexOf(this.namePrefix) === 0 && this.registers[name.replace(this.namePrefix, '')] !== null;
    },
    addRegister: function (register) {
        this.registers.push(register);
        return this;
    },
    updateAll: function () {
        for (var i = 0; i < this.registers.length; i++) {
            this.registers[i].changed();
        }
    },
    reset: function (resetVal) {
        this.execForAll(function (register) {
            register.reset(resetVal);
        });
    },
    execForAll: function (func) {
        for (var i = 0; i < this.registers.length; i++) {
            func(this.registers[i]);
        }
    }//,
//    toString: function () {
//        return $.map(this.registers, function (element) {
//            return element.toString();
//        });
//    }
};


function convertToHexWithLeading(number) {
    number = number % registerCapacity;
    if (number < 0) {
//        console.log("before:", number);
//        number = number + ((~registerMask << 1) + 1);
        number = number >>> 0;
//        console.log("after:", number);
//        console.log("mask hex:", ((~registerMask << 1) + 1).toString(16));
    }
    var hexval = number.toString(16);
    return '0x' + '0'.repeat(registerLength / 4 - hexval.length) + hexval;
}



function RegisterAdapter(property) {
    var self = this;
    self.register = property;
    self.getValue = function () {
        return self.register();
    };
    self.setValue = function (value) {
        self.register(value);
    };
    self.reset = function () {
        self.setValue(Math.round(Math.random() * 1000000000) % registerCapacity);
    };
}


var _architectureRegisters = ['A', 'B', 'C', 'MAR', 'MDR', 'PC', 'IR', 'uAR'];

var _additionalRegisters = [];

function ArchitectureRegisters(additionalRegisters) {
    var self = this;
    self.additionalRegsNames = additionalRegisters;

    // registers with random values
    self.registers = {};
    for (var i = 0; i < _architectureRegisters.length; i++) {
        self.registers[_architectureRegisters[i]] = ko.observable(Math.round(Math.random() * 10000000) % registerCapacity);
    }
    self.additionalRegisters = ko.observableArray();
    for (var i = 0; i < self.additionalRegsNames.length; i++) {
        var reg = ko.observable(Math.round(Math.random() * 10000000) % registerCapacity);
        self.registers[self.additionalRegsNames[i]] = reg;
        self.additionalRegisters.push({register: reg, name: self.additionalRegsNames[i]});
    }
    console.log(self.registers);

    self.isRegister = function (name) {
        return self.additionalRegsNames.indexOf(name) >= 0 || _architectureRegisters.indexOf(name) >= 0;
    };

    self.getRandomValue = function () {
        return Math.round(Math.random() * 1000000000) % registerCapacity;
    };

    self.reset = function (value) {
        for (var property in self.registers) {
            if (self.registers.hasOwnProperty(property)) {
                self.registers[property](value === null || value === undefined ? self.getRandomValue() : value);
            }
        }
//        self.registers['IR'](0x00100000);
    };

    self.getRegister = function (registerName) {
        return self.isRegister(registerName) ? new RegisterAdapter(self.registers[registerName]) : null;
    };

    /**
     * 
     * @param {String} registerName Name of register (R{nr}, eg R5)
     * @returns {Number} value of
     */
    self.getRegisterValue = function (registerName) {
        return self.registers[registerName]();
    };

    self.setRegisterValue = function (registerName, value) {
        this.registers[registerName](value);
    };

    self.exportValues = function () {
        var ret = {};
        for (var property in self.registers) {
            if (self.registers.hasOwnProperty(property)) {
                ret[property] = self.registers[property]();
            }
        }
        return ret;
    };

    self.loadFromExported = function (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                if (self.isRegister(property)) {
                    self.registers[property](data[property]);
                } else {
                    console.log('Invalid architecture register name: ' + property);
                }
            }
        }
    };
}



function RegistersList(length) {
    var self = this;
    self.namePrefix = 'R';

    // registers with random values
    self.registers = ko.observableArray(Array.apply(null, Array(length)).map(function () {
        return ko.observable(Math.round(Math.random() * 1000000000) % registerCapacity);
    }));

    self.isRegister = function (name) {
        return name.indexOf(this.namePrefix) === 0 && self.registers()[name.replace(self.namePrefix, '')] !== null;
    };

    self.getRandomValue = function () {
        return Math.round(Math.random() * 1000000000) % registerCapacity;
    };

    self.reset = function (value) {
        self.registers().map(function (register) {
            register((value === undefined || value === null) ? self.getRandomValue() : value);
        });
		self.registers()[0](0);
    };

    /**
     * 
     * @param {String} registerName Name of register (R{nr}, eg R5)
     * @returns {Number} value of
     */
    self.getRegisterValue = function (registerName) {
        return this.registers()[registerName.replace(self.namePrefix, '')]();
    };

    self.getRegisterNumber = function (registerName) {
        return self.isRegister(registerName) ? registerName.replace(self.namePrefix, '') : false;
    };

    self.setRegisterValue = function (registerName, value) {
        this.registers()[registerName.replace(self.namePrefix, '')](value);
    };

    self.getRegister = function (registerName) {
        return new RegisterAdapter(self.registers()[registerName.replace(self.namePrefix, '')]);
    };

    self.exportValues = function () {
        return self.registers().map(function (el) {
            return el();
        });
    };

    self.loadFromExported = function (data) {
        for (var i = 0; i < data.length; i++) {
            self.registers()[i](data[i]);
        }
    };

}

