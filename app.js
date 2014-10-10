var traktorF1 = require('./traktor_f1');
var tinycolor = require('tinycolor2');
var leap = require('leapjs');
var _ = require('underscore');

/*var Canvas = require('canvas');

var canvas = new Canvas(4,4),
	ctx = canvas.getContext('2d');

ctx.strokeStyle="rgba(255,0,0,1)";
ctx.fillStyle="rgba(0,0,255,1)";
ctx.lineWidth = 0.5;
ctx.lineCap = 'square';
ctx.beginPath();
ctx.moveTo(0.5,0.5);
ctx.arcTo(3.5,0.5,3.5,3.5,3);
ctx.lineTo(0.5,3.5);
ctx.closePath();
ctx.fill();
ctx.stroke();*/


var f1 = new traktorF1.TraktorF1();

var layers = [];

var Layer = function() {
	this.active = false;
	this.editing = false;
	this.brightness = 0;

	this.colors = [];
	this.timing = {};
	this.effect = function() {};
	this.group = {};
};

Layer.prototype.isActive = function() {
	return this.active && !!this.brightness;
}


var BeatManager = function() {


};

var userLayer = 0;


f1.on('l1:pressed', function(e) {
	setUserLayer(0);
});
f1.on('l2:pressed', function(e) {
	setUserLayer(1);
});
f1.on('l3:pressed', function(e) {
	setUserLayer(2);
});
f1.on('l4:pressed', function(e) {
	setUserLayer(3);
});

var setUserLayer = function(layerNum) {
	f1.setLED('l1_l',0);
	f1.setLED('l2_l',0);
	f1.setLED('l3_l',0);
	f1.setLED('l4_l',0);
	f1.setLED('l'+(layerNum+1)+'_l',1);
};


var bpm = 128;

f1.setLCDDot("l",1);
var string = "Anna KILL EM ALL";


f1.on('browse:pressed',function(e) {
	f1.setLED('browse',1);
	f1.setLED('sync',1);
	f1.setLED('quant',1);
	f1.setLED('capture',1);
	f1.setLED('shift',1);
	f1.setLED('reverse',1);
	f1.setLED('type',1);
	f1.setLED('size',1);
});
f1.on('browse:released',function(e) {
	f1.setLED('browse',0);
	f1.setLED('sync',0);
	f1.setLED('quant',0);
	f1.setLED('capture',0);
	f1.setLED('shift',0);
	f1.setLED('reverse',0);
	f1.setLED('type',0);
	f1.setLED('size',0);
});

var current = 0;

var bpmChanged = false;
f1.on('stepper:step',function(e) {
	if(e.direction == 1) {
		bpm++;
	}
	else {
		bpm--;
	}
	/*bpmChanged = true;
	f1.setLCDString(Number(bpm%100).toString());
	f1.setLCDDot("l",(bpm >= 100));
	f1.setLCDDot("r",(bpm >= 200));
	*/
	f1.setLCDString(string.substr(bpm%(string.length-1),2));

});

f1.setLED("l1_r",1);
f1.setLED("l2_r",1);
f1.setLED("l3_r",1);
f1.setLED("l4_r",1);


//f1.setRGB('p1',0,1,0);

var count = 0;
var beatFirstHalf = true;



var beatPulse = function() {
	if(beatFirstHalf)
		f1.setLED('sync',1);
	else
		f1.setLED('sync',0);
	beatFirstHalf = !beatFirstHalf;
	setTimeout(beatPulse,30000/bpm);
};


var beatFirstHalf2 = true;

var beatPulse2 = function() {
	if(beatFirstHalf2)
		f1.setLED('quant',1);
	else
		f1.setLED('quant',0);
	beatFirstHalf2 = !beatFirstHalf2;
	if(bpmChanged) {
		clearInterval(pulseInterval);
		pulseInterval = setInterval(beatPulse2,30000/bpm);
		bpmChanged = false;
	}
};

var pulseInterval = setInterval(beatPulse2,30000/bpm);

beatPulse();
beatPulse2();



var hue=0, sat=0, val=0, dist = 1;

var setRGBsToCanvas = function() {
	/*var pixels = ctx.getImageData(0,0,4,4).data;
	console.log(pixels);
	for(var i=0; i<16; i++) {
		var pixIndex = i*4;
		var alpha = pixels[pixIndex+3]/255;
		f1.setRGB('p'+(i+1),alpha*pixels[pixIndex],alpha*pixels[pixIndex+1],alpha*pixels[pixIndex+2]);		
	}*/
};


var setAllRGBs = function() {
	for(var a=1; a<=16; a++) 
		f1.setRGB('p'+a,0,0,0);
	var colors = tinycolor.analogous(tinycolor({h:hue,s:sat,v:val}),16,dist);
	for(var a=0, b=0; a < 16; a++, b = (b+1)%colors.length) {
		//var c = (Math.floor(a/4)+b)%4;
		var c = b;
		f1.setRGB('p'+(a+1),colors[c]._r,colors[c]._g,colors[c]._b);		
	}
};

f1.on('s1:changed',function(e) {
	hue = e.value*360;
	setAllRGBs();
});

f1.on('s2:changed',function(e) {
	sat = e.value;
	setAllRGBs();
});

f1.on('s3:changed',function(e) {
	val = e.value;
	setAllRGBs();
});

f1.on('s4:changed',function(e) {
	dist = Math.floor(e.value*100)+1;
	setAllRGBs();
});

var flashOffCount = 0;

setInterval(function() {
	if(flashOffCount < 5) {
		f1.setLED('shift',0);
		flashOffCount++;
	}
	else {
		f1.setLED('shift',0.5);
		flashOffCount = 0;
	}
},25);

var strobeInteravl = null;
var strobeOffCount = 0;

f1.on('shift:pressed',function() {
	strobeInterval = setInterval(function() {
		if(strobeOffCount < 3) {
			for(var a=1; a<=16; a++) 
				f1.setRGB('p'+a,0,0,0);
			strobeOffCount++;			
		}
		else {
			for(var a=1; a<=16; a++) 
				f1.setRGB('p'+a,255,255,255);
			strobeOffCount = 0;
		}
	},25);
});

f1.on('shift:released',function(e) {
	if(!!strobeInterval)
		clearInterval(strobeInterval);
});

f1.on('reverse:pressed',setRGBsToCanvas);

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}
/*
var controller = new leap.Controller()
controller.on("frame", function(frame) {
	//console.log(frame.data.r[0]);
	var rData = frame.data.r[0];
	var tData = frame.data.r[0];
	hue = ((rData[1]+1)/2)*360;
	sat = Math.abs((tData[1]+1)/2)/400;
	val = Math.abs((tData[2]+1)/2)/400;
	setAllRGBs();
});

var frameCount = 0;
controller.on("frame", function(frame) {
  frameCount++;
});

controller.on('ready', function() {
    console.log("ready");
});
controller.on('connect', function() {
    console.log("connect");
});
controller.on('disconnect', function() {
    console.log("disconnect");
});
controller.on('focus', function() {
    console.log("focus");
});
controller.on('blur', function() {
    console.log("blur");
});
controller.on('deviceConnected', function() {
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    console.log("deviceDisconnected");
});

controller.connect();
console.log("\nWaiting for device to connect...");



*/