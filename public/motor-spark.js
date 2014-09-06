var Spark = require("spark-io");
var five = require("johnny-five"),
    board, myMotor, led;

board = new five.Board({
  io: new Spark({
    token: process.env.SPARK_TOKEN,
    deviceId: process.env.SPARK_DEVICE_ID
  })
});

board.on("ready", function() {
  myMotor = new five.Motor({
    pin: "A1"
  });

  // event handler on start
  myMotor.on("start", function( err, timestamp ) {
    console.log( "started", timestamp );

    // stop after 2 seconds
    board.wait(2000, function() {
      myMotor.stop();
    });
  });

  // event handler on stop
  myMotor.on("stop", function( err, timestamp ) {
    console.log( "stopped", timestamp );
  });

  // start motor on new message - speed argument (between 0 and 255) is optional
  myMotor.start(250);

  // motor's method can be accessed on Node REPL
  this.repl.inject({
    myMotor: myMotor
  });
});
