var MODEL = (function(pi) { 

	pi.Simulation = function(width,height){

		var running = false;
		var particleEnvelope = null;
		var innerSprings = null;

		var forceGenerators =[];
		var particles =[];

		this.getParticles = function(){
			return particles;
		}

		this.start = function(){
			
			var prtkl = new MODEL.Particle(1,new Vec2(30,30), new Vec2(10,0));
			var prtkl2 = new MODEL.Particle(0, new Vec2(100,100));
			
			particles = [prtkl, prtkl2];
			var gravityFG = new MODEL.GravityFG(particles);
			var spring1 = new MODEL.SpringFG(prtkl, prtkl2, 2, 2);
			forceGenerators = [gravityFG, spring1];
			running = true;
		}

		this.iterate = function(dt){
			if(!running) return;
			
			clearForces();
			integrator(dt);
			collisionDetection();
		}

		this.togglePause = function() {running = !running;}

		var clearForces=function(){
		  for(i=0;i<particles.length;i++){
				particles[i].resetForce(); 
		  }
		}

		var euler = function(dt){
			forceGenerators.forEach(function(e) {
				e.applyForce();
			});
			
			particles.forEach(function(p) {
				p.position = p.position.addV(p.velocity.mulS(dt));
				p.velocity = p.velocity.addV(p.getForce().mulS(dt).mulS(p.invMass));
			});
		  }

		var collisionDetection = function(){

			particles.forEach(function(e){

				if(e.position.y > height){
					e.position.y = height;
					e.velocity.y *=-1; 
				}

				if(e.position.y < 0){
					e.position.y = 0;
					e.velocity.y *=-1; 
				}

				if(e.position.x > width){
					e.position.x = width;
					e.velocity.x *=-1; 
				}

				if(e.position.x < 0){
					e.position.x = 0;
					e.velocity.x *=-1; 
				}
			});

		}
		var integrator = euler;
	}

	return pi;
})(MODEL || {});
