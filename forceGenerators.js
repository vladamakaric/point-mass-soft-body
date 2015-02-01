var MODEL = (function(pi) { 

	pi.SpringFG = function (particleA, particleB ,ek, dk, restDist) {

		if(!restDist){
			var aToB = particleB.position.subV(particleA.position);	
			restDist = aToB.length();
		}

		this.applyForce = function(){
			var aToB = particleB.position.subV(particleA.position);	
		
			var currDist = aToB.length();
			
			var dx = currDist - restDist;
	
			aToB.normalize();
			
			var forceOnADueToEK = aToB.mulS(dx*ek);

			var velOfAProjToSpring = aToB.dot(particleA.velocity);	
			var velOfBProjToSpring = aToB.dot(particleB.velocity);	

			var dv = velOfAProjToSpring- velOfBProjToSpring;

			var forceOnADueToDK = aToB.mulS(-dv);

			var forceOnA = forceOnADueToEK.addV(forceOnADueToDK);

			particleA.addForce(forceOnA);
			particleB.addForce(forceOnA.mulS(-1));
		}
	}

	pi.GravityFG = function(particleArray){
	  var gravityAcc = new Vec2(0,40);
	  var particles = particleArray;
	  this.applyForce = function(){
		  particles.forEach(function(e){

			  	var gravityForce = gravityAcc.mulS(e.invMass);
				e.addForce(gravityForce);

		  });
	  }
	}

	return pi;
})(MODEL || {});