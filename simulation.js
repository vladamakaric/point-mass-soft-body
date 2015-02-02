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
			integrator = integratorArray[0];
			shapeCreator = shapeCreatorArray[0];
			running = true;
			shapeCreator();
		}

		this.iterate = function(dt){
			if(!running) return;
			
			integrator(dt);
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

		var circle = function(){
			var num = 14;
			var dangle = Math.PI*2/num;
			var r = 70;

			var centerPcl =new MODEL.Particle(0.5, new Vec2(0,0)); 
			particles = [centerPcl]; 

			forceGenerators = [];
			var prevPcl = null; 
			for(var i=0; i<num; i++){
				
				var pcl = new MODEL.Particle(1,	new Vec2(
					r*Math.cos(dangle*i),r*Math.sin(dangle*i)));

				var springC = new MODEL.SpringFG(pcl, centerPcl,4,4);

				particles.push(pcl);
				forceGenerators.push(springC);

				if(prevPcl!=null){
					var spring = new MODEL.SpringFG(prevPcl, pcl, 8,2);
					forceGenerators.push(spring);
				}

				prevPcl = pcl;
			}
			
			var spring = new MODEL.SpringFG(particles[1], particles[num], 2,2);
			forceGenerators.push(spring);
		
			moveParticleCM(new Vec2(width/2, height/2));
		
			var gravityFG = new MODEL.GravityFG(particles);
			forceGenerators.push(gravityFG);

			particleEnvelope = particles.slice(1,particles.length);
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
							particles[i], particles[j], 2, 2);
				}
			}

			particleEnvelope = particles;
		}

		shapeCreatorArray = [square, circle, shapeC1];
		integratorArray = [euler, RK2, RK2];
		var collisionDetection = function(){
			particles.forEach(function(e){

				var collisionFriction = 0.95;
				
				var slidingFriction = 0.97;
				
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
