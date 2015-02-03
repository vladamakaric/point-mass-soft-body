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

	var touches = [];
	var mousePosition=new Vec2(0,0);

	var lastDropPos;
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


		var rbPos = document.getElementById('rbPos');
		rbPos.onclick = function(){moveParticles = true;};

		var rbForce =document.getElementById('rbForce');
		rbForce.onclick = function(){moveParticles = false;};

		rbForce.checked = !moveParticles;	
		rbPos.checked = moveParticles;

		function getMousePos(e) {

			if (e.touches !== undefined && e.touches.length == 1) {
				return {x: e.touches[0].pageX, y: e.touches[0].pageY};	
			}
			else {
				return {x: e.pageX, y: e.pageY};	
			}
		}

		function findPos(obj) {
			var curleft = 0, curtop = 0;
			if (obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				} while (obj = obj.offsetParent);
				return { x: curleft, y: curtop };
			}
			return undefined;
		}

		function mouseMove(event){
			var mpos = getMousePos(event);	
			var canvPos = findPos(theCanvas);
			var x = mpos.x-canvPos.x;
			var y = mpos.y-canvPos.y;
			mousePosition = new Vec2(x,y);
		}

		function mouseDown(event){
			mousePressed = true;
			mouseMove(event);
		}

		function touchStart(event){
			mouseDown(event);
		}

		function mouseUp(event){
			mousePressed = false;
		}
	
		function mouseOut(event){
			mousePressed = false;
		}

		function mouseClickEH(event){
			mouseDown = true;
			mouseClick = true;	
			simUpdate = true;
			mouseMove(event);
		}

		theCanvas.addEventListener("touchmove", function(event) { event.preventDefault(); mouseMove(event);},false);
		theCanvas.addEventListener("touchstart",touchStart,false);
		theCanvas.addEventListener("touchend",mouseUp,false);
		theCanvas.addEventListener("click", mouseClickEH, false);
		theCanvas.addEventListener("mousemove", mouseMove, false);
		theCanvas.addEventListener("mousedown", mouseDown, false);
		theCanvas.addEventListener("mouseup", mouseUp, false);
		theCanvas.addEventListener ("mouseout", mouseOut, false);

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

	this.setSimulation = function(simul) { 
		simulation = simul;
		form.shapeSelect.value = '1';
		form.intgr.value = '3';
		simulation.changeIntegrator(3);
		simulation.changeShapeCreator(1);
	};

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
		for(var i = 0; i<penvlp.length-1; i=i+2){
			c.moveTo(penvlp[i].position.x, penvlp[i].position.y); 
			c.lineTo(penvlp[i+1].position.x, penvlp[i+1].position.y);
		}

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
