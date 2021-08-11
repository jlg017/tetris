CMPT 361 Assignment 3 - Jacqueline Greer
Code adapted from:
	Mozilla webGl tutorial:
		these pages have the source code I used: 
		- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
		- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_objects_with_WebGL
	Webgl-demo from class
	Learn Open Gl website for collision detection
		-https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-detection


Steps completed & notes:
	1	NOTE: translation and rotation are achieved by the shaders, though due to issues with tracking I elected to program the coordinates from all possible rotations and swap them rather than use true rotation
	
	2 	NOTE: collision detection works for most cases, unable to determine why others do not
	
	3	Game controls:
		W: rotates block counterclockwise
		S: select speed (default is 10, press once to go faster, press again to return to default speed)
		A: translates block left
		D: translates block right
		
	4	Q: ends main()
		R: clears stacked bricks
		Game ends when tiles are at top of screen
		NOTE: did not implement game tile fall when bottom row is filled
		
		
Explanation of layout: 
	gl-logic.js contains all webGl/image rendering code 
		I was unsure what drawing/rendering functions could be moved out of main, so there is more game logic in gl-logic than there should be

	game-data.js holds all data structures 
		includes shapes and gridlines

	game-logic.js holds game logic / functions 
		pseudocode is given for the steps that were not completed
