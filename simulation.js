var MODEL = (function(pi) { 

	pi.Simulation = function(width,height){
		var running = false;
		var particleEnvelope = null;
		var innerSpringPairs = null;

		var forceGenerators =[];
		var particles =[];

		var dampingM;
		var elasticM;

		var integrator;
		var shapeCreator;

		var integratorArray;
		var shapeCreatorArray;

		var self = this;

		this.changeIntegrator = function(index){
			integrator = integratorArray[(index-1)%integratorArray.length];
		}
		this.changeShapeCreator = function(index) {
			shapeCreator = shapeCreatorArray[(index-1)%shapeCreatorArray.length];
		}

		this.setKoefMultipliers = function(em,dm) {
			dampingM = dm;
			elasticM = em;
		}

		this.getParticleEnvelope = function() { return particleEnvelope; }
		this.getParticles = function(){
			return particles;
		}

		this.start = function(){
			running = true;
			shapeCreator();
		}

		this.iterate = function(dt){
			if(!running) return;
			
			integrator(dt);

			//air drag
			particles.forEach(function(e){
				e.velocity = e.velocity.mulS(0.99);
			});
			clearForces();
			collisionDetection();
		}

		this.resetShape = function(){ shapeCreator(); };
		this.togglePause = function() {running = !running;}

		this.applyForceToShape = function(force){
			particles.forEach(function(p) {
				p.addForce(force);
			});
		}
		this.moveParticles = function(vec) {
			moveParticleCM(vec);
		}

		var clearForces=function(){
		  for(i=0;i<particles.length;i++){
				particles[i].resetForce(); 
		  }
		}

		var applyForcesToAllParticles = function() {
			forceGenerators.forEach(function(e) {
				if(e instanceof MODEL.SpringFG){
					var oldEK = e.elasticKoef;
					var oldDK = e.dampingKoef;


					e.elasticKoef *= elasticM;
					e.dampingKoef *= dampingM;

					e.applyForce();

					e.elasticKoef = oldEK;
					e.dampingKoef = oldDK;
				}
				else
					e.applyForce();
			});
		}
		 
		var getDeepParticlesCopy = function() {
			var particles2 = particles.slice(0);
			for(var i=0; i<particles2.length; i++){
				particles2[i] = particles2[i].clone();
			}
			return particles2;
		}

		var RK2 = function(dt){
			var t0particles = getDeepParticlesCopy();

			applyForcesToAllParticles();

			particles.forEach(function(p) {
				p.position = p.position.addV(p.velocity.mulS(dt/2));
				p.velocity = p.velocity.addV(p.getForce().mulS(p.invMass).mulS(dt/2));
			});

			applyForcesToAllParticles();

			for(var i=0; i<particles.length; i++){
				particles[i].position = t0particles[i].position.addV(particles[i].velocity.mulS(dt));
				particles[i].velocity = t0particles[i].velocity.addV(
						particles[i].getForce().mulS(particles[i].invMass).mulS(dt));
			}
		 }

		var RK4 = function(dt){

			var t0Particles = getDeepParticlesCopy();	

			function addK(k,koef){
				for(var i=0; i<particles.length; i++){
					particles[i].position = t0Particles[i].position.addV(k.v[i].mulS(dt*koef));
					particles[i].velocity = t0Particles[i].velocity.addV(k.a[i].mulS(dt*koef));
				}		
			}

			k1 = {v: [], a: []};
			k2 = {v: [], a: []};
			k3 = {v: [], a: []};
			k4 = {v: [], a: []};
			
			applyForcesToAllParticles();
			saveCurrentDerivs(k1);

			addK(k1,1/2);

			applyForcesToAllParticles();
			saveCurrentDerivs(k2);
			
			addK(k2,1/2);

			applyForcesToAllParticles();
			saveCurrentDerivs(k3);

			addK(k3,1);
			
			applyForcesToAllParticles();
			saveCurrentDerivs(k4);
				
			for(var i=0; i<particles.length; i++){
				var dv = k1.v[i].addV(k2.v[i].mulS(2).addV(k3.v[i].mulS(2).addV(k4.v[i]))).mulS(dt/6);
				var da = k1.a[i].addV(k2.a[i].mulS(2).addV(k3.a[i].mulS(2).addV(k4.a[i]))).mulS(dt/6);

				particles[i].position = t0Particles[i].position.addV(dv); 
				particles[i].velocity = t0Particles[i].velocity.addV(da);
			}


		}

		var saveCurrentDerivs = function(k) {
			for(var i=0; i<particles.length; i++){
				k.v[i] = particles[i].velocity;
				k.a[i] = particles[i].getForce().mulS(particles[i].invMass);
			}
		}

		var euler = function(dt){
			applyForcesToAllParticles();

			particles.forEach(function(p) {
				p.position = p.position.addV(p.velocity.mulS(dt));
				p.velocity = p.velocity.addV(p.getForce().mulS(p.invMass).mulS(dt));
			});
		  }

		var shapeC1 = function(){
			var prtkl = new MODEL.Particle(1,new Vec2(30,30), new Vec2(10,0));
			var prtkl2 = new MODEL.Particle(0, new Vec2(100,100));
			
			particles = [prtkl, prtkl2];
			var gravityFG = new MODEL.GravityFG(particles);
			var spring1 = new MODEL.SpringFG(prtkl, prtkl2, 2, 2);
			forceGenerators = [gravityFG, spring1];

			particleEnvelope = [prtkl,prtkl2];
		}

		this.getParticlesCM = function() {
			var cm= new Vec2(0,0);
			particles.forEach(function(e){
				cm = cm.addV(e.position);	
			});

			cm = cm.divS(particles.length);

			return cm;
		}
		
		var moveParticleCM = function(newCMPosition) {
			var cm = self.getParticlesCM();
			
			var dispFromCM = newCMPosition.subV(cm);

			particles.forEach(function(e){
				e.position = e.position.addV(dispFromCM);
			});
		}

		var rope = function(){
		
			var anchorPosition = new Vec2(width/2,50);
			var anchorP = new MODEL.Particle(0, anchorPosition);

			var linkNum = 5;
			var chainLenght = 160;

			var linkLenght = chainLenght/linkNum;

			var prevP = anchorP;
			particles = [anchorP];
			forceGenerators = [];

			particleEnvelope = [];
			for(var i=0; i<linkNum; i++){
				var newP = new MODEL.Particle(1, new Vec2(anchorPosition.x, anchorPosition.y + (i+1)*linkLenght));
				var newSpring = new MODEL.SpringFG(prevP, newP, 7.2,15);

				particles.push(newP);
				forceGenerators.push(newSpring);

				particleEnvelope.push(prevP);
				particleEnvelope.push(newP);
				prevP = newP;
			}

			var gravityFG = new MODEL.GravityFG(particles);
			forceGenerators.push(gravityFG);
		}

		var hexagon = function() { circleCreator(6,70, [], 122, 10, 122, 7); } 
		var circle = function() { circleCreator(24, 70, [2, 4], 30, 10, 40, 7); }

		var circleCreator = function(num, r, supportStringIntervals, ekfCenter, dkfCenter, ekfPerim, dkfPerim) {
			var dangle = Math.PI*2/num;
			var centerPcl =new MODEL.Particle(0.2, new Vec2(0,0)); 

			particles = [centerPcl]; 
			
			forceGenerators = [];
			particleEnvelope = [];
			var prevPcl = null; 

			for(var i=0; i<num; i++){
				
				var pcl = new MODEL.Particle(1,	new Vec2(
					r*Math.cos(dangle*i),r*Math.sin(dangle*i)));

				var springC = new MODEL.SpringFG(pcl, centerPcl,ekfCenter,dkfCenter);

				particles.push(pcl);
				forceGenerators.push(springC);

				if(prevPcl!=null){
					var spring = new MODEL.SpringFG(prevPcl, pcl, ekfPerim,dkfPerim);
					forceGenerators.push(spring);
					
					particleEnvelope.push(prevPcl);
					particleEnvelope.push(pcl);
				}

				
				prevPcl = pcl;
			}
			
			particleEnvelope.push(particles[1]);
			particleEnvelope.push(particles[num]);

			var spring = new MODEL.SpringFG(particles[1], particles[num], ekfPerim,dkfPerim);
			forceGenerators.push(spring);
	
			supportStringIntervals.forEach(function(interval){
				for(var i=0; i<num;i++){
					var prtkl1 = particles[i+1];
					var prtkl2 = particles[(i+interval)%num + 1];
					
					var spring = new MODEL.SpringFG(prtkl1, prtkl2, ekfPerim,dkfPerim);
					forceGenerators.push(spring);
				}
			});
			
			moveParticleCM(new Vec2(width/2, height/2));
		
			var gravityFG = new MODEL.GravityFG(particles);
			forceGenerators.push(gravityFG);
		}

		var square = function(){
			var positions = [ new Vec2(-50,-50), new Vec2(50,-50), 
							  new Vec2(50,50), new Vec2(-50,50)];

			particles = [new MODEL.Particle(1,positions[0]), 
					  	new MODEL.Particle(1,positions[1]),	 
					  	new MODEL.Particle(1,positions[2]),	 
					  	new MODEL.Particle(1,positions[3])];	 
			 
			moveParticleCM(new Vec2(width/2, height/2));
			forceGenerators = [new MODEL.GravityFG(particles)];

			for(var i = 0; i<particles.length-1; i++){
				for(var j = i+1; j<particles.length; j++){
					forceGenerators[forceGenerators.length] = new MODEL.SpringFG(
							particles[i], particles[j], 15, 0.6);
				}
			}

			particleEnvelope = [];
			for(var i = 0; i<particles.length; i++){
				particleEnvelope.push(particles[i]);
				particleEnvelope.push(particles[(i+1)%particles.length]);
			}
		}

		shapeCreatorArray = [square, hexagon, circle, rope];
		integratorArray = [euler, RK2, RK4];

		var collisionDetection = function(){
			particles.forEach(function(e){

				var collisionFriction = 0.95;
				
				var slidingFriction = 0.94;
				
				if(e.position.y > height){
					e.position.y = height;
					if(e.velocity.y>0)
					e.velocity.y *=-1*collisionFriction; 
				
					e.velocity.x *= slidingFriction;
				}

				if(e.position.y < 0){
					e.position.y = 0;
					if(e.velocity.y <0)
					e.velocity.y *=-1*collisionFriction; 
					e.velocity.x *= slidingFriction;
				}

				if(e.position.x > width){
					e.position.x = width;
					if(e.velocity.x >0)
					e.velocity.x *=-1*collisionFriction; 
					e.velocity.y *= slidingFriction;
				}

				if(e.position.x < 0){
					e.position.x = 0;
					if(e.velocity.x <0)
					e.velocity.x *=-1*collisionFriction; 
					e.velocity.y *= slidingFriction;
				}
			});
		}
	}

	return pi;
})(MODEL || {});
