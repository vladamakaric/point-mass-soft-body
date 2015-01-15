var theCanvas = document.getElementById("myCanvas");
var time = 0;
c = theCanvas.getContext("2d");
c.fillStyle = "blue";

var render = function(timestamp){
	c.clearRect(0,0, theCanvas.width, theCanvas.height);
	var x=time;
	var y=0;

	c.fillRect(x,y,100,200);
	time+=1;
	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
