/* 
 *  WxFramework all rights reserved to J.Demk <demjot at eti.pg.gda.pl>
 */


var defaultStrokeWidth = 1;
var boldStrokeWidth = 3;


/**
 * 
 * @param {MicrocodeRow} currentMicrocodeRow
 * @returns {undefined}
 */
function connectAll(currentMicrocodeRow) {

	var canvas = document.getElementById('archConnections');
	// Make sure we don't execute when canvas isn't supported
	if (canvas.getContext) {
		var diagram = $('#architectureDiagram');
		// use getContext to use the canvas for drawing
		var ctx = canvas.getContext('2d');
		ctx.canvas.height = diagram.height();
		ctx.canvas.width = diagram.width();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = defaultStrokeWidth;

		var $alu = $('#alu');
		
		var $barrelShifter = $('#barrelShifter');

		var mcBlockConPadding = 50;

		var aluOffset = $alu.offset();
		var barrelShifterOffset = $barrelShifter.offset();
		var canvasOffset = $(canvas).offset();
		var canvasHeight = $(canvas).height();

		var aluHeight = $alu.height();

		var $regA = $('#arch-regA');
		var regA = $regA.offset();
		var $regB = $('#arch-regB');
		var regB = $regB.offset();
		var $regC = $('#arch-regC');
		var regC = $regC.offset();

		var $registers = $('#registers');

		var aluX = aluOffset.left - canvasOffset.left;
		var aluY = aluOffset.top - canvasOffset.top;
		
		var barrelShifterX = barrelShifterOffset.left - canvasOffset.left;
		var barrelShifterY = barrelShifterOffset.top - canvasOffset.top;

		var connectionPadding = 20;
		var dotWidth = 6;
		// pionowe linie danych

		// S2
		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S2() ? boldStrokeWidth : defaultStrokeWidth);
		ctx.moveTo(barrelShifterX - connectionPadding, 0);
		ctx.lineTo(barrelShifterX - connectionPadding, canvasHeight);

		// łącznik dolnego wejścia ALU
		ctx.fillRect(barrelShifterX - connectionPadding - dotWidth / 2,
				aluY + (aluHeight / 4) * 3 - dotWidth / 2,
				dotWidth, dotWidth);
		// przyłącze ALU do szyny danych (górny)
		ctx.moveTo(barrelShifterX - connectionPadding, aluY + (aluHeight / 4) * 3);
		ctx.lineTo(aluX + 5, aluY + (aluHeight / 4) * 3);
		ctx.stroke();

		// S1
		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S1() ? boldStrokeWidth : defaultStrokeWidth);
		ctx.moveTo(aluX - connectionPadding * 2, 0);
		ctx.lineTo(aluOffset.left - canvasOffset.left - connectionPadding * 2, canvasHeight);
		// łącznik górnego wejścia ALU do S1
		ctx.fillRect(aluX - connectionPadding * 2 - dotWidth / 2,
				aluY + aluHeight / 4 - dotWidth / 2,
				dotWidth, dotWidth);
		// przyłącze ALU do szyny danych (górny)
		ctx.moveTo(aluX - connectionPadding * 2, aluY + aluHeight / 4);
		ctx.lineTo(aluX + 5, aluY + aluHeight / 4);
		ctx.stroke();


		// przyłącze szyny danych do A (dot)
		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S1() === "A" ? boldStrokeWidth : defaultStrokeWidth);
		ctx.fillRect(aluX - connectionPadding * 2 - dotWidth / 2,
				regA.top - canvasOffset.top - dotWidth / 2 + $regA.height() / 2,
				dotWidth, dotWidth);
		// przyłącze szyny danych do A
		ctx.moveTo(aluX - connectionPadding * 2, regA.top - canvasOffset.top + $regA.height() / 2);
		ctx.lineTo(aluX + 5, regA.top - canvasOffset.top + $regA.height() / 2);
		ctx.stroke();


		// przyłącze szyny danych do B (dot)
		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S2() === "B" ? boldStrokeWidth : defaultStrokeWidth);
		ctx.fillRect(barrelShifterX - connectionPadding - dotWidth / 2,
				regB.top - canvasOffset.top - dotWidth / 2 + $regB.height() / 2,
				dotWidth, dotWidth);
		// przyłącze szyny danych do B
		ctx.moveTo(barrelShifterX - connectionPadding, regB.top - canvasOffset.top + $regB.height() / 2);
		ctx.lineTo(aluX + 5, regB.top - canvasOffset.top + $regB.height() / 2);
		ctx.stroke();





		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.Regs() && (currentMicrocodeRow.Regs() === "RR" || currentMicrocodeRow.Regs().substring(0, 2) === "RA") ? boldStrokeWidth : defaultStrokeWidth);
		// przyłącze rejestru A do bloku rejestrów głównych
		ctx.moveTo(aluX + $regA.width() - 25, regA.top - canvasOffset.top + $regA.height() / 2);
		ctx.lineTo($registers.offset().left - canvasOffset.left + 5, regA.top - canvasOffset.top + $regA.height() / 2);
		ctx.stroke();

		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.Regs() &&
				(currentMicrocodeRow.Regs() === "RR" || currentMicrocodeRow.Regs().substring(0, 2) === "RB")
				? boldStrokeWidth : defaultStrokeWidth);
		// przyłącze rejestru B do bloku rejestrów głównych
		ctx.moveTo(aluX + $regB.width() - 25, regB.top - canvasOffset.top + $regB.height() / 2);
		ctx.lineTo($registers.offset().left - canvasOffset.left + 5, regB.top - canvasOffset.top + $regB.height() / 2);
		ctx.stroke();


		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.Dest() ? boldStrokeWidth : defaultStrokeWidth);

		// Szyna danych wyjściowych z ALU
		// szyna wyjsciowa danych

		var aluOutDataBusX = canvas.width - connectionPadding;

		ctx.moveTo(aluOutDataBusX, 0);
		ctx.lineTo(aluOutDataBusX, canvasHeight);

		// ALU do szyny wyjściowej
		ctx.moveTo(aluX + $alu.width() - 5, aluY + aluHeight / 2);
		ctx.lineTo(aluOutDataBusX, aluY + aluHeight / 2);
		// przyłącze wyjścia z ALU do wyjściowej szyny danych (dot)
		ctx.fillRect(aluOutDataBusX - dotWidth / 2,
				aluY + aluHeight / 2 - dotWidth / 2,
				dotWidth, dotWidth);
		ctx.stroke();


		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.Dest() === "C" ? boldStrokeWidth : defaultStrokeWidth);

		var regCconnectionY = regC.top - canvasOffset.top + $regC.height() / 2;
		// przyłącze rejestru C do szyny danych wyjściowych z ALU
		// ALU do szyny wyjściowej
		ctx.moveTo(regC.left - canvasOffset.left + $regC.width() - 5,
				regCconnectionY);
		ctx.lineTo(aluOutDataBusX, regCconnectionY);
		// przyłącze wyjścia z ALU do wyjściowej szyny danych (dot)
		ctx.fillRect(aluOutDataBusX - dotWidth / 2,
				regCconnectionY - dotWidth / 2,
				dotWidth, dotWidth);
		ctx.stroke();
		ctx.beginPath();

		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.Regs() &&
				currentMicrocodeRow.Regs().substr(0, 2) === "WF"
				? boldStrokeWidth : defaultStrokeWidth);

		// przyłącze rejestru C do bloku rejestrów głównych:
		ctx.moveTo(regC.left - canvasOffset.left + 5,
				regCconnectionY);
		ctx.lineTo($registers.offset().left - canvasOffset.left + $registers.width() - 5, regCconnectionY);

		ctx.stroke();

		// odrysowujemy połączenia do rejestrów tymczasowych

		$('#architectureRegisters li').each(function (i, element) {
			drawRegisterConnection(ctx, $(element), aluX - connectionPadding * 2, barrelShifterX - connectionPadding, aluOutDataBusX, dotWidth,
					currentMicrocodeRow && currentMicrocodeRow.S1() && currentMicrocodeRow.S1() === $(element).find('.register-name').text(),
					currentMicrocodeRow && currentMicrocodeRow.S2() && currentMicrocodeRow.S2() === $(element).find('.register-name').text(),
					currentMicrocodeRow && currentMicrocodeRow.Dest() && currentMicrocodeRow.Dest() === $(element).find('.register-name').text());
		});


		var $MDRreg = $('#MDR-register');
		var $PCreg = $('#PC-register');

		var $IRreg = $("#IR-register");
		var $MARreg = $('#MAR-register');

		$([$MARreg, $PCreg,$MDRreg]).each(function (i, element) {
			drawRegisterConnection(ctx, $(element), aluX - connectionPadding * 2, barrelShifterX - connectionPadding, aluOutDataBusX, dotWidth,
					currentMicrocodeRow && currentMicrocodeRow.S1() && currentMicrocodeRow.S1() === $(element).find('.register-name').text(),
					currentMicrocodeRow && currentMicrocodeRow.S2() && currentMicrocodeRow.S2() === $(element).find('.register-name').text(),
					currentMicrocodeRow && currentMicrocodeRow.Dest() && currentMicrocodeRow.Dest() === $(element).find('.register-name').text(),4,(i>1?3:2));
		});

	
		drawRegisterConnectionSrcDataBusses(ctx, $IRreg, aluX - connectionPadding * 2, barrelShifterX - connectionPadding, dotWidth,
		    currentMicrocodeRow && currentMicrocodeRow.S1() && currentMicrocodeRow.S1() == $IRreg.find('.register-name').text(),
			currentMicrocodeRow && currentMicrocodeRow.S2() && currentMicrocodeRow.S2() == $IRreg.find('.register-name').text());

		var $MEMblock = $('#memory-block');

		drawMemoryConnections(ctx, currentMicrocodeRow, $IRreg, $MDRreg, $MARreg, $PCreg, $MEMblock);
		ctx.closePath();
		ctx.stroke();


		// #################################################################
		// Część po lewej

		// Microcode


		var $mcBlock = $('#microcode-block');
		var mcBlockOffset = $mcBlock.offset();
		var mcBlockH = $mcBlock.height();
		var mcBlockW = $mcBlock.width();

		// Microcode <-> S1

		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S1() === "Const" ? boldStrokeWidth : defaultStrokeWidth);
		ctx.moveTo(mcBlockOffset.left - canvasOffset.left + mcBlockW - 5,
				mcBlockOffset.top - canvasOffset.top + 2 * mcBlockH / 4);
		ctx.lineTo(aluX - 2 * connectionPadding,
				mcBlockOffset.top - canvasOffset.top + 2 * mcBlockH / 4);
		ctx.fillRect(aluX - 2 * connectionPadding - dotWidth / 2,
				mcBlockOffset.top - canvasOffset.top + 2 * mcBlockH / 4 - dotWidth / 2,
				dotWidth, dotWidth);
