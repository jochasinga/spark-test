var spark = require("spark");

spark.login({
    username: 'jo.chasinga@gmail.com',
    password: 'Python7321'
});

spark.on('login', function(err, body) {
    console.log("API call completed on Login event: ", body);
    
    var myDevices = spark.listDevices();
    var devicesPr = spark.getAttributesForAll();

    devicesPr.then(
	function(data){
	    console.log('Core attrs retrieved successfully:', data);
	},
	function(err) {
	    console.log('API call failed: ', err);
	}
    );
    
    myDevices.then(
	function(devices) {
	    console.log("My device: ", devices[0]);

	    devices[0].signal(function(err, data) {
		if (err) {
		    console.log('Error sending a signal to the core:', err);
		} else {
		    console.log('Core signal sent successfully:', data);
		}
	    });

	    devices[0].call('blinky', 'on', function(err, data) {
		if (err) {
		    console.log("An error occurred: ", err);
		} else {
		    console.log("Function called successfully: ", data);
		}
	    });
	},
        function(err) {
	    console.log("List devices call failed", err);
	}
    );
});		


    


