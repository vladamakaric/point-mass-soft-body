//element.addEventListener ("mouseout", myFunction, false);
var DRAW = (function () {

	function drawArrow(ctx,fromPoint,toPoint,stroked){
		var dx = toPoint.x - fromPoint.x;
		var dy = toPoint.y - fromPoint.y;

		// normalize
		var length = Math.sqrt(dx * dx + dy * dy);
		var unitDx = dx / length;
		var unitDy = dy / length;
		// increase this to get a larger arrow head
		var arrowHeadSize = 15;

		var arrowPoint1 = new Vec2(
			(toPoint.x - unitDx * arrowHeadSize - unitDy * arrowHeadSize),
			(toPoint.y - unitDy * arrowHeadSize + unitDx * arrowHeadSize));
		var arrowPoint2 = new Vec2(
			(toPoint.x - unitDx * arrowHeadSize + unitDy * arrowHeadSize),
			(toPoint.y - unitDy * arrowHeadSize - unitDx * arrowHeadSize));
		ctx.fillStyle = "rgba(100, 0, 200, 0.5)";
		// Drawing Arrow Line.
		ctx.beginPath();
		ctx.moveTo(fromPoint.x,fromPoint.y);
		ctx.lineTo(toPoint.x,toPoint.y);
		ctx.closePath();
		ctx.lineWidth = 3;
		ctx.stroke();
		if(stroked)
		strokeArrowHead(ctx,toPoint,arrowPoint1,arrowPoint2);
		else
		arrowHeadLines(ctx,toPoint,arrowPoint1,arrowPoint2);
	}
// Drawing Arrow Head Stroked.
	function strokeArrowHead(ctx,toPoint,arrowPoint1,arrowPoint2){
		ctx.beginPath();
		ctx.moveTo(toPoint.x,toPoint.y);
		ctx.lineTo(arrowPoint1.x,arrowPoint1.y);
		ctx.lineTo(arrowPoint2.x,arrowPoint2.y);
		ctx.lineTo(toPoint.x,toPoint.y);
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.stroke();
	}
	function arrowHeadLines(ctx,toPoint,arrowPoint1,arrowPoint2){
		ctx.beginPath();
		ctx.moveTo(arrowPoint1.x,arrowPoint1.y);
		ctx.lineTo(toPoint.x,toPoint.y);
		ctx.lineTo(arrowPoint2.x,arrowPoint2.y);
		ctx.stroke();
	}
  
	return {drawArrow: drawArrow};
})();
