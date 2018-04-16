// Mongoose OS Caterpillar JavaScript for the browser

var platform = '';
var host = '';

// Common call to RPC services on the board
function callRPCService(cmd, params, callback) {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.response);
    }
  };

  xhttp.open('POST', 'rpc/' + cmd, true);
  xhttp.setRequestHeader('Cache-Control', 'no-cache');
  xhttp.setRequestHeader('Accept', 'application/json');
  xhttp.responseType = 'json';
  xhttp.send(JSON.stringify(params));
}

// Discover which platform we're using, to enable/disable features
function startup() {
  callRPCService('Config.Get', {}, function (response) {
    if (response != null) {
      platform = response.device.platform;
      console.log('Platform is: ' + platform);

      var mac_id = (response.device.id.split("_"))[1];
      var dns_host = response.dns_sd.host_name;

      host = dns_host.replace('??????', mac_id) + '.local';
      document.getElementById("hostname").innerHTML = host;
    }
  });
}

// Read a value from ADC
function adcReadValue() {
  var pin = parseInt(document.getElementById("ADC.pin").value);

  callRPCService('ADC.Enable', { pin: pin }, function (response) {
    if (response == null) {
      return;
    }
    callRPCService('ADC.Read', { pin: pin }, function (response) {
      if (response != null) {
        if (response.error !== undefined) {
          alert(response.message);
        } else {
          document.getElementById("ADC.value").value = response.value;
        }
      }
    });
  });
}

// Move the motor
let speedOffset = 0;

function motorForward(speed) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.Move', { dir1: 2, dir2: 2, speed1: speed + speedOffset, speed2: speed }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function motorBackward(speed) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.Move', { dir1: 1, dir2: 1, speed1: speed + speedOffset, speed2: speed }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function motorLeft(speed) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.Move', { dir1: 2, dir2: 1, speed1: speed + speedOffset, speed2: speed }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function motorRight(speed) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.Move', { dir1: 1, dir2: 2, speed1: speed + speedOffset, speed2: speed }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

// Full stop to motor
function motorStop() {
  callRPCService('Robot.Move', { dir1: 3, dir2: 3, speed1: 10, speed2: 10 }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

// Reboots the microcontroller
function rebootDevice() {
  callRPCService('Sys.Reboot', { delay_ms: 500 }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

