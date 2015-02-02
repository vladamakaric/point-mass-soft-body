var ViewController = function(){

	var theCanvas; 
	var form; 
	var c;
	var simulation;

	var maxKoef = 1000;
	var minKoef = 1;
	var koefScaleF =1/140; 

	var minSPS = 1;
	var maxSPS = 100;
	var stepsPerSecond = 30;

	var elasticKoef = 500;
	var dampingKoef = 500;

	var simUpdate = true;
	var togglePause = false;
	var resetShape = false;
	var mouseClick = false;

	var mousePressed = false;
	var moveParticles = false;

	var mousePosition=new Vec2(0,0);

	var init = function(){
		form = document.getElementById("myForm");
		theCanvas = document.getElementById("myCanvas");
		c = theCanvas.getContext("2d");
		setUIProperties();
	}

	var setUIProperties = function(){
		form.sps.max = maxSPS;
		form.sps.max = maxSPS;
		form.dk.min = minKoef;
		form.dk.max = maxKoef;
		form.ek.min = minKoef;
		form.ek.max = maxKoef;
		form.sps.value = stepsPerSecond;
		form.dk.value = dampingKoef;
		form.ek.value = elasticKoef;
		form.clickAction.value = 'force';
		
		form.shapeSelect.value = '1';
		form.intgr.value = '1';
		var onRadioGroupChange = function (){
			if(form.clickAction.value === 'pos')
				moveParticles = true;
			else
				moveParticles = false;
		}

		document.getElementById('rbPos').onclick = onRadioGroupChange;
		document.getElementById('rbForce').onclick = onRadioGroupChange;
		

		function mouseClickEH(event)
		{
		  mouseClick = true;
		  simUpdate = true;
		} 

		function mouseMove(event){
		  var x = event.clientX;
		  var y = event.clientY;
		  x -= theCanvas.offsetLeft;
		  y -= theCanvas.offsetTop;

		  mousePosition = new Vec2(x,y);
		}

		function mouseDown(event){
			mousePressed = true;


		}
		function mouseUp(event){
			mousePressed = false;
		}

		theCanvas.addEventListener("click", mouseClickEH, false);
		theCanvas.addEventListener("mousemove", mouseMove, false);
		theCanvas.addEventListener("mousedown", mouseDown, false);
		theCanvas.addEventListener("mouseup", mouseUp, false);
		theCanvas.addEventListener ("mouseout", mouseUp, false);
		form.sps.oninput = function(){
			stepsPerSecond = form.sps.value;
		}
		
		form.dk.oninput = function(){
			dampingKoef = form.dk.value;
			simUpdate = true;
		}

		form.ek.oninput = function(){
			elasticKoef = form.ek.value;
			simUpdate = true;
		}
		form.resetShape.onclick = function(){
			resetShape = true;
			simUpdate = true;
		}

		form.togglePause.onclick = function(){
			togglePause = true;
			simUpdate = true;
		}

		form.intgr.onchange = function() {
			simulation.changeIntegrator(parseInt(form.intgr.value));
		}

		form.shapeSelect.onchange = function(){
			simulation.changeShapeCreator(parseInt(form.shapeSelect.value));
			resetShape = true;
			simUpdate = true;
		}
	}

	var updateSimulation=function(){

		if(mouseClick){
			mouseClick = false;
			if(moveParticles){
				simulation.moveParticles(mousePosition);
			}
		}


		if(resetShape){
			resetShape = false;
			simulation.resetShape();
		}

		if(togglePause){

			togglePause = false;
			simulation.togglePause();
		}

		var em =Math.exp( (elasticKoef-maxKoef/2)*koefScaleF);
		var dm =Math.exp( (dampingKoef-maxKoef/2)*koefScaleF);
		simulation.setKoefMultipliers(em,dm); 	
	}

	this.getWidth = function() {return theCanvas.width; };
	this.getHeight = function() {return theCanvas.height; };

	this.setSimulation = function(simul) { simulation = simul; };

	this.render = function(){
		c.clearRect(0,0, theCanvas.width, theCanvas.height);

		if(simUpdate === true){
			updateSimulation();
			simUpdate = false;
		}

		if(mousePressed && !moveParticles){
			var force = mousePosition.subV(simulation.getParticlesCM());
			simulation.applyForceToShape(force);
		}
		simulation.iterate(1/stepsPerSecond);

		var  penvlp= simulation.getParticleEnvelope();

		c.beginPath();
		c.moveTo(penvlp[0].position.x, penvlp[0].position.y); 
		for(var i = 1; i<penvlp.length; i++){
			c.lineTo(	penvlp[i].position.x, penvlp[i].position.y);
		}
		c.lineTo(penvlp[0].position.x, penvlp[0].position.y); 

		c.strokeStyle = '#44C400';
		c.lineWidth = 3;
		c.stroke();

		
		c.strokeStyle = '#F35434';
		c.fillStyle='#F35434';
		if(!moveParticles && mousePressed)
		DRAW.drawArrow(c,simulation.getParticlesCM(),mousePosition,true);
	}

	init();
}
