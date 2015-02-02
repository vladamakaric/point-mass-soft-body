window.onload = pmsbMain;

function pmsbMain(){
	var viewController = new ViewController(simulation);
	var simulation = new MODEL.Simulation(viewController.getWidth(), viewController.getHeight());
	viewController.setSimulation(simulation);

	simulation.start();

	var mainLoop = function(timestamp){
		viewController.render();
		window.requestAnimationFrame(mainLoop);
	}
	window.requestAnimationFrame(mainLoop);
}
