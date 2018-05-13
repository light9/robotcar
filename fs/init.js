load('api_config.js');
load('api_math.js');
load('api_gpio.js');
load('api_sys.js');
load('api_rpc.js');
load('api_pwm.js');
load('api_timer.js');
load('queue.js');
load('drv_motor.js');
//load('d1motor.js');

let platform = Cfg.get('device.platform');

let queue = Queue;
queue.create();

let MotorDriver = DRVMotor;
let motorAddress = 12;
//let MotorDriver = D1Motor;
//let motorAddress = 0x30;

let motorRight = MotorDriver.create(motorAddress, MotorDriver.MOTOR_A, 1000);
let motorLeft = MotorDriver.create(motorAddress, MotorDriver.MOTOR_B, 1000);

let LEFT_PHOTO = 16;
let RIGHT_PHOTO = 17;
let degreesPerStep = 5.0;

MotorDriver.enableCounter(motorRight,RIGHT_PHOTO);
MotorDriver.enableCounter(motorLeft,LEFT_PHOTO);

function interpretCommand(command) {
  if(command.type === "move") {
    MotorDriver.move(motorLeft,command.args.dir1,command.args.speed1);
    MotorDriver.move(motorRight,command.args.dir2,command.args.speed2)
  }
  
  if (command.type === "moveto") {
    MotorDriver.moveTo(motorLeft,command.args.dir1,command.args.speed1,command.args.count1);
    MotorDriver.moveTo(motorRight,command.args.dir2,command.args.speed2,command.args.count2);
  }
  
  if (command.type === "rotate") {
    let args = command.args;
    let dir1 = (args.angle >= 0 ? 2 : 1);
    let dir2 = (args.angle >= 0 ? 1 : 2);
    let steps = Math.abs(args.angle / degreesPerStep);
    
    MotorDriver.moveTo(motorLeft,dir1,args.speed, steps);
    MotorDriver.moveTo(motorRight,dir2,args.speed, steps);
  }
}

// Call every 200 msecs, check queue and send command if not empty and motor stopped
Timer.set(200, Timer.REPEAT, function(motors) {
  if (!motorRight.isMoving && !motorLeft.isMoving) {
    if (!queue.isEmpty()) {
      interpretCommand(queue.first());
    
      queue.remove();
    }
  }
}, null);

RPC.addHandler('Robot.Move', function(args) {
  if (typeof(args) === 'object' &&
    typeof(args.speed1) === 'number' && typeof(args.speed2) === 'number' &&
    typeof(args.dir1) === 'number'&& typeof(args.dir2) === 'number') {
    
    queue.add({"type":"move","args":args});
    
    /*
    return {
      success: MotorDriver.move(motorLeft,args.dir1,args.speed1) &&
        MotorDriver.move(motorRight,args.dir2,args.speed2)
    };
    */
  } else {
    return {error: -1, message: 'Bad request. Expected: {"dir1": 0-3,"speed1": 0-100,"dir2": 0-3,"speed2": 0-100}'};
  }
});

RPC.addHandler('Robot.MoveTo', function(args) {
  if (typeof(args) === 'object' &&
    typeof(args.speed1) === 'number' && typeof(args.speed2) === 'number' &&
    typeof(args.dir1) === 'number'&& typeof(args.dir2) === 'number' &&
    typeof(args.count1) === 'number'&& typeof(args.count2) === 'number') {
    
    queue.add({"type":"moveto","args":args});
    /*
    return {success: MotorDriver.moveTo(motorLeft,args.dir1,args.speed1,args.count1) &&
          MotorDriver.moveTo(motorRight,args.dir2,args.speed2,args.count2)
    };
    */
  } else {
    return {error: -1, message: 'Bad request. Expected: {"dir1": 0-3,"speed1": 0-100,"dir2": 0-3,"speed2": 0-100}'};
  }
});

RPC.addHandler('Robot.Rotate', function(args) {
  if (typeof(args) === 'object' &&
    typeof(args.speed) === 'number' && typeof(args.angle) === 'number') {
    
    queue.add({"type":"rotate","args":args});
    /*
    let dir1 = (args.angle >= 0 ? 2 : 1);
    let dir2 = (args.angle >= 0 ? 1 : 2);
    let steps = Math.abs(args.angle / degreesPerStep);
    
    return {success: MotorDriver.moveTo(motorLeft,dir1,args.speed, steps) &&
          MotorDriver.moveTo(motorRight,dir2,args.speed, steps)};
    */
  } else {
    return {error: -1, message: 'Bad request. Expected: {"dir1": 0-3,"speed1": 0-100,"dir2": 0-3,"speed2": 0-100}'};
  }
});

RPC.addHandler('Robot.Stop', function(args) {
  motorLeft.speed = 0;
  motorRight.speed = 0;
  
  while (!queue.isEmpty()) {
    queue.remove();
  }
  return {success: MotorDriver.stop(motorLeft) && MotorDriver.stop(motorRight)};
});

RPC.addHandler('Robot.isMoving', function(args) {
  return { result: motorLeft.isMoving && motorRight.isMoving };
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
         "dir1":dir,"speed1":speed,"count1":aCommand.count,
         "dir2":dir,"speed2":speed,"count2":aCommand.count
        }
      });
    } else if (aCommand.type === "rotate") {
      queue.add({
        "type": aCommand.type,"args":{
          "speed":speed,"angle":aCommand.angle
        }
      });
    }
  }
  
  return { success: true };
});

RPC.addHandler('Robot.Test', function(args) {
  // Test by doing a square
  queue.add({"type":"moveto","args":{"dir1":1,"speed1":70,"count1":100,"dir2":1,"speed2":70,"count2":100}});
  queue.add({"type":"rotate","args":{"speed":70,"angle":90}});
  queue.add({"type":"moveto","args":{"dir1":1,"speed1":70,"count1":100,"dir2":1,"speed2":70,"count2":100}});
  queue.add({"type":"rotate","args":{"speed":70,"angle":90}});
  queue.add({"type":"moveto","args":{"dir1":1,"speed1":70,"count1":100,"dir2":1,"speed2":70,"count2":100}});
  queue.add({"type":"rotate","args":{"speed":70,"angle":90}});
  queue.add({"type":"moveto","args":{"dir1":1,"speed1":70,"count1":100,"dir2":1,"speed2":70,"count2":100}});
  queue.add({"type":"rotate","args":{"speed":70,"angle":90}});
  
  return { success: true };
});

// Servo RPC call
RPC.addHandler('Servo.Set', function(args) {
  let frequency = 50;
  let dutyMin = 0.025;
  let dutyRange = 0.09;
  
  if (typeof(args) === 'object' && typeof(args.pin) === 'number' && typeof(args.angle) === 'number') {
    if (args.angle >= 0 && args.angle <= 180) {
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
