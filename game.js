Game = {

	canvas: document.getElementById('canvas'),
	context: this.canvas.getContext('2d'),
	gridCanvas: document.getElementById('gridCanvas'),
	gridContext: this.gridCanvas.getContext('2d'),

	inputs: {
		click: false,
		mousePos: {x:0,y:0},
	},

	cells: {
		activeCell: {
			x:0,
			y:0,
		},
		checked: [],
		mines: [],
		numbers: [],
	},

	update: function() {
		Game.cells.activeCell = Game.getCoordsFromCells(Game.inputs.mousePos);
		if(Game.inputs.click) {
			if(Game.checkIfMine(Game.inputs.mousePos)) {
				alert('Mine !!');
				Game.init(Game.nbCells);
				Game.inputs.click = false;
				return;
			}
			Game.addCell(Game.inputs.mousePos);
		}
		Game.inputs.click = false;
	},

	draw: function() {
		// clear
		Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
		// checked cells
		Game.context.fillStyle = 'grey';
		for(var cell in Game.cells.checked) {
			var currentCell = Game.cells.checked[cell];
			var currentCellCoords = Game.getCoordsFromCells(currentCell);
			Game.context.fillRect(currentCellCoords.x, currentCellCoords.y, Game.span, Game.span);
		}
		// numbers
		Game.context.fillStyle = 'black';
		Game.context.font = "30px Arial";
		for(var cell in Game.cells.numbers) {
			var currentCell = Game.cells.numbers[cell];
			var currentCellCoords = Game.getCoordsFromCells(currentCell);
			Game.context.fillText(currentCell.number, currentCellCoords.x, currentCellCoords.y+Game.span);
		}
		// mines
		Game.context.fillStyle = 'red';
		for(var cell in Game.cells.mines) {
			var currentCell = Game.cells.mines[cell];
			var currentCellCoords = Game.getCoordsFromCells(currentCell);
			Game.context.fillRect(currentCellCoords.x, currentCellCoords.y, Game.span, Game.span);
		}
		// default
		Game.context.fillStyle = '#c2b39f';
		for(var i = 0; i < Game.nbCells; i++) {
			for(var j = 0; j < Game.nbCells; j++) {
				if(Game.checkIfChecked({x:i+1, y:j+1}))
					continue;
				var coords = Game.getCoordsFromCells({x: i+1, y: j+1});
				Game.context.fillRect(coords.x, coords.y, Game.span, Game.span);
			}
		}

	},

	loop: function(time) {
		Game.update();
		Game.draw();
		requestAnimationFrame(Game.loop);
	},

	init: function(nbCells) {
		Game.cells = {
			activeCell: {
				x:0,
				y:0,
			},
			checked: [],
			mines: [],
			numbers: [],
		},
		Game.nbCells = nbCells;
		Game.canvas.width = 300;
		Game.canvas.height = 300;
		Game.gridCanvas.width = 300;
		Game.gridCanvas.height = 300;
		Game.span = Game.gridCanvas.width / Game.nbCells;
		Game.gridCanvas.addEventListener("mousemove", function(e) {
			Game.inputs.mousePos = Game.getCoordsFromPixels({
				x: e.layerX,
				y: e.layerY,
			});
		});
		Game.gridCanvas.addEventListener("click", function(e) {
			Game.inputs.click = true;
		});
		Game.drawGrid();
		Game.placeMines();
		Game.placeNumbers();
		Game.loop();
	},

	drawGrid: function() {
		var context = Game.gridContext;
		var nbCells = Game.nbCells;
		for(var i = 0; i < nbCells; i++) {
			var y = Game.gridCanvas.width / nbCells * i;
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(Game.gridCanvas.width, y);
			context.stroke();
		}
		for(var i = 0; i < nbCells; i++) {
			var y = Game.gridCanvas.height / nbCells * i;
			context.beginPath();
			context.moveTo(y, 0);
			context.lineTo(y, Game.gridCanvas.height);
			context.stroke();
		}
	},

	getCoordsFromPixels: function(coords) {
		return {
			x: Math.floor(coords.x / Game.span) + 1,
			y: Math.floor(coords.y / Game.span) + 1,
		}
	},

	getCoordsFromCells: function(coords) {
		return {
			x: (coords.x * Game.span) - Game.span,
			y: (coords.y * Game.span) - Game.span,
		}
	},

	addCell: function(coords) {
		var ret = true;
		for(var cell in Game.cells.checked) {
			var currentCell = Game.cells.checked[cell];
			if(currentCell.x == coords.x && currentCell.y == coords.y)
				ret = false;
		}
		if(ret)
			Game.cells.checked.push(coords);
	},

	placeMines: function() {
		// var nbMines = Game.nbCells / 2;
		var nbMines = Game.nbCells + 1;
		for(var i = 0; i < nbMines; i++) {
			var coords = {
				x: Math.floor(Math.random() * Game.nbCells + 1),
				y: Math.floor(Math.random() * Game.nbCells + 1),
			}
			if(!Game.checkIfMine(coords))
				Game.cells.mines.push({ x: coords.x, y: coords.y});
			else
				i--;
		}
	},

	placeNumbers: function() {
		for(i=1; i < Game.nbCells+1; i++) {
			for(j=1; j < Game.nbCells+1; j++) {
				if(!Game.checkIfMine({x:i, y:j})) {
					var number = 0;
					var matrix = [
						{
							x:i-1,
							y:j-1,
						},
						{
							x:i-1,
							y:j,
						},
						{
							x:i-1,
							y:j+1,
						},
						{
							x:i,
							y:j-1,
						},
						{
							x:i,
							y:j+1,
						},
						{
							x:i+1,
							y:j-1,
						},
						{
							x:i+1,
							y:j,
						},
						{
							x:i+1,
							y:j+1,
						},
					];
					for(var cell in matrix)
						if(Game.checkIfMine(matrix[cell]))
							number++;
					if(number !== 0) {
						Game.cells.numbers.push({
							x:i,
							y:j,
							number: number,
						});
					}
				}
			}
		}
	},

	checkIfMine: function(coords) {
		for(var cell in Game.cells.mines) {
			var currentCell = Game.cells.mines[cell];
			if(currentCell.x == coords.x && currentCell.y == coords.y)
				return true;
		}
		return false;
	},

	checkIfChecked: function(coords) {
		for(var cell in Game.cells.checked) {
			var currentCell = Game.cells.checked[cell];
			if(currentCell.x == coords.x && currentCell.y == coords.y)
				return true;
		}
		return false;
	},

}

Game.init(9);