// DRV8833 Motor Driver library

let DRVDrive = {
  MOTOR_A: 0,
  MOTOR_B: 1,
  
  SHORT_BRAKE: 0,
  CCW: 1,
  CW: 2,
  STOP: 3,
  
  DEGREES_PER_STEP: 5.0,
  
  // TODO: Standby is not enabled at the moment
  
  // ## **`DRVDrive.create(addr, freq)`**
  // Create an initialized object with the given pin address and frequency
  // Return value: empty object on error, motor object to use later if successful
  create: function(initialPin, freq) {
    let result  = {};
    
    result.address  = initialPin;
    
    result.frequency = freq;
    result.isMoving = false;
    result.rotation = 0.0;
    
    PWM.set(initialPin, freq, 0);
    PWM.set(initialPin + 1, freq, 0);
    PWM.set(initialPin + 2, freq, 0);
    PWM.set(initialPin + 3, freq, 0);
    
    return result;
  },
  
  // ## **`DRVDrive.move(handle, dir, val)`**
  // Moves both motors in given direction & speed
  // The handle passed in should be the same returned by DRVDrive.create()
  // Return value: true if successful.
  move: function(handle, dir, speed) {
    let pwm = speed / 100.0;
    
    if (pwm < 0) {
      pwm = 0;
    } else if (pwm > 1.0) {
      pwm = 1;
    }
    if (handle.address === undefined ) {
      return;
    }
    
    // print("PWM:",pwm * 100.0);
    
    handle.isMoving = (dir === this.CCW) || (dir === this.CW);

    if (dir === this.CCW) {
      PWM.set(handle.address, handle.frequency, pwm);
      PWM.set(handle.address + 1, handle.frequency, 0);
      PWM.set(handle.address + 2, handle.frequency, pwm);
      PWM.set(handle.address + 3, handle.frequency, 0);
    } else if (dir === this.CW) {
      PWM.set(handle.address, handle.frequency, 0);
      PWM.set(handle.address + 1, handle.frequency, pwm);
      PWM.set(handle.address + 2, handle.frequency, 0);
      PWM.set(handle.address + 3, handle.frequency, pwm);
    } else {
      PWM.set(handle.address, handle.frequency, 0);
      PWM.set(handle.address + 1, handle.frequency, 0);
      PWM.set(handle.address + 2, handle.frequency, 0);
      PWM.set(handle.address + 3, handle.frequency, 0);
    }
    
    return true;
  },
  
  // ## **`DRVDrive.rotate(handle, dir, val)`**
  // Rotates both motors in opposite direction
  // The handle passed in should be the same returned by DRVDrive.create()
  // Return value: true if successful.
  rotate: function(handle, dir, speed) {
    let pwm = speed / 100.0;
    
    if (pwm < 0) {
      pwm = 0;
    } else if (pwm > 1.0) {
      pwm = 1;
    }
    
    if ((handle.address === undefined) || (dir === 0) || (pwm === 0.0)) {
      return;
    }
    
    handle.isMoving = (dir === this.CCW) || (dir === this.CW);

    if (dir < 0) {
      // Clockwise
      PWM.set(handle.address, handle.frequency, pwm);
      PWM.set(handle.address + 1, handle.frequency, 0);
      PWM.set(handle.address + 2, handle.frequency, 0);
      PWM.set(handle.address + 3, handle.frequency, pwm);
    } else {
      // Counter-clockwise
      PWM.set(handle.address, handle.frequency, 0);
      PWM.set(handle.address + 1, handle.frequency, pwm);
      PWM.set(handle.address + 2, handle.frequency, pwm);
      PWM.set(handle.address + 3, handle.frequency, 0);
    }
    
    return true;
  },
  
  // ## **`DRVDrive.stop(handle)`**
  // Stops defined motor
  // Return value: true if successful.
  stop: function(handle) {
    // print("Stopping motors");
    handle.targetCount = 0;
    handle.countA  = 0;
    handle.countB  = 0;
    
    return this.move(handle,this.SHORT_BRAKE,0);
  },
  
  // ## **`DRVDrive.resetCounter(handle, sensor)`**
  // Increments step counting & calls back
  // Return value: none.
  incrementCounter: function(handle, sensor) {
    if (sensor === this.MOTOR_A) {
      handle.countA  += 1;
    } else if (sensor === this.MOTOR_B) {
      handle.countB  += 1;
    }
    
    if (handle.counterCallback === null) {
      print("Null increment callback");
      return;
    }
    handle.counterCallback(handle);
  },
  
  // ## **`DRVDrive.resetCounter(handle)`**
  // Resets step counting
  // Return value: none.
  resetCounter: function(handle) {
    handle.countA  = 0;
    handle.countB  = 0;
    
    if (handle.counterCallback === null) {
      return;
    }
    
    handle.counterCallback(handle);
  },
  
  // ## **`DRVDrive.enableCounter(handle,pin)`**
  // Enable step counting
  // Return value: none.
  enableCounter: function(handle,pin) {
    handle.pin = pin;
    handle.countA = 0;
    handle.countB = 0;
    handle.targetCount = 0;
    handle.stopCallback = null;
    
    handle.counterCallback = function(handle) {
      print("Opto step on pin", handle.pin,"count A",handle.countA,"count B",handle.countB,"target",handle.targetCount);
      
      if (handle.targetCount === 0) { return; }
      
      if ((handle.countA >= handle.targetCount) && (handle.countB >= handle.targetCount)) {
        if (DRVDrive.stop(handle)) {
          if (handle.stopCallback !== null) {
            handle.stopCallback(handle);
          }
        }
      }
    };
    
    GPIO.set_mode(pin, GPIO.MODE_INPUT);
    GPIO.set_int_handler(pin, GPIO.INT_EDGE_ANY, function(pin,handle) {
      DRVDrive.incrementCounter(handle, DRVDrive.MOTOR_A);
    }, handle);
    GPIO.enable_int(pin);
    
    GPIO.set_mode(pin + 1, GPIO.MODE_INPUT);
    GPIO.set_int_handler(pin + 1, GPIO.INT_EDGE_ANY, function(pin,handle) {
      DRVDrive.incrementCounter(handle,  DRVDrive.MOTOR_B);
    }, handle);
    GPIO.enable_int(pin + 1);
  },
  
  // ## **`DRVDrive.disableCounter(handle)`**
  // Disable step counting
  // Return value: none.
  disableCounter: function(handle) {
    GPIO.disable_int(handle.pin);
    GPIO.disable_int(handle.pin + 1);
    this.resetCounter(handle);
  },
  
  // ## **`DRVDrive.moveTo(handle, dir, speed, count,callback)`**
  // Moves both motors in given direction & speed, for count steps
  // Accepts a callback that's called when the move stops
  // The handle passed in should be the same returned by DRVDrive.create()
  // Return value: true if successful.
  moveTo: function(handle, dir, speed, count,callback) {
    if (handle.isMoving) { return false; }
    
    handle.countA = 0;
    handle.countB = 0;
    handle.targetCount = count;
    
    if ((callback !== null) && (callback !== undefined)) {
      print("Assigning move stop callback ",callback);
      handle.stopCallback = callback;
    } else {
      handle.stopCallback = function(handle) {
        print("Stop callback");
      };
    }
    
    return this.move(handle,dir,speed);
  },
  
  // ## **`DRVDrive.rotateBy(handle, angle, speed,callback)`**
  // Moves both motors in opposite direction & speed, for the given angle
  // The handle passed in should be the same returned by DRVDrive.create()
  // Return value: true if successful.
  rotateBy: function(handle, angle, speed) {
    if (handle.isMoving) { return false; }
    
    handle.rotation += angle;
    
    let absRotation = Math.abs(handle.rotation);
    
    // Only move when angle is significant, accumulate otherwise 
    if (absRotation < this.DEGREES_PER_STEP) {
      return true;
    }
    
    let dir = handle.rotation / absRotation;
    
    handle.countA = 0;
    handle.countB = 0;
    handle.targetCount = Math.floor(absRotation / this.DEGREES_PER_STEP);
    
    // Updates rotation with the remainder
    handle.rotation %= this.DEGREES_PER_STEP;
    
    return this.rotate(handle,dir,speed);
  }
};
