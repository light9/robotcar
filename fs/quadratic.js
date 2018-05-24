var canvas = null;
var context = null;
var xyFactor = 20;   	
var xyRange = 0;
var xyStep = 10;

var a = 0;
var b = 0;
var c = 0;

function initVariables(){

	a = document.getElementById("a").value;
	b = document.getElementById("b").value;
	c = document.getElementById("c").value;
	
	initRobot(document.getElementById("scale").value);
}

function initialise() {
	setupCanvas();
}

function generate(){
	var output = "";
	var dist = 0;
	var angle = 0;
	var prevX = -xyRange+1;
	var prevY = -xyRange+1;
	var x = 0;
	var y = 0;
	var prevAngle = 0;
	var moveAngle = 0;
	var absoluteAngle = 0;
	var penDown = false;
	
	initVariables();
	
	// Ensure pen is up
	pen(false);
	
	// Assume the car is at the starting point
	
	if (fullCheck()){
		for(x = -xyRange+1; x <= xyRange; x += xyStep) {
			y = getQuadratic(x / xyFactor);
			
			if (y < -xyRange || y > xyRange) continue;
			
			dist = getDistance(x,y,prevX,prevY);
			absoluteAngle = getAngle(x,y,prevX,prevY);
			moveAngle = absoluteAngle - prevAngle;
			
			moveRobot(dist,moveAngle);
			
			printDot(x,y,"red",5);
			
			prevAngle = absoluteAngle;
			prevX = x;
			prevY = y;
			
			// Arrived at destination, ensure pen is down
			if (!penDown) {
				pen(true);
				penDown = true;
			}
		}
		
		// Raise pen again
		pen(false);
		
		// Take car back to zero
		x = -xyRange+1;
		y = -xyRange+1;
		dist = getDistance(x,y,prevX,prevY);
		absoluteAngle = getAngle(x,y,prevX,prevY);
		moveAngle = absoluteAngle - prevAngle;
		
		moveRobot(dist,moveAngle);
		
		// Resets orientation
		moveRobot(0, -absoluteAngle);
	} else {
		alert("Invalid input/s, please use integers and stay within the ranges");
	}
}
