
var robotPenPin = 4;
var robotPath = [];
var robotScale = 1.0;

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
	
	prevMouseX = x;
	prevMouseY = y;
} 

// Clear the canvas context using the canvas width and height
function clearCanvas(canvas,ctx) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	prevMouseX = -1, prevMouseY = -1, prevAngle = 0;
	
//	robotScale = document.getElementById("scale").value;
	robotPath = [];
}

// Keep track of the mouse button being pressed and draw a dot at current location
function sketchpad_mouseDown() {
	mouseDown=1;
	drawDot(ctx,mouseX,mouseY,2);
}

// Keep track of the mouse button being released
function sketchpad_mouseUp() {
	mouseDown=0;
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

function getDistance(x1,y1,x2,y2) {
	var dist = 0;
	
	dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
	
	return dist;
}

function getAngle(x1,y1,x2,y2) {
	var angle = 0;
	var xDist = x1 - x2;
	var yDist = y1 - y2;
	
	// NOTE: According to https://www.w3schools.com/jsref/jsref_atan2.asp
	// Y comes _first_
	angle = Math.atan2(yDist, xDist);
	angle *= 180 / Math.PI;
	
	return angle;	
}

function pen(upOrDown) {
	robotPath.push({type:"pen", down: upOrDown, pin: robotPenPin});
}

function moveRobot(dist,angle){
	robotPath.push({type:"rotate", angle: Math.round(angle)});
	if (dist > 0) {
		robotPath.push({type:"moveto", count: Math.round(dist / robotScale)});
	}
}

function sendPathToRobot() {
	console.log(robotPath);
	
// 	motorFollowPath(1, 50, robotPath);
}

// Set-up the canvas and add our event handlers after the page has loaded
function init() {
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
