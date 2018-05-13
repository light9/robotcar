// Wemos D1 Mini Motor Shield library
load('api_i2c.js');

let i2cBus = I2C.get();

let D1Motor = {
  MOTOR_A: 0,
  MOTOR_B: 1,
  
  SHORT_BRAKE: 0,
  CCW: 1,
  CW: 2,
  STOP: 3,
  
  // TODO: Standby is not enabled at the moment
  
  // ## **`D1Motor.create(addr, motor, freq)`**
  // Create an initialized object with the given I2C address, motor and frequency
  // Return value: empty object on error, motor object to use later if successful
  create: function(addr, motor, freq) {
    // D1 Mini Motor Shield has specific pins for I2C
    // Should be enabled in mos.yml, in case it couldn't, uncomment this
    // Cfg.set({i2c:{enable:true,sda_gpio:4,scl_gpio:5}});
    
    let result  = {};
    
    if (addr >= 0x2D && addr <= 0x30) {
      result.address  = addr;
    } else {
      return {};
    }
    
    result.motor = motor;
    result.frequency = freq;
    result.isMoving = false;
    
    let bytes = '';
    
    bytes += chr((freq >> 24) & 0x0f);
    bytes += chr((freq >> 16) & 0xff);
    bytes += chr((freq >> 8) & 0xff);
    bytes += chr(freq & 0xff);
    
    let attempts = 0;
    
    while (!I2C.write(i2cBus, result.address, bytes, bytes.length, true) && attempts < 5) {
      Sys.usleep(5000);
      attempts += 1;
    }
    
    if (attempts < 5) {
      return result;
    } else {
      return {};
    }
  },

  // ## **`D1Motor.move(handle, dir, val)`**
  // Moves defined motor in given direction & speed
  // The handle passed in should be the same returned by D1Motor.create()
  // Return value: true if successful.
  move: function(handle, dir, speed) {
    let pwm = speed * 100;
    
    if (pwm < 0) {
      pwm = 0;
    } else if (pwm > 10000) {
      pwm = 10000;
    }
    if (handle.address === undefined || handle.motor === undefined ) {
      return;
    }
    
    handle.isMoving = (dir === 1) || (dir === 2);
    
    let bytes = '';
    
    bytes += chr((handle.motor & 0xff) | 0x10);
    bytes += chr(dir & 0xff);
    bytes += chr((pwm >> 8) & 0xff);
    bytes += chr(pwm & 0xff);
    
    let attempts = 0;
    
    while (!I2C.write(i2cBus, handle.address, bytes, bytes.length, true) && attempts < 5) {
      Sys.usleep(5000);
      attempts += 1;
    }
    
    return (attempts < 5);
  },

  // ## **`D1Motor.stop(handle)`**
  // Stops defined motor
  // Return value: true if successful.
  stop: function(handle) {
    // print("Stopping motor",handle.motor);
    return this.move(handle,this.SHORT_BRAKE,0);
  },
  
  // ## **`D1Motor.resetCounter(pin)`**
  // Increments step counting & calls back
  // Return value: none.
  incrementCounter: function(handle) {
    handle.counter  += 1;
    if (handle.counterCallback === null) {
      // print("Null increment callback");
      return;
    }
    handle.counterCallback(handle);
  },
  
  // ## **`D1Motor.resetCounter(pin)`**
  // Resets step counting
  // Return value: none.
  resetCounter: function(handle) {
    handle.counter  = 0;
    if (handle.counterCallback === null) {
      return;
    }
    
    handle.counterCallback(handle);
  },
  
  // ## **`D1Motor.enableCounter(pin)`**
  // Enable step counting
  // Return value: none.
  enableCounter: function(handle,pin) {
    handle.pin = pin;
    handle.counter = 0;
    handle.targetCount = 0;
    handle.stopCallback = null;
    handle.counterCallback = function(handle) {
      // print("Opto step on motor", handle.motor,"count",handle.counter,"target",handle.targetCount);
      
      if (handle.counter >= handle.targetCount) {
        if (D1Motor.stop(handle)) {
          handle.counter = 0;
          if (handle.stopCallback !== null) {
            handle.stopCallback(handle);
          }
        }
      }
    };
    
    GPIO.set_mode(pin, GPIO.MODE_INPUT);
    GPIO.set_int_handler(pin, GPIO.INT_EDGE_ANY, function(pin,handle) {
      D1Motor.incrementCounter(handle);
    }, handle);
    GPIO.enable_int(pin);
  },
  
  // ## **`D1Motor.disableCounter(pin)`**
  // Disable step counting
  // Return value: none.
  disableCounter: function(handle) {
    GPIO.disable_int(handle.pin);
    this.resetCounter(handle);
  },

  // ## **`D1Motor.moveTo(handle, dir, speed, count)`**
  // Moves defined motor in given direction & speed, for count steps
  // The handle passed in should be the same returned by D1Motor.create()
  // Return value: true if successful.
  moveTo: function(handle, dir, speed, count,callback) {
  	if (handle.isMoving) { return false; }
  	
    handle.counter = 0;
    handle.targetCount = count;
    handle.stopCallback = function(handle) {
      print("Stop callback for motor",handle.motor);
    };
    
    return this.move(handle,dir,speed);
  }
};
