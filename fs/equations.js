

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

//	console.log("getAngle x1,y1 = "+x1+","+y1+" x2,y2 = "+x2+","+y2+"xDist = "+xDist+ "yDist = "+yDist+" angle " + angle);

	return angle;	
}

function getQuadratic(x){
	var y = (a * x * x) + (b * x) + (c * 1);

	return y;
}