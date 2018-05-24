
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

function clearCanvas() {
	var h = canvas.height;
	var w = canvas.width;	
	var halfH = h / 2;
	var halfW = w / 2;
	
	context.fillStyle = "#9ea7b8";
	context.fillRect(-halfW, -halfH, w, h);

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

function printDot(thix,thiy,tcolor,tsize) {
	var myx = thix;
	var myy = -1*thiy;

	context.beginPath();
	context.rect(myx, myy, tsize, tsize);
	context.closePath();
	context.fillStyle = tcolor;
	context.fill();
}
