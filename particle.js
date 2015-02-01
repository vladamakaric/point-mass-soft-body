var MODEL = (function(pi) { 

	pi.Particle = function(invMass, position, velocity){
		var compoundForce = new Vec2(0,0);

		this.invMass = invMass;
		this.position = position;
		this.velocity = velocity || new Vec2(0,0); 

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

	return pi;
})(MODEL || {});
