load('api_config.js');
load('api_math.js');
load('api_gpio.js');
load('api_sys.js');
load('api_rpc.js');
load('api_pwm.js');
load('api_timer.js');
load('queue.js');
load('drv_drive.js');

let platform = Cfg.get('device.platform');

let queue = Queue;
queue.create();

let MotorDriver = DRVDrive;
let motorAddress = 12;

let motors = MotorDriver.create(motorAddress, 100);

let LEFT_PHOTO = 16;
let RIGHT_PHOTO = 17;

MotorDriver.enableCounter(motors,LEFT_PHOTO);

function interpretCommand(command) {
  if(command.type === "move") {
    MotorDriver.move(motors,command.args.dir,command.args.speed);
  }
  
  if (command.type === "moveto") {
    MotorDriver.moveTo(motors,command.args.dir,command.args.speed,command.args.count);
  }
  
  if (command.type === "rotate") {
    MotorDriver.rotateBy(motors,command.args.angle,command.args.speed);
  }
  
  if (command.type === "pen") {
      let frequency = 50;
      let dutyMin = 0.025;
      let dutyRange = 0.09;
      let angle = command.args.down ? 100 : 10;
      
      PWM.set(command.args.pin,frequency,dutyMin + dutyRange * (angle / 180.0));
  }
}

// Call every 500 msecs, check queue and send command if not empty and motor stopped
Timer.set(500, Timer.REPEAT, function() {
  if (!motors.isMoving) {
    if (!queue.isEmpty()) {
      interpretCommand(queue.first());
    
      queue.remove();
    }
  }
}, null);

RPC.addHandler('Robot.Move', function(args) {
  if (typeof(args) === 'object' &&
    typeof(args.speed) === 'number' && typeof(args.dir) === 'number') {
    
    queue.add({"type":"move","args":args});
    
    /*
    return {
      success: MotorDriver.move(motors,args.dir,args.speed)
    };
    */
  } else {
    return {error: -1, message: 'Bad request. Expected: {"dir": 0-3,"speed": 0-100}'};
  }
});

RPC.addHandler('Robot.MoveTo', function(args) {
  if (typeof(args) === 'object' &&
    typeof(args.speed) === 'number' && typeof(args.dir) === 'number' && typeof(args.count) === 'number') {
    
    queue.add({"type":"moveto","args":args});
    /*
    return {success: MotorDriver.moveTo(motors,args.dir,args.speed,args.count)};
    */
  } else {
    return {error: -1, message: 'Bad request. Expected: {"dir": 0-3,"speed": 0-100,"count": 1-N'};
  }
});

RPC.addHandler('Robot.RotateBy', function(args) {
  if (typeof(args) === 'object' &&
    typeof(args.speed) === 'number' && typeof(args.angle) === 'number') {
    
    queue.add({"type":"rotate","args":args});
    /*
    return {success: MotorDriver.rotateBy(motors,args.angle,args.speed)};
    */
  } else {
    return {error: -1, message: 'Bad request. Expected: {"dir1": 0-3,"speed1": 0-100,"dir2": 0-3,"speed2": 0-100}'};
  }
});

RPC.addHandler('Robot.Stop', function(args) {
  motors.speed = 0;
  
  while (!queue.isEmpty()) {
    queue.remove();
  }
  return {success: MotorDriver.stop(motors)};
});

RPC.addHandler('Robot.isMoving', function(args) {
  return { result: motors.isMoving };
});

RPC.addHandler('Robot.Path', function(args) {
  let dir = args.dir;
  let speed = args.speed;
  let ii;
  
  for(ii = 0; ii < args.path.length; ii++) {
    let aCommand = args.path[ii];
    
    if (aCommand.type === "moveto") {
      queue.add({
       "type": aCommand.type,"args":{
         "dir":dir,"speed":speed,"count":aCommand.count
        }
      });
    } else if (aCommand.type === "rotate") {
      queue.add({
        "type": aCommand.type,"args":{
          "speed":speed,"angle":aCommand.angle
        }
      });
    } else if (aCommand.type === "pen") {
      queue.add({
        "type": aCommand.type,"args":{
          "pin": aCommand.pin, "down":aCommand.down
        }
      });
    }
  }
  
  return { success: true };
});

RPC.addHandler('Robot.Test', function(args) {
  // Test by doing a square
  queue.add({"type":"moveto","args":{"dir":1,"speed":60,"count":50}});
  queue.add({"type":"rotate","args":{"speed":60,"angle":90}});
  queue.add({"type":"moveto","args":{"dir":1,"speed":60,"count":50}});
  queue.add({"type":"rotate","args":{"speed":60,"angle":90}});
  queue.add({"type":"moveto","args":{"dir":1,"speed":60,"count":50}});
  queue.add({"type":"rotate","args":{"speed":60,"angle":90}});
  queue.add({"type":"moveto","args":{"dir":1,"speed":60,"count":50}});
  queue.add({"type":"rotate","args":{"speed":60,"angle":90}});
  
  return { success: true };
});

// Servo RPC call
RPC.addHandler('Servo.Set', function(args) {
  if (typeof(args) === 'object' && typeof(args.pin) === 'number' && typeof(args.angle) === 'number') {
    if (args.angle >= 0 && args.angle <= 180) {
      let frequency = 50;
      let dutyMin = 0.025;
      let dutyRange = 0.09;
  
      return {success: PWM.set(args.pin,frequency,dutyMin + dutyRange * (args.angle / 180.0))};
    }
  } else {
    return {error: -1, message: 'Bad request. Expected: {"pin": num,"angle":N}'};
  }
});

// Button is wired to GPIO pin 0
// When brought to 0, it resets WiFi to AP
GPIO.set_button_handler(Cfg.get('pins.button'), GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  Cfg.set({wifi: {sta: {enable: false}, ap: {enable: true}}});  // Enable WiFi AP mode, disable STA
  
  print("Reset to Access Point mode");
  
  Sys.reboot(100000);
}, null);
