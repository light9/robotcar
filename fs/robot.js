var robotPenPin = 4;
var robotPath = [];
var robotScale = 5.0;
var robotSpeed = 50;

function initRobot(scale) {
	robotScale = scale;
	robotPath = [];
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
// 	console.log(robotPath);
	
 	motorFollowPath(1, robotSpeed, robotPath);
}
