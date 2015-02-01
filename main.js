window.onload = pmsbMain;

function pmsbMain(){

	var theCanvas = document.getElementById("myCanvas");
	var form = document.getElementById("myForm");

	var time = 0;
	var speed = 60;
	form.speed.value = speed;
	c = theCanvas.getContext("2d");
	c.fillStyle = "blue";

	form.speed.onchange = function(){
		speed = parseInt(form.speed.value);
		console.log(speed);
	};



	var simulation = new MODEL.Simulation(theCanvas.width, theCanvas.height);
	simulation.start();

	var render = function(timestamp){
		c.clearRect(0,0, theCanvas.width, theCanvas.height);

		simulation.iterate(1/speed);
		var particles = simulation.getParticles();

		particles.forEach(function(e){

      c.beginPath();
      c.arc(e.position.x, e.position.y, 2, 0, 2 * Math.PI, false);
      c.fillStyle = 'green';
      c.fill();

		});


	//	console.log(time);
		window.requestAnimationFrame(render);
	}
	window.requestAnimationFrame(render);
}