//        ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		// Microcode <-> S2
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S2() === "Const" ? boldStrokeWidth : defaultStrokeWidth);
		ctx.moveTo(mcBlockOffset.left - canvasOffset.left + mcBlockW - 5,
				mcBlockOffset.top - canvasOffset.top + 3 * mcBlockH / 4);
		ctx.lineTo(barrelShifterX - connectionPadding,
				mcBlockOffset.top - canvasOffset.top + 3 * mcBlockH / 4);
		ctx.fillRect(barrelShifterX - connectionPadding - dotWidth / 2,
				mcBlockOffset.top - canvasOffset.top + 3 * mcBlockH / 4 - dotWidth / 2,
				dotWidth, dotWidth);
		ctx.stroke();



		var incrementerBlockOffset = $('#uArIncrementer').offset();
		var incrementerBlockH = $('#uArIncrementer').height();
		var incrementerBlockW = $('#uArIncrementer').width();


		ctx.beginPath();
		// Microcode <-> uAR incrementer
//        ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.S2() === "Const" ? boldStrokeWidth : defaultStrokeWidth);
		ctx.lineWidth = defaultStrokeWidth;
		ctx.moveTo(mcBlockOffset.left - canvasOffset.left + mcBlockW - 5,
				mcBlockOffset.top - canvasOffset.top + 1 * mcBlockH / 4);
		ctx.lineTo(mcBlockOffset.left - canvasOffset.left + mcBlockW + mcBlockConPadding,
				mcBlockOffset.top - canvasOffset.top + 1 * mcBlockH / 4);
		ctx.lineTo(mcBlockOffset.left - canvasOffset.left + mcBlockW + mcBlockConPadding,
				incrementerBlockOffset.top - canvasOffset.top + incrementerBlockH / 2);
		ctx.lineTo(incrementerBlockOffset.left - canvasOffset.left + incrementerBlockW - 5,
				incrementerBlockOffset.top - canvasOffset.top + incrementerBlockH / 2);
