keyEventListener();
var shapeToSpawn;
var currentShapes = [];
var speed = 10;
var playerQuit = false;


main();

function main(){
	//------------------------------------------Page Setup-----------------------------------------------------
	const canvas = document.querySelector('#glCanvas');
	const gl = canvas.getContext('webgl');
	if(!gl){
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}
	
	//-------------------------------------------Shaders-------------------------------------------------------------
	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec4 aVertexColor;

		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		
		varying lowp vec4 vColor;

		void main(void){
			gl_Position = uProjectionMatrix * uModelViewMatrix *aVertexPosition;
			vColor = aVertexColor;
		}
	`;
	const fsSource= `
			varying lowp vec4 vColor;
			
			void main(void){
			gl_FragColor = vColor;
			}
	`;
	
	//shader program initialization
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
	
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
			},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		},
	};
	//------------------------------------------Draw--------------------------------------------
	//stores instances
	var then = 0;
	spawnShape = true;
	
	//tracks time where last animated
	const starty = 10;	//y=10 is top of viewer
	var startx = 0;
	var x;
	var y;
	//draw scene repeatedly
	function render(now) {
		
		if (playerQuit) {
			// quit rendering
			refresh(gl);
			console.log("player has quit.")
			return;
		}
		
		//time tracker for falling
		now *= 0.001; //convert to seconds
		const deltaTime = now - then;
		const fallDistance = speed * deltaTime;
		then = now;
		var detectedCollisions = [];
		
		//reset and draw stationary objects
		refresh(gl);
		drawBackground(gl, programInfo);
		drawCurrentShapes(gl, programInfo, currentShapes);
			
		//either spawn a new object or translate current object or reset
		if (spawnShape) {
			shapeToSpawn = JSON.parse(JSON.stringify(Shapes[getRandomInt(Shapes.length)]));
			
			//random numbered orientation of shape
			//must be set before calculating startx since dimensions change per orientation
			shapeToSpawn.currentOrientation = getRandomOrientation(shapeToSpawn);
			
			//random start position of shape
			startx = getRandomStartX(shapeToSpawn); 
			
			//initialize start position of object pivot point
			shapeToSpawn.pivotX = startx; 
			shapeToSpawn.pivotY = starty;
			
			detectedCollisions = collision(shapeToSpawn, currentShapes);
			var maxY = findMaxY(detectedCollisions);
			////console.log('maxY= '+ maxY);
			if (currentShapes.length > 0 && maxY > 0.0){ 
				//console.log('collision caught, shape.pivotY= ' + shapeToSpawn.pivotY + maxY );
				
				//stop translating this shape, it is now part of stationary shapes
				shapeToSpawn.pivotY = shapeToSpawn.pivotY + maxY;
				drawObject(gl, programInfo, shapeToSpawn);
				then = 0;
				currentShapes.push(JSON.parse(JSON.stringify(shapeToSpawn)));
				//console.log(JSON.stringify(shapeToSpawn.name) + " is in currentShapes")
				spawnShape = false; 
				maxY = 0;
				////console.log('game over');
				return;
			}
			//spawn object
			drawObject(gl, programInfo, shapeToSpawn);
			spawnShape = false;
			//console.log("this is the shape that spawned in: " + JSON.stringify(shapeToSpawn.name));
		}
		//shape is on screen
		else { 			
			//check if current pivotY - length of object in -y direction (l) passes bottom of screen
			var l = getShapeLengthNegY(shapeToSpawn.orientations[shapeToSpawn.currentOrientation]);
			var shapeBottomFinalPosition = (shapeToSpawn.pivotY + l) - fallDistance;
			
			if (shapeBottomFinalPosition > -10.0) {
				//update pivotY position of shape based on fall speed
				shapeToSpawn.pivotY -= fallDistance;
				
				//check if shape will collide with any other frames
				detectedCollisions = collision(shapeToSpawn, currentShapes);
				//console.log("detectedCollisions= " + detectedCollisions);
				var maxY = findMaxY(detectedCollisions);
				//console.log('maxY= '+ maxY);
				if (currentShapes.length > 0 && maxY > 0.0){ 
					//console.log('collision caught, shape.pivotY= ' + shapeToSpawn.pivotY + maxY );
					//stop translating this shape, it is now part of stationary shapes
					shapeToSpawn.pivotY = shapeToSpawn.pivotY + maxY;
					drawObject(gl, programInfo, shapeToSpawn);
					then = 0;
					currentShapes.push(JSON.parse(JSON.stringify(shapeToSpawn)));
					//console.log(JSON.stringify(shapeToSpawn.name) + " is in currentShapes")
					spawnShape = true; 
					shapeToSpawn = null;
					maxY = 0;
				}
				else {
				//shape is translated and drawn				
				drawObject(gl, programInfo, shapeToSpawn);
				spawnShape = false;}	
			}
			else {
				if (shapeBottomFinalPosition < -10.0) { // went past bottom
					// move it up to touch bottom
					shapeToSpawn.pivotY = -10.0 - l;
				}
				//else it is = -10 -> already at spot we want
				
				drawObject(gl, programInfo, shapeToSpawn);
				then = 0;
				currentShapes.push(JSON.parse(JSON.stringify(shapeToSpawn)));
				//console.log(JSON.stringify(shapeToSpawn.name) + " is in currentShapes")
				spawnShape = true;
				shapeToSpawn = null;
			}				
		}
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
	
}

//-------------------------------------------------------WEbGL / Drawing Setup Functions-------------------------------------------------------------------------
//clears canvas prior to draw
function refresh(gl){
	gl.clearColor(0.0, 0.0, 0.0, 1.0); //clears to black, fully opaque
	gl.clearDepth(1.0); 		//clears everything
	gl.enable(gl.DEPTH_TEST);	//enables depth testing
	gl.depthFunc(gl.LEQUAL);	//near obscures far
	
	//clear canvas before draw scene
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

//create buffer to pass info from JavaScript to shaders (uses colors and positions defined in object)
function initBuffers(gl, positions, colors){
	//create position buffer, pass to vs through buffer
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, 	positionBuffer);
	//pass list of positions into WebGL to build shape - use floatArray to fill the buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	
	//create color buffer, pass to fs through buffer
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl. STATIC_DRAW);
	
	return { 
	position: positionBuffer,
	color: colorBuffer,
	};
}

//setup of matrices & program -> buffer -> shader
function initGl(gl, programInfo, x, y, angle) {
	//create perspective matrix to simulate camera perspective
	const fieldOfView = 90 * Math.PI/180; 
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();
	//first argument is destination = receives result
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		
	//set drawing position to center of scene
	const modelViewMatrix = mat4.create();

	//moves drawing position to where we want to start drawing the object
	mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, -10.0]);
	
	//rotates object by angle about z
	mat4.rotate(modelViewMatrix, modelViewMatrix, angle, [0, 0, 1]);
	
	{
		//tell webgl how to get positions from buffer into shader
		const numComponents = 2; //pull out 2 values per iter.(x,y)
		const type = gl.FLOAT; 	 //data in buffer is 32bit float
		const normalize = false; 
		const stride = 0;		 //how many bytes to get from one set of values to the next : 0=use type & numComponents	
		const offset = 0;		 //how many bytes inside buffer to start from;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	}
	{
		//tell webgl how to get colors from buffer into shader
		const numComponents = 4; //pull out 4 values per iter. (R,G,B,A)
		const type = gl.FLOAT; 	 //data in buffer is 32bit float
		const normalize = false; 
		const stride = 0;		 //how many bytes to get from one set of values to the next : 0=use type & numComponents	
		const offset = 0;		 //how many bytes inside buffer to start from;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
	}
	//tells webgl to use this program when drawing
	gl.useProgram(programInfo.program);
	
	//set shader uniforms
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
}

//render the grid
function drawBackground(gl, programInfo) {
	// Draw left and right borders
	drawLine(gl, programInfo, GridLines.vertical.left, GridLines.colors, 0.0, 0.0)
	drawLine(gl, programInfo, GridLines.vertical.right, GridLines.colors, 0.0, 0.0)
	for (i = 1; i < 10; i++)
		drawLine(gl, programInfo, [GridLines.vertical.left[0] + i, 10, GridLines.vertical.left[2] + i, -10], GridLines.colors, 0.0, 0.0)
	// Draw top and bottom borders
	drawLine(gl, programInfo, GridLines.horizontal.top, GridLines.colors, 0.0, 0.0)
	drawLine(gl, programInfo, GridLines.horizontal.bottom, GridLines.colors, 0.0, 0.0)
	for (j = 1; j < 20; j++)
		drawLine(gl, programInfo, [5, GridLines.horizontal.bottom[1] + j, -5, GridLines.horizontal.bottom[3] + j], GridLines.colors, 0.0, 0.0)
}
	
//render an object
function drawObject(gl, programInfo, shape){
	
	buffers = initBuffers(gl, shape.orientations[shape.currentOrientation], shape.colors);
	//rotation = shape.orientations[shape.currentOrientation].angle * Math.PI / 180;
	
	rotation = shape.orientations[shape.currentOrientation];
	
	//pivotX and pivotY keep track of where shape is in gamespace *EDIT: removed angle from initGL
	initGl(gl, programInfo, shape.pivotX, shape.pivotY, 0);
	{
		const offset = 0;
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, shape.numVertices);
	}
}

function drawCurrentShapes(gl, programInfo, shapes) {
	for (i = 0; i < shapes.length; i++) {
		////console.log(shapes[i])
		drawObject(gl, programInfo, shapes[i])
	}
}

//render a line
function drawLine(gl, programInfo, positions, colors, startx, starty){
	
	buffers = initBuffers(gl, positions, colors);
	initGl(gl, programInfo, startx, starty, 0);
	{
		const offset = 0;
		gl.drawArrays(gl.LINE_STRIP, offset, 2);
	}
}
	
//initialize shaders - connect shaders to webgl context
function initShaderProgram(gl, vsSource, fsSource){
	
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	
	//create shader program
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	//alert if shader program creation fails
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		alert('Unable to initialize Shader Program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	return shaderProgram;
}

// creates a shader of the given type, uploads the source and compiles it
function loadShader(gl, type, source){
	const shader = gl.createShader(type);
	//send source to shader
	gl.shaderSource(shader, source);
	//compile shader program
	gl.compileShader(shader);
	
	//check if compiles
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: '+ gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}
	


	

