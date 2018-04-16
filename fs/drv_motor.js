// DRV8833 Motor Shield library

let DRVMotor = {
  MOTOR_A: 0,
  MOTOR_B: 1,
  
  SHORT_BRAKE: 0,
  CCW: 1,
  CW: 2,
  STOP: 3,
  
  // TODO: Standby is not enabled at the moment
  
  // ## **`DRVMotor.create(addr, motor, freq)`**
  // Create an initialized object with the given I2C address, motor and frequency
  // Return value: empty object on error, motor object to use later if successful
  create: function(initialPin, motor, freq) {
    let result  = {};
    
    result.address  = initialPin;
    
    result.motor = motor;
    result.frequency = freq;
    result.isMoving = false;
    
    PWM.set(initialPin, freq, 0);
    PWM.set(initialPin + 1, freq, 0);
    PWM.set(initialPin + 2, freq, 0);
    PWM.set(initialPin + 3, freq, 0);
    
    return result;
  },

  // ## **`DRVMotor.move(handle, dir, val)`**
  // Moves defined motor in given direction & speed
  // The handle passed in should be the same returned by DRVMotor.create()
  // Return value: true if successful.
  move: function(handle, dir, speed) {
    let pwm = speed / 100.0;
    
    if (pwm < 0) {
      pwm = 0;
    } else if (pwm > 1.0) {
      pwm = 1;
    }
    if (handle.address === undefined || handle.motor === undefined ) {
      return;
    }
    
    // print("Motor",handle.motor,"PWM:",pwm * 100.0);
    
    handle.isMoving = (dir === this.CCW) || (dir === this.CW);
    
    if (handle.motor === this.MOTOR_B) {
    	if (dir === this.CCW) {
    		PWM.set(handle.address + 2, handle.frequency, pwm);
     		PWM.set(handle.address + 3, handle.frequency, 0);
   		} else if (dir === this.CW) {
    		PWM.set(handle.address + 2, handle.frequency, 0);
     		PWM.set(handle.address + 3, handle.frequency, pwm);
   		} else {
    		PWM.set(handle.address + 2, handle.frequency, 0);
     		PWM.set(handle.address + 3, handle.frequency, 0);
   		}
    } else {
    	if (dir === this.CCW) {
    		PWM.set(handle.address, handle.frequency, pwm);
     		PWM.set(handle.address + 1, handle.frequency, 0);
   		} else if (dir === this.CW) {
    		PWM.set(handle.address, handle.frequency, 0);
     		PWM.set(handle.address + 1, handle.frequency, pwm);
   		} else {
    		PWM.set(handle.address, handle.frequency, 0);
     		PWM.set(handle.address + 1, handle.frequency, 0);
   		}
    }
    
    return true;
  },

  // ## **`DRVMotor.stop(handle)`**
  // Stops defined motor
  // Return value: true if successful.
  stop: function(handle) {
    // print("Stopping motor",handle.motor);
    handle.targetCount = 0;
    handle.counter  = 0;
    
    return this.move(handle,this.SHORT_BRAKE,0);
  },
  
  // ## **`DRVMotor.resetCounter(pin)`**
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
  
  // ## **`DRVMotor.resetCounter(pin)`**
  // Resets step counting
  // Return value: none.
  resetCounter: function(handle) {
    handle.counter  = 0;
    if (handle.counterCallback === null) {
      return;
    }
    
    handle.counterCallback(handle);
  },
  
  // ## **`DRVMotor.enableCounter(pin)`**
  // Enable step counting
  // Return value: none.
  enableCounter: function(handle,pin) {
    handle.pin = pin;
    handle.counter = 0;
    handle.targetCount = 0;
    handle.stopCallback = null;
    handle.counterCallback = function(handle) {
      // print("Opto step on motor", handle.motor,"count",handle.counter,"target",handle.targetCount);
      
      if (handle.targetCount === 0) { return; }
      
      if (handle.counter >= handle.targetCount) {
        if (DRVMotor.stop(handle)) {
          handle.counter = 0;
          if (handle.stopCallback !== null) {
            handle.stopCallback(handle);
          }
        }
      }
    };
    
    GPIO.set_mode(pin, GPIO.MODE_INPUT);
    GPIO.set_int_handler(pin, GPIO.INT_EDGE_ANY, function(pin,handle) {
      DRVMotor.incrementCounter(handle);
    }, handle);
    GPIO.enable_int(pin);
  },
  
  // ## **`DRVMotor.disableCounter(pin)`**
  // Disable step counting
  // Return value: none.
  disableCounter: function(handle) {
    GPIO.disable_int(handle.pin);
    this.resetCounter(handle);
  },

  // ## **`DRVMotor.moveTo(handle, dir, speed, count)`**
  // Moves defined motor in given direction & speed, for count steps
  // The handle passed in should be the same returned by DRVMotor.create()
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