//        ctx.closePath();
		ctx.stroke();





		// do powyższego połączenia - podłączenie go do uAR
		var $uArReg = $('#uAR-register');
		var uArRegOffset = $uArReg.offset();
		var uArWidth = $uArReg.outerWidth();
		var uArHeight = $uArReg.outerHeight();

		ctx.beginPath();
		ctx.lineWidth = defaultStrokeWidth;

		ctx.moveTo(uArRegOffset.left - canvasOffset.left + uArWidth - 5,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2);
		ctx.lineTo(mcBlockOffset.left - canvasOffset.left + mcBlockW + mcBlockConPadding,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2);

		ctx.fillRect(mcBlockOffset.left - canvasOffset.left + mcBlockW + mcBlockConPadding - dotWidth / 2,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2 - dotWidth / 2, dotWidth, dotWidth);

		ctx.stroke();

		var mcBlockConPaddingLeft = 15;


		// Switch po lewej
		ctx.beginPath();
		ctx.lineWidth = boldStrokeWidth;
		ctx.moveTo(uArRegOffset.left - canvasOffset.left - mcBlockConPaddingLeft,
				uArRegOffset.top - canvasOffset.top);
		ctx.lineTo(uArRegOffset.left - canvasOffset.left - mcBlockConPaddingLeft,
				uArRegOffset.top - canvasOffset.top + uArHeight);
		ctx.stroke();

		// podłączenie uAR do switcha
		ctx.beginPath();
		ctx.lineWidth = boldStrokeWidth;
		ctx.moveTo(uArRegOffset.left - canvasOffset.left - mcBlockConPaddingLeft,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2);
		ctx.lineTo(uArRegOffset.left - canvasOffset.left + 5,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2);
		ctx.stroke();


		// podłączenie incrementer <-> pozycja switcha
		ctx.beginPath();
		ctx.lineWidth = (!currentMicrocodeRow || (currentMicrocodeRow && (!currentMicrocodeRow.JCond() || currentMicrocodeRow.JCond().length === 0)) ? boldStrokeWidth : defaultStrokeWidth);
		ctx.moveTo(incrementerBlockOffset.left - canvasOffset.left + 5,
				incrementerBlockOffset.top - canvasOffset.top + incrementerBlockH / 2);
		ctx.lineTo(mcBlockConPaddingLeft,
				incrementerBlockOffset.top - canvasOffset.top + incrementerBlockH / 2);
		ctx.lineTo(mcBlockConPaddingLeft,
				uArRegOffset.top - canvasOffset.top);

		ctx.fillRect(mcBlockConPaddingLeft - dotWidth / 2,
				uArRegOffset.top - canvasOffset.top,
				dotWidth, dotWidth);
		ctx.stroke();


		// połączenie jumptable <-> pozycja switcha
		var $jumpTableBlock = $('#jumptable-block');
		var jumpTableOffset = $jumpTableBlock.offset();
		var jumpTableW = $jumpTableBlock.width();
		var jumpTableH = $jumpTableBlock.height();
		ctx.beginPath();
		ctx.lineWidth = defaultStrokeWidth;// Jump
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.JCond() && currentMicrocodeRow.JCond().substring(0, 4) === "Jump" ? boldStrokeWidth : defaultStrokeWidth);

		ctx.moveTo(jumpTableOffset.left - canvasOffset.left + 5,
				jumpTableOffset.top - canvasOffset.top + jumpTableH / 2);
		ctx.lineTo(mcBlockConPaddingLeft / 2,
				jumpTableOffset.top - canvasOffset.top + jumpTableH / 2);
		ctx.lineTo(mcBlockConPaddingLeft / 2,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2);
		ctx.lineTo(mcBlockConPaddingLeft,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2);

		ctx.fillRect(mcBlockConPaddingLeft - dotWidth / 2,
				uArRegOffset.top - canvasOffset.top + uArHeight / 2 - dotWidth / 2,
				dotWidth, dotWidth);
		ctx.stroke();

		// połączenie microcode <-> pozycja switcha
		ctx.beginPath();
		ctx.lineWidth = (currentMicrocodeRow && currentMicrocodeRow.JCond() &&
				currentMicrocodeRow.JCond().length > 0 &&
				currentMicrocodeRow.JCond().substring(0, 4) !== "Jump" ? boldStrokeWidth : defaultStrokeWidth);
		ctx.moveTo(mcBlockOffset.left - canvasOffset.left + 5,
				mcBlockOffset.top - canvasOffset.top + mcBlockH / 2);
		ctx.lineTo(mcBlockConPaddingLeft,
				mcBlockOffset.top - canvasOffset.top + mcBlockH / 2);
		ctx.lineTo(mcBlockConPaddingLeft, uArRegOffset.top - canvasOffset.top + uArHeight);

		ctx.fillRect(mcBlockConPaddingLeft - dotWidth / 2,
				uArRegOffset.top - canvasOffset.top + uArHeight - dotWidth, dotWidth, dotWidth);
		ctx.stroke();




	} else {
		alert("lipa");
	}

}


