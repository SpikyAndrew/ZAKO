var conditionalCodes = ['AL', 'EQ', 'NE', 'CS', 
						'CC', 'MI', 'PL', 'VS', 
						'VC', 'HI', 'LS', 'GE', 
						'LT', 'GT', 'LE', 'NV'];

function isConditional(arg){
	if (conditionalCodes.indexOf(arg)>0){
		return true;
	}
	return false;
}

function encodeConditional(arg){
	if (arg===undefined){
		return 0;
	}
	return conditionalCodes.indexOf(arg);
}