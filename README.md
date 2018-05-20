# Driving an off-the-shelf car robot

## Overview

This app uses Mongoose OS to drive a small off-the-shelf car robot.

It's compatible with the ESP32 dev boards, tested with the following:

 - Wemos LOLIN32 & DRV8833 module

in the original project, building up from the [Playground project](https://github.com/pmanna/mongoose_os_playground) and retaining some of the features, while adding new specific functions.

The app has been developed as a support for the [CoderDojo](https://coderdojo.com) Ninjas' projects at Croke Park, Dublin.

In its latest developments, the car's chassis has been built via a 3D printer: the files are on [Thingiverse](https://www.thingiverse.com/thing:2895966) and on [Tinkercad](https://www.tinkercad.com/things/gGIWb2aqz0D)

## Usage

- Install and start [mos tool](https://mongoose-os.com/software.html)
- Follow instructions in [Mongoose OS Docs](https://mongoose-os.com/docs/book/build.html)
- Point a browser to the board address, and start experimenting!

## Extras

The app enables the mDNS capability: this to ease future remote access without the need to know the actual IP address of the microcontroller board. It also uses GPIO 0 as a WiFi reset: when briefly taken to 0, network connection is reset to Access Point.

## Other

The CoderDojo logo is used according to [their terms](http://kata.coderdojo.com/wiki/CoderDojo_Logos_and_Brand_Guidelines)

