// We save the points' sequences in an array: each item of the array is a path
var pathArray = [];
// This stores the points from mouse down until mouse up
var currentPath = [];

// Variables for referencing the canvas and 2dcanvas context
var canvas,ctx;

// Variables to keep track of the mouse position and left-button status 
var mouseX,mouseY,mouseDown=0;
var prevMouseX = -1, prevMouseY = -1;
var prevAngle = 0;

// Draws a dot at a specific position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
function drawDot(ctx,x,y,size) {
	// Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
	r=0; g=0; b=0; a=255;

	// Select a fill style
	ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
	ctx.strokeStyle = 'Red';
	
	// Draw a filled circle
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.PI*2, true); 
	ctx.closePath();
	ctx.fill();
	
	if (prevMouseX >=0 && prevMouseY >=0) {
		ctx.beginPath();
		ctx.moveTo(prevMouseX, prevMouseY);
		ctx.lineTo(x, y);
		ctx.closePath();
		ctx.stroke();
	}
	currentPath.push({x:x, y: canvas.height - y});
	
	prevMouseX = x;
	prevMouseY = y;
} 

// Clear the canvas context using the canvas width and height
function clearCanvas(canvas,ctx) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	pathArray = [];
	currentPath = [];
	prevMouseX = -1, prevMouseY = -1, prevAngle = 0;
	
}

// Keep track of the mouse button being pressed and draw a dot at current location
function sketchpad_mouseDown() {
	mouseDown=1;
	currentPath = [];
	drawDot(ctx,mouseX,mouseY,2);
}

// Keep track of the mouse button being released
function sketchpad_mouseUp() {
	mouseDown=0;
	
	if (currentPath.length > 0) {
		pathArray.push(currentPath);
	}
	currentPath = [];
	
	prevMouseX = -1, prevMouseY = -1;
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function sketchpad_mouseMove(e) { 
	// Update the mouse co-ordinates when moved
	getMousePos(e);
	
	
	// Draw a dot if the mouse button is currently being pressed
	if (mouseDown==1 && ((Math.abs(mouseX - prevMouseX) > 10) || (Math.abs(mouseY - prevMouseY) > 10))) {
		drawDot(ctx,mouseX,mouseY,2);
	}
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
	if (!e)
		var e = event;

	if (e.offsetX) {
		mouseX = e.offsetX;
		mouseY = e.offsetY;
	}
	else if (e.layerX) {
		mouseX = e.layerX;
		mouseY = e.layerY;
	}
}

function buildRobotPath() {
	var dist = 0;
	var angle = 0;
	var prevX = 0;
	var prevY = 0;
	var x = 0;
	var y = 0;
	var prevAngle = 0;
	var moveAngle = 0;
	var absoluteAngle = 0;
	var penDown = false;
	var ii = 0;
	var jj = 0;
	
	if (pathArray.length === 0) {
		return;
	}
	
	initRobot(document.getElementById("scale").value);
	
	// Ensure pen is up
	pen(false);
	
	for (ii = 0; ii < pathArray.length; ii++) {
		var aPath = pathArray[ii];
		
		for (jj = 0; jj < aPath.length; jj++) {
			var aPoint =  aPath[jj];
			
			x = aPoint.x;
			y = aPoint.y;
			
			dist = getDistance(x,y,prevX,prevY);
			absoluteAngle = getAngle(x,y,prevX,prevY);
			moveAngle = absoluteAngle - prevAngle;
			
			moveRobot(dist,moveAngle);
			
			prevAngle = absoluteAngle;
			prevX = x;
			prevY = y;
			
			// Arrived at destination, ensure pen is down
			if (!penDown) {
				pen(true);
				penDown = true;
			}
		}
		// Raise pen while moving to next path
		pen(false);
		penDown = false;
	}
	
	// Take car back to zero
	x = 0;
	y = 0;
	dist = getDistance(x,y,prevX,prevY);
	absoluteAngle = getAngle(x,y,prevX,prevY);
	moveAngle = absoluteAngle - prevAngle;
	
	moveRobot(dist,moveAngle);
	
	// Resets orientation
	moveRobot(0, -absoluteAngle);
	
	sendPathToRobot();
}

// Set-up the canvas and add our event handlers after the page has loaded
function initialise() {
	// Get the specific canvas element from the HTML document
	canvas = document.getElementById('sketchpad');

	// If the browser supports the canvas tag, get the 2d drawing context for this canvas
	if (canvas.getContext)
		ctx = canvas.getContext('2d');

	// Check that we have a valid context to draw on/with before adding event handlers
	if (ctx) {
		canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
		canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
		window.addEventListener('mouseup', sketchpad_mouseUp, false);
	}
}