function drawRegisterConnection(ctx, $registerObj, dp1X, dp2X, aluOutDataBusX, dotWidth, dp1Big, dp2Big, dpOutBig,outputFactor,inputFactor) {
	var canvas = $(ctx.canvas);
	if(inputFactor===undefined) {
		inputFactor = 2;
	}
	var regConnectionY = $registerObj.offset().top - canvas.offset().top + $registerObj.height() / inputFactor;
	ctx.stroke();

	ctx.lineWidth = (dpOutBig ? boldStrokeWidth : defaultStrokeWidth);
	ctx.beginPath();
	// przyłącze rejestru do szyny danych wyjściowych z ALU
	ctx.moveTo($registerObj.offset().left - canvas.offset().left + $registerObj.width() - 5,
			regConnectionY);
	ctx.lineTo(aluOutDataBusX, regConnectionY);

	// przyłącze wyjścia z rejestru do wyjściowej szyny danych (dot)
	ctx.fillRect(aluOutDataBusX - dotWidth / 2,
			regConnectionY - dotWidth / 2,
			dotWidth, dotWidth);
	ctx.stroke();

	drawRegisterConnectionSrcDataBusses(ctx, $registerObj, dp1X, dp2X, dotWidth, dp1Big, dp2Big,outputFactor);

}

