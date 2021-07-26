

//--------------------randomizer functions for shape and position--------------------
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}
function getRandomRange(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomOrientation(shape) {
	orientation = getRandomInt(shape.numOrientations);
	return orientation
}
function getRandomStartX(shape){
	//random start position of shape
	leftOverHang = Math.abs(getShapeLengthNegX(shape.orientations[shape.currentOrientation]));
	rightOverHang = Math.abs(getShapeLengthPosX(shape.orientations[shape.currentOrientation]));
	
	startx = getRandomInt(10 - rightOverHang) - (5 + leftOverHang);
	//startx will never overlap edge on right side, only on left
	if (startx <= -5){
		startx = -4 + leftOverHang;
	}	
	return startx;
}


//-------------------------------------------------------STEP 2: Tile Stack-up----------------------------------------------------------

//--------------------these 4 functions get shape length along specific axis--------------------

//gets lowest y value
function getShapeLengthNegY(vertices){
	currentMin = 2;
	for (i = 0; i < vertices.length; i++){
		currentIndex = 2*i + 1
		
		if(vertices[currentIndex] < currentMin) {
			currentMin = vertices[currentIndex];
		}
	}
	return currentMin;
}
//gets highest y value
function getShapeLengthPosY(vertices){
	currentMax = -10;
	for (i = 0; i < vertices.length; i++){
		currentIndex = 2*i + 1;
		if(vertices[currentIndex] > currentMax) {
			currentMax = vertices[currentIndex]
		}
	}
	return currentMax;
}
	//gets lowest x value
function getShapeLengthNegX(vertices){
	currentMin = 0;
	for (i = 0; i < vertices.length; i++){
		currentIndex = 2*i;
		if(vertices[currentIndex] < currentMin) {
			currentMin = vertices[currentIndex]
		}
	}
	return currentMin;
}
//gets highest x value
function getShapeLengthPosX(vertices){
	currentMax = 0;
	for (i = 0; i < vertices.length; i++){
		currentIndex = 2*i;
		if(vertices[currentIndex] > currentMax) {
			currentMax = vertices[currentIndex]
		}
	}
	return currentMax;
}

//--------------------collision detectors--------------------------


//checks if the currently moving shape collides with stationary shapes
function collision(shape, shapes){
	var detectedCollisions = [];
	var yOverlap = 0;
	////console.log('shapes.length=' + shapes.length)
	
	//check most recent shapes first as they're most likely to collide
	for(var shapeIndex = shapes.length - 1; shapeIndex >= 0; shapeIndex--){
		if(isFrameCollision(shape, shapes[shapeIndex])){
			var collisionResult = isShapeCollision(shape,shapes[shapeIndex]);
			//check if shapes collided, add 
			if(collisionResult.length > 0){
				detectedCollisions.push.apply(detectedCollisions, collisionResult)
			}
		}
	}
	return detectedCollisions;
}
//checks if shapes collide
function isShapeCollision(shape1, shape2){
	//check if shapes are simple or compound
	var shape1Size = 1;
	var shape2Size = 1;
	var results;
	var yOverlap = 0;
	var detectedCollisions = [];
	
	//break up compound shapes to rectangles for comparison
	if (shape1.numVertices == 8){
		results = sectionShape(shape1);
		s1 = results.s1;
		s2 = results.s2;
		shape1Size = 2;
	}
	if (shape2.numVertices == 8){
		results = sectionShape(shape2);
		s3 = results.s1;
		s4 = results.s2;
		shape2Size = 2;
	}
	//pass in objects holding arrays of shape vertices, X and Y, recieve whether there was a collision between the compares shapes
	if(shape1Size == 1 && shape2Size == 1){
		let collisionResult = blockCollisionDetection(
			{vertices: shape1.orientations[shape1.currentOrientation], pivotX: shape1.pivotX, pivotY: shape1.pivotY},
			{vertices: shape2.orientations[shape2.currentOrientation], pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult.collision = true) {
			detectedCollisions.push(collisionResult.yOverlap)
		}
		return detectedCollisions;
	}
	else if (shape1Size == 1 && shape2Size == 2){
		let collisionResult = blockCollisionDetection(
			{vertices: shape1.orientations[shape1.currentOrientation], pivotX: shape1.pivotX, pivotY: shape1.pivotY}, 
			{vertices: s3, pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult.collision = true) {
			detectedCollisions.push(collisionResult.yOverlap)
		}
	
		let collisionResult2 = blockCollisionDetection(
			{vertices: shape1.orientations[shape1.currentOrientation], pivotX: shape1.pivotX, pivotY: shape1.pivotY},
			{vertices: s4, pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult2.collision = true) {
			detectedCollisions.push(collisionResult2.yOverlap)
		}
		return detectedCollisions;
	}
	else if (shape1Size == 2 && shape2Size == 1){
		let collisionResult = blockCollisionDetection(
			{vertices: s1, pivotX: shape1.pivotX, pivotY: shape1.pivotY},
			{vertices: shape2.orientations[shape2.currentOrientation], pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult.collision = true) {
			detectedCollisions.push(collisionResult.yOverlap)
		}
		
		let collisionResult2 = blockCollisionDetection(
			{vertices: s2, pivotX: shape1.pivotX, pivotY: shape1.pivotY}, 
			{vertices: shape2.orientations[shape2.currentOrientation], pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult2.collision = true) {
			detectedCollisions.push(collisionResult2.yOverlap)
		}
		return detectedCollisions;
	}
	else {
		let collisionResult = blockCollisionDetection(
			{vertices: s1, pivotX: shape1.pivotX, pivotY: shape1.pivotY}, 
			{vertices: s3, pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult.collision = true) {
			detectedCollisions.push(collisionResult.yOverlap)
		}
		
		let collisionResult2 = blockCollisionDetection(
			{vertices: s1, pivotX: shape1.pivotX, pivotY: shape1.pivotY}, 
			{vertices: s4, pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult2.collision = true) {
			detectedCollisions.push(collisionResult2.yOverlap)
		}
		
		let collisionResult3 = blockCollisionDetection(
			{vertices: s2, pivotX: shape1.pivotX, pivotY: shape1.pivotY}, 
			{vertices: s3, pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult3.collision = true) {
			detectedCollisions.push(collisionResult3.yOverlap)
		}
		
		let collisionResult4 = blockCollisionDetection(
			{vertices: s2, pivotX: shape1.pivotX, pivotY: shape1.pivotY}, 
			{vertices: s4, pivotX: shape2.pivotX, pivotY: shape2.pivotY}
		);
		if (collisionResult4.collision = true) {
			detectedCollisions.push(collisionResult4.yOverlap)
		}
		return detectedCollisions;
	}
}
//checks if frames collide 
function isFrameCollision(shape1, shape2){
	
	//get values for frames
	
	//shape 1 
	left_1 = shape1.pivotX - 2; 
	x1_size = left_1 + 4; //each frame is 4 pixels across
	top_1 = shape1.pivotY - 2;
	y1_size = top_1 + 4;
	bottom_1 = shape1.pivotY + 2;
	
	//shape 2
	left_2 = shape2.pivotX - 2;
	x2_size = left_2 + 4;
	top_2 = shape2.pivotY - 2;
	y2_size = top_2 + 4;
	bottom_2 = shape2.pivotY + 2;
	
	//collision
	collisionX = false;
	collisionY = false;
	collides = false;
	
	//collision in x axis:
	if(x1_size >= left_2 && x2_size >= left_1){
		collisionX = true;
	}
	//collision in y axis:
	if(y1_size >= top_2 && y2_size >= top_1){
		collisionY = true;
	}
	//collision only if on both sides
	if(collisionX && collisionY){
		collides = true;
	}
	return collides;
}
//actual collision detection function for shapes 
function blockCollisionDetection(shape1, shape2){
	//checks active vs stationary block
	
	//falling
	//shape 1 x val	
	left_active = shape1.pivotX + getShapeLengthNegX(shape1.vertices); //leftmost x value
	right_active = shape1.pivotX + getShapeLengthPosX(shape1.vertices); //rightmost x value
	activeX_size = Math.abs(right_active - left_active);
	
	//shape 1 y val	
	top_active = shape1.pivotY + getShapeLengthPosY(shape1.vertices);
	bottom_active = shape1.pivotY + getShapeLengthNegY(shape1.vertices);
	activeY_size = Math.abs(top_active - bottom_active);
	
	//stationary 
	//shape2 x val
	left_stationary = shape2.pivotX + getShapeLengthNegX(shape2.vertices);
	right_stationary = shape2.pivotX + getShapeLengthPosX(shape2.vertices);
	stationaryX_size = Math.abs(right_stationary - left_stationary);
	
	//shape2 y val
	top_stationary = shape2.pivotY + getShapeLengthPosY(shape2.vertices);
	bottom_stationary = shape2.pivotY + getShapeLengthNegY(shape2.vertices);
	stationaryY_size = Math.abs(top_stationary - bottom_stationary);
	//console.log("shape2 pivotY=" + shape2.pivotY);
	//console.log('top_2= '+top_stationary+', bottom_2= '+bottom_stationary+', y2_size= '+stationaryY_size);
	
	//check collision
	var collisionX = false;
	var collision = false;
	var yOverlap = 0;
	
	if((right_active > left_stationary && right_active <= right_stationary) || (right_active > right_stationary && left_active < left_stationary)){
		//console.log("collision in x axis");
		if((bottom_active < top_stationary && bottom_active >= bottom_stationary) || (bottom_active < bottom_stationary && top_active > bottom_stationary)){
			//console.log("collision in y axis");
			yOverlap = top_stationary - bottom_active;
			//console.log("yOverlap= "+ yOverlap);
			collision = true;
			
		}
	}
	//return t/f collision, yOverlap
	return {collision: collision, yOverlap: yOverlap};
}

//--------------------helper functions--------------------
//break shape into smaller rectangles
function sectionShape(shape){
	var s1 = [];
	var s2 = [];
	
	for (i = 0; i < shape.numVertices; i++){
		currentIndex = 2*i
		if (i < shape.numVertices / 2){
		s1[currentIndex] = shape.orientations[shape.currentOrientation][currentIndex];
		s1[currentIndex+1] = shape.orientations[shape.currentOrientation][currentIndex+1];
		}
		else {
		s2[currentIndex - (shape.numVertices)] = shape.orientations[shape.currentOrientation][currentIndex];
		s2[currentIndex - (shape.numVertices) +1] = shape.orientations[shape.currentOrientation][currentIndex+1];
		}
	}
	return {s1, s2};
}
function findMaxY(array){
	var max = -12.0;
	for(index = 0; index < array.length; index++){
		if(array[index] > max){
			max = array[index];
		}
	}
	return max;
}

//------------------------------------------------------Step 3: Keystroke Interactions & Tile Movements--------------------------------------------

function keyEventListener(){
	document.addEventListener('keydown', (event) => {
		const keyname = event.key;
		console.log('keypress event: ' + keyname);
		keyEvent(keyname);
	});		
}

const DEFAULT_SPEED = 10;
const FAST_SPEED = 15;

function keyEvent(key){
	if (key == 's'){
		if (speed == DEFAULT_SPEED) {
			speed = FAST_SPEED;
		}
		else {
			speed = DEFAULT_SPEED;
		}
		//if no collisions move down at faster rate (change speed)
	}
	else if (key == 'w'){
		if (shapeToSpawn != null) {
			if (shapeToSpawn.currentOrientation == (shapeToSpawn.numOrientations - 1)) {
				shapeToSpawn.currentOrientation = 0;
			}
			else {
				shapeToSpawn.currentOrientation++;
			}
		}
	}
	else if (key == 'a'){
		//translate left
		if (shapeToSpawn != null) {
			var currentVertices = shapeToSpawn.orientations[shapeToSpawn.currentOrientation];
			if (shapeToSpawn.pivotX + getShapeLengthNegX(currentVertices) > -5) {
				shapeToSpawn.pivotX--;
			}
		}
	}
	else if (key == 'd'){
		//translate right
		if (shapeToSpawn != null) {
			var currentVertices = shapeToSpawn.orientations[shapeToSpawn.currentOrientation];
			if (shapeToSpawn.pivotX + getShapeLengthPosX(currentVertices) < 5) {
				shapeToSpawn.pivotX++;
			}
		}
	}
	else if (key == 'r'){
		currentShapes = [];
		
	}
	else if (key == 'q'){
		playerQuit = true; 
	}
}

//------------------------------------------------------Step 4: Additional Game Logic----------------------------------------------------------
	
//remove bottom row when filled
	//check: for every x position at bottom of screen if there is a block against it, pivotY of all shapes in currentShapes = pivotY-1
