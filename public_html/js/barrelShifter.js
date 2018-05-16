//var barrelShifterCommands = ['LSL', 'LSR', 'ASR', 'ROR','RRX']
var barrelShifterCommands = [null, 'LSL', 'LSR', 'ROR']

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
	
	return 
}