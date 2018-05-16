var conditionalCodes = [null, 'EQ', 'NE', 'CS', 
									'CC', 'MI', 'PL', 'VS', 
									'VC', 'HI', 'LS', 'GE', 
									'LT', 'GT', 'LE', 'AL']

function isConditional(arg){
	var mnemonic = arg.split(' ')[0];
	if (conditionalCodes.indexOf(mnemonic)>0){
		return true;
	}
	return false;
}

function encodeConditional(arg){
	return conditionalCodes.indexOf(arg);
}