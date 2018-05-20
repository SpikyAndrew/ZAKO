var barrelShifterCommands = ['NOP', 'LSL', 'LSR', 'ASR', 'ROR','RRX']

function isShifterArg(arg){
	var mnemonic = arg.split(' ')[0];
	if (barrelShifterCommands.indexOf(mnemonic)>0){
		return true;
	}
	return false;
}

function encodeShifterArg(arg){
	var splitArg = arg.split(' ');
	var commandCode = barrelShifterCommands.indexOf(splitArg[0]);
	var number = splitArg[1].slice(1);
	return commandCode<<5 | number & 0x00000fff;
}

function decodeShifterCommand(commandNumber){
	return barrelShifterCommands[commandNumber];
}

//Koduje liczbę 12-bitową w sposób charakterystyczny dla ARM
function encodeImmediate(arg){
	var shift = 0;
	var integer = arg;
	var negative = false;
	if (integer < 0){
		negative = true;
		integer *= -1;
	}
	while (integer%2 == 0){
		integer = integer >> 1;
		shift++;
	}
	//przesunięcie może być tylko o parzystą liczbę pozycji
	if (shift%2 != 0){
		integer = integer << 1;
		shift--;
	}
	if (integer & 0xffffff80){
	throw new Error('Liczba ' + arg + ' nie może być zakodowana. ' +
					'Musi mieścić się na 8 bitach z czterobitowym przesunięciem');
	}
	if (negative){
		integer = (integer ^ 0x000000ff) + 1;
	}
	return ((shift/2) << 8) | integer;
}