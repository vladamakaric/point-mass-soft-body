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

		var shapeCreatorArray;

		var self = this;

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
			integrator = euler;
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

					console.log('ek = ', e.elasticKoef);
					e.applyForce();

					e.elasticKoef = oldEK;
					e.dampingKoef = oldDK;
				}
				else
					e.applyForce();
			});
		}
		 
		var euler = function(dt){
			applyForcesToAllParticles();

			particles.forEach(function(p) {
				p.position = p.position.addV(p.velocity.mulS(dt));
				p.velocity = p.velocity.addV(p.getForce().mulS(dt).mulS(p.invMass));
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

		shapeCreatorArray = [square, square, shapeC1];
		var collisionDetection = function(){
			particles.forEach(function(e){

				var frictionK = 0.95;
				if(e.position.y > height){
					e.position.y = height;
					e.velocity.y *=-1*frictionK; 
				}

				if(e.position.y < 0){
					e.position.y = 0;
					e.velocity.y *=-1*frictionK; 
				}

				if(e.position.x > width){
					e.position.x = width;
					e.velocity.x *=-1*frictionK; 
				}

				if(e.position.x < 0){
					e.position.x = 0;
					e.velocity.x *=-1*frictionK; 
				}
			});

		}
	}

	return pi;
})(MODEL || {});