function drawRegisterConnectionSrcDataBusses(ctx, $registerObj, dp1X, dp2X, dotWidth, dp1Big, dp2Big,outputFactor) {

	if(outputFactor===undefined) {
		outputFactor = 3;
	}
	var canvas = $(ctx.canvas);
	var regConnectionY = $registerObj.offset().top - canvas.offset().top;
	ctx.stroke();
	ctx.beginPath();
	ctx.lineWidth = (dp1Big ? boldStrokeWidth : defaultStrokeWidth);
	// przyłącze rejestru do szyny danych wejściowych 1
	ctx.moveTo($registerObj.offset().left - canvas.offset().left + 5,
			regConnectionY + $registerObj.height() / outputFactor);
	ctx.lineTo(dp1X, regConnectionY + $registerObj.height() / outputFactor);

	// przyłącze wyjścia z rejestru do wejściowej szyny danych nr 1 (dot)
	ctx.fillRect(dp1X - dotWidth / 2,
			regConnectionY + $registerObj.height() / outputFactor - dotWidth / 2,
			dotWidth, dotWidth);

	ctx.stroke();
	ctx.beginPath();
	ctx.lineWidth = (dp2Big ? boldStrokeWidth : defaultStrokeWidth);
	// przyłącze rejestru do szyny danych wejściowych 2
	ctx.moveTo($registerObj.offset().left - canvas.offset().left + 5,
			regConnectionY + 2 * $registerObj.height() / outputFactor);
	ctx.lineTo(dp2X, regConnectionY + 2 * $registerObj.height() / outputFactor);

	// przyłącze wyjścia z rejestru do wejściowej szyny danych nr 2 (dot)
	ctx.fillRect(dp2X - dotWidth / 2,
			regConnectionY + 2 * $registerObj.height() / outputFactor - dotWidth / 2,
			dotWidth, dotWidth);

}

