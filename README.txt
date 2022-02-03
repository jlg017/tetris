CMPT 361 Assignment 3 Fall 2020
Grade: 97.5%

Project Scope:
	The assignment purpose was to get students using the graphics pipeline to render 2D graphics. It served as an introduction to JavaScript and OpenGL. 
	The goal was to implement a simplified version of Tetris in the following steps:
	1) Tile and grid rendering with tile downward movement: 
		- Set up the game window with grid line
		- Randomly select Tetris tiles with distinguishing colors one at a time 
		  and drop them from the top of the game window
		- Randomize starting position and orientation
		- Player controls movement speed to suit their style
		- Movement of the tiles’ is aligned with the grids and at uniform speed
	2) Tile Stack-up
		- Tiles should stack up on top of each other and the bottom of the game 
		  window will offer ground support (as in Tetris)
	3) Key stroke interaction and tile movements
		- The four arrow keys will be used to move the tiles as such:
		- “up” key rotates a tile counterclockwise about its pivot, 90° at a time
		- “left” and “right” key presses result in lateral movements of a tile, one grid at a time
		- “down” key accelerates the downward movement
		At no time should a tile piece collide with any existing Tetris pieces or the border of the game window
	4) Additional game logic
		- When the bottom row is completely filled, it is removed and the tile stack above it will be moved one row down
		- Game terminates when a new tile piece cannot be fit within the game window
		- Press ‘q’ to quit and ‘r’ to restart
		- Pressing any of the arrow keys should not slow down the downward movement of a tile


Code adapted from:
	Mozilla webGl tutorial:
		these pages have the source code I used: 
		- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
		- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_objects_with_WebGL
	Webgl-demo from class
	Learn Open Gl website for collision detection
		-https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-detection
		

Explanation of code layout: 
	gl-logic.js contains all webGl/image rendering code 
	game-data.js holds all data structures 
	game-logic.js holds game logic 
		

Game Controls: 
	W: rotates block counterclockwise
	S: select speed (press once to go faster, press again to return to default speed)
	A: translates block left
	D: translates block right
	Q: Quit Game: stops render of game
	R: Restart: clears stacked bricks
	Game ends when tiles reach top of screen

Known Issues / Possible Improvements:
	- No Win Condition: filled rows are not removed from the game, so there is no way for a player to win,
	  they only delay loss
	- UI elements: Limited to gamespace, with no explanation of game or game controls for player
	- Shapes appear as one block rather than segmented, difficult to see
	- Shape movement down screen is continuous rather than usual periodic movement
	- Collision detection:
		-> Has only been implemented for vertical overlapping
		-> Behavior is not consistent, occasionally ignoring overlaps or bouncing into place after overlap has occurred 
		   (Marker noted this is due to floating-point weirdness after multiple operations on float)
		-> Sometimes horizontal collision is prevented even though logic is not present
	- Start Button: Game starts without button press, when pressed causes strange behaviour
	- Difficulty Settings: Buttons have been added in HTML but backend has not been implemented
	- Rotation: Does not occur in the shader, more initial work than necessary
	- Performance: After a few minutes of running can cause browser to freeze, which persists for short time after 
		       the tab is closed and requires window closure, occasionally will crash browser (this did not occur at time of delivery)
