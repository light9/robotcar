// Mongoose OS RobotCar JavaScript for the browser

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
      var hostLabel = document.getElementById("hostname");
      
      host = dns_host.replace('??????', mac_id) + '.local';
      if (hostLabel !== null) {
        hostLabel.innerHTML = host;
      }
    }
  });
}

// Move the motor

function motorForward(speed) {
  if (speed < 40) {
    speed = 40;
  }
  
  callRPCService('Robot.Move', { dir: 1, speed: speed }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function motorBackward(speed) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.Move', { dir: 2, speed: speed }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function motorMoveForwardBy(speed, steps) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.MoveTo', { speed: speed, dir: 1, count: steps }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function motorRotateBy(speed, angle) {
  if (speed < 40) {
    speed = 40;
  }

  callRPCService('Robot.RotateBy', { speed: speed, angle: angle }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}


function motorFollowPath(dir, speed, commands) {
  if (speed < 40) {
    speed = 40;
  }
  
  callRPCService('Robot.Path', { speed: speed, dir: dir, path: commands }, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

// Full stop to motor
function motorStop() {
  callRPCService('Robot.Stop', {}, function (response) {
    if (response != null && response.error !== undefined) {
      alert(response.message);
    }
  });
}

function servoSet(pin, angle) {
  callRPCService('Servo.Set', {pin: pin, angle: angle}, function (response) {
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