function drawLine(ctx, x1, y1, x2, y2, bold) {
	if (bold === undefined) {
		bold = false;
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.lineWidth = (bold ? boldStrokeWidth : defaultStrokeWidth);
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawDot(ctx, x, y) {
	// przyłącze wyjścia z rejestru do wejściowej szyny danych nr 2 (dot)
	var dotWidth = 5;
	ctx.fillRect(x - dotWidth / 2,
			y - dotWidth / 2,
			dotWidth, dotWidth);
	ctx.stroke();
}

/**
 * 
 * @param {type} ctx
 * @param {MicrocodeRow} currentMicrocodeRow
 * @param {type} $IRreg
 * @param {type} $MDRreg
 * @param {type} $MARreg
 * @param {type} $PCreg
 * @param {type} $MEMblock
 * @returns {undefined}
 */
function drawMemoryConnections(ctx, currentMicrocodeRow, $IRreg, $MDRreg, $MARreg, $PCreg, $MEMblock) {

	console.log(currentMicrocodeRow);
	var canvas = $(ctx.canvas);
	var MDRregLineY = $MDRreg.offset().top - canvas.offset().top + 3 * $MDRreg.height() / 4;
	drawLine(ctx,
			$MDRreg.offset().left - canvas.offset().left + 5,
			MDRregLineY,
			$MEMblock.offset().left - canvas.offset().left + $MEMblock.width() - 5,
			MDRregLineY,
			currentMicrocodeRow && currentMicrocodeRow.Mem() && currentMicrocodeRow.Mem()[0]=='W'
			);

	var switchRx = $MEMblock.offset().left - canvas.offset().left + $MEMblock.width() * 2;
	var switchRy = $PCreg.offset().top - canvas.offset().top;

	// linia od MAR do switcha
	var MARregLineY = $MARreg.offset().top - canvas.offset().top + 3 * $MARreg.height() / 4;
	var MARLineBold = currentMicrocodeRow && currentMicrocodeRow.MAdr() && currentMicrocodeRow.MAdr() === $($MARreg).find('.register-name').text();
	drawLine(ctx,
			$MARreg.offset().left - canvas.offset().left + 5, MARregLineY,
			switchRx, MARregLineY,
			MARLineBold
			);

	drawDot(ctx, switchRx, MARregLineY);


	// linia od PC do switcha
	var PCregLineY = $PCreg.offset().top - canvas.offset().top + 3 * $PCreg.height() / 4;
	var PCLineBold = currentMicrocodeRow && currentMicrocodeRow.MAdr() && currentMicrocodeRow.MAdr() === $($PCreg).find('.register-name').text();
	drawLine(ctx,
			$PCreg.offset().left - canvas.offset().left + 5, PCregLineY,
			switchRx, PCregLineY,
			PCLineBold
			);
	drawDot(ctx, switchRx, PCregLineY);

	// switch
	var switchPadding = 15;
	var switchX = switchRx - switchPadding;

	var MEMblockTop = $MEMblock.offset().top - canvas.offset().top;
	var MEMblockLeft = $MEMblock.offset().left - canvas.offset().left;

	drawLine(ctx, switchX, PCregLineY - 2, switchX, MARregLineY + 2, true);

	drawLine(ctx, switchX, (PCregLineY + MARregLineY) / 2, switchX - $MEMblock.width() / 2, (PCregLineY + MARregLineY) / 2, PCLineBold || MARLineBold);
	drawLine(ctx, switchX - $MEMblock.width() / 2, (PCregLineY + MARregLineY) / 2, switchX - $MEMblock.width() / 2, MEMblockTop + $MEMblock.height() / 4, PCLineBold || MARLineBold);
	drawLine(ctx,
			switchX - $MEMblock.width() / 2,
			MEMblockTop + $MEMblock.height() / 4,
			MEMblockLeft + $MEMblock.width() / 2,
			MEMblockTop + $MEMblock.height() / 4,
			PCLineBold || MARLineBold);


	// połączenie do zapisu IR i MDR
	var MemDestLineY = MEMblockTop + 1.2 * $MEMblock.height();
	var IRMemDest = currentMicrocodeRow && currentMicrocodeRow.MDest() && currentMicrocodeRow.MDest() === $($IRreg).find('.register-name').text();
	var MDRMemDest = currentMicrocodeRow && currentMicrocodeRow.MDest() && currentMicrocodeRow.MDest() === $($MDRreg).find('.register-name').text();
	var MemDestWriteB = IRMemDest || MDRMemDest;
	drawLine(ctx,
			MEMblockLeft + $MEMblock.width() / 2,
			MEMblockTop + $MEMblock.height() - 5,
			MEMblockLeft + $MEMblock.width() / 2,
			MemDestLineY,
			MemDestWriteB
			);

	var destSwitchX = $MDRreg.offset().left - canvas.offset().left + 2 * $MDRreg.width();
	drawLine(ctx,
			MEMblockLeft + $MEMblock.width() / 2,
			MemDestLineY,
			destSwitchX,
			MemDestLineY,
			MemDestWriteB
			);

	var MDRTopOffset = $MDRreg.offset().top - canvas.offset().top + 3*$MDRreg.height() / 4;
	var IRTopOffset = $IRreg.offset().top - canvas.offset().top + $IRreg.height() / 2;
	drawLine(
			ctx,
			destSwitchX - switchPadding * 2,
			MDRTopOffset,
			$MDRreg.offset().left - canvas.offset().left + $MDRreg.width() - 5,
			MDRTopOffset,
			MDRMemDest
			);

	drawDot(ctx,
			destSwitchX - switchPadding * 2,
			MDRTopOffset);
	drawLine(
			ctx,
			destSwitchX - switchPadding * 2,
			IRTopOffset,
			$IRreg.offset().left - canvas.offset().left + $IRreg.width() - 5,
			IRTopOffset,
			IRMemDest
			);
	drawDot(ctx,
			destSwitchX - switchPadding * 2,
			IRTopOffset);

	drawLine(ctx,
			destSwitchX,
			MemDestLineY,
			destSwitchX,
			(IRTopOffset + MDRTopOffset) / 2,
			MemDestWriteB
			);

	drawLine(ctx,
			destSwitchX,
			(IRTopOffset + MDRTopOffset) / 2,
			destSwitchX - switchPadding,
			(IRTopOffset + MDRTopOffset) / 2,
			MemDestWriteB
			);
	drawLine(ctx,
			destSwitchX - switchPadding,
			IRTopOffset + 3,
			destSwitchX - switchPadding,
			MDRTopOffset - 3,
			MemDestWriteB
			);



}


$(document).ready(function () {
	connectAll();
});

$(window).resize(function () {
	connectAll();
});