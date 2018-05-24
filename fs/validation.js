
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
	
	return ret;
}

function isInt(value) {
	var x = parseFloat(value);

	return !isNaN(value) && (x | 0) === x;
}

function fullCheck() {
	return inputcheck() && rangeCheck();
}
