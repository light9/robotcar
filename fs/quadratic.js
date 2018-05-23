var canvas = null;
var context = null;
var xyFactor = 20;   	
var xyRange = 0;
var xyStep = 10;

var robotPenPin = 4;
var robotPath = [];
var robotScale = 1.0;

function clearCanvas() {
	var h = canvas.height;
	var w = canvas.width;	
	var halfH = h / 2;
	var halfW = w / 2;
	
	context.clearRect(-halfW, -halfH, w, h);
	
	context.lineWidth = 1;
	
	context.beginPath();
	context.moveTo(-halfW,0);
	context.lineTo(halfW,0);
	context.closePath();
	context.stroke();

	context.beginPath();
	context.moveTo(0,-halfH);
	context.lineTo(0,halfH);
	context.closePath();
	context.stroke();

	context.lineWidth = 7;
	context.strokeRect(-halfW, -halfH, w, h);
}

function setupCanvas() {
	canvas = document.getElementById('myCanvas');
	context = canvas.getContext('2d');
	
	var h=parseInt(canvas.height);
	var w=parseInt(canvas.width);	
	
	xyRange = w/2;// eg 600/2 gives range of -300 to + 300

	context.fillStyle = "#9ea7b8";
	context.fillRect(0,0,w,h);
	context.translate(h/2,w/2);
	
	clearCanvas();
}

function printDot(thix,thiy,tcolor,tsize) {
	var myx = thix;
	var myy = -1*thiy;

	context.beginPath();
	context.rect(myx, myy, tsize, tsize);
	context.closePath();
	context.fillStyle = tcolor;
	context.fill();
}

var a = 0;
var b = 0;
var c = 0;

function fullCheck() {
	return inputcheck() && rangeCheck();
}

function initialise() {
	clearCanvas();
	
	a = document.getElementById("a").value;
	b = document.getElementById("b").value;
	c = document.getElementById("c").value;
	
	robotScale = document.getElementById("scale").value;
	robotPath = [];
}

function getDistance(x1,y1,x2,y2) {
	var dist = 0;

	dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
//	alert("getDistance x1,y1 = "+x1+","+y1+" x2,y2 = "+x2+","+y2+" dist = " + dist);

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

//	console.log("getAngle x1,y1 = "+x1+","+y1+" x2,y2 = "+x2+","+y2+"xDist = "+xDist+ "yDist = "+yDist+" angle " + angle);

	return angle;	
}

function getQuadratic(x){
	var y = (a * x * x) + (b * x) + (c * 1);

//	alert("getQuadratic x = "+x + ", y = "+ y);

	return y;
}

function generate(){
	var output = "";
//	var range = 10;
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
	
	initialise();
	
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
		
		sendPathToRobot();
	} else {
		alert("Invalid input/s, please use integers and stay within the ranges");
	}
}

function pen(upOrDown) {
	robotPath.push({type:"pen", down: upOrDown, pin: robotPenPin});
}

function moveRobot(dist,angle){
	// Ensures angle is the minimum it could be
	if (angle < -180) {
		angle += 360;
	} else if (angle > 180) {
		angle -= 360;
	}
	
	robotPath.push({type:"rotate", angle: Math.round(angle)});
	if (dist > 0) {
		robotPath.push({type:"moveto", count: Math.round(dist / robotScale)});
	}
}

function sendPathToRobot() {
	console.log(robotPath);
	
// 	motorFollowPath(1, 50, robotPath);
}

function rangeCheck() {
	var ret = true;
	
	var myaMax = document.getElementById("amax").value;
	var myaMin = document.getElementById("amin").value;
	
	var mybMax = document.getElementById("bmax").value;
	var mybMin = document.getElementById("bmin").value;
	
	var mycMax = document.getElementById("cmax").value;
	var mycMin = document.getElementById("cmin").value;

	if ((inRange(a,myaMin,myaMax) == true)
		&&(inRange(b,mybMin,mybMax) == true)
		&&(inRange(c,mycMin,mycMax) == true)) {
		ret = true;
	} else {
		ret = false
	}
	
	return ret;
}

function inRange(myVal,myMin,myMax) {
	// alert("inrange check");
	var ret = true;
	myVal = myVal*1;
	
	if ((myVal <= myMax) && (myVal >= myMin)) { 
		ret = true;
	} else {
		ret = false;
	}
	
//	alert("inrange ret is "+ret + "for parameters "+myVal+","+myMin+","+myMax);
	
	return ret;
}

function inputcheck() {
	var ret = true;
	
	if ((isInt(a))
		&& (isInt(b))
		&& (isInt(c))) {
		ret = true; 
	} else {
		ret = false;
	}
//	alert(ret);
//	alert("Checking...");
	
	return ret;
}

function isInt(value) {
	var x = parseFloat(value);

	return !isNaN(value) && (x | 0) === x;
}
