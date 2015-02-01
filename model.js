var MODEL = (function () {

	  function Particle(mass, position, velocity){

		var compoundForce = new Vec2(0,0);

		this.mass = mass;
		this.position = position;
		this.velocity = velocity; 

		this.addForce=function(force){
			compoundForce =  compoundForce.addV(force);
		}

		this.getForce = function() {
			return compoundForce;		
	  	}

		this.resetForce=function(){
			compoundForce.set(0,0);
		}
	  }

  var SpringFG = function (particleA, particleB) {
  };

  var GravityFG = function(particleArray){
	  var gravity = new Vec2(0,10);
	  var particles = particleArray;
	  this.applyForce = function(){
		  particles.forEach(function(e){

				e.addForce(gravity);

		  });
	  }
 }

 	var Simulation = function(width,height){
		var running = false;

		var particleEnvelope = null;
		var innerSprings = null;

		var forceGenerators =[];
		var particles =[];

		this.getParticles = function(){
			return particles;
		}

		this.start = function(){
			var prtkl = new Particle(1,new Vec2(30,30), new Vec2(10,0));
			var gravityFG = new GravityFG([prtkl]);
			particles = [];
			forceGenerators = [];
			forceGenerators[0] = gravityFG;
			particles[0] = prtkl;
			running = true;
		}

		this.iterate = function(dt){
			if(!running) return;
			
		  	clearForces();
			integrator(dt);
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
				p.velocity = p.velocity.addV(p.getForce().mulS(dt));
			});
		  }

		var integrator = euler;
	}
  
  return {
    Simulation: Simulation
  };

})();
