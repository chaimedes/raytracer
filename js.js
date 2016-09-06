window.onload = function() {
	
	var toOut;

	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	var imageData = context.createImageData(canvas.width, canvas.height);

	var imageWidth = canvas.width;
	var imageHeight = canvas.height;

	var camerax = 0;
	var cameray = 20;
	var cameraz = 0;

	var lightx = 0;
	var lighty = 100;
	var lightz = 30;

	var renderDepth = 100;

	var pHit;
	
	var isInShadow;
	
	var object1;

	function setCamera(x,y,z) {
		camerax = x;
		cameray = y;
		cameraz = z;
	}
	function setPixel(imageData, x, y, r, g, b, a) {
		index = (x + y * imageData.width) * 4;
		imageData.data[index+0] = r;
		imageData.data[index+1] = g;
		imageData.data[index+2] = b;
		imageData.data[index+3] = a;
	}
	
	/* 
	Canvas uses standard (x,y) with top left as (0,0). 
	We want center of the screen to be (0,0) and higher y values to indicate up.
	For x, we can just take the center of the canvas as 0, and add the value -- so if a negative x value
	is given, it will map to the center minus that amount.
	Basically, this function will take "virtual" coordinates and fit them to canvas coordinates.
	*/
	function mapPixel(x,y) {
		return {x: (canvas.width/2) + x, y: ((canvas.height/2) + y)};
	}
	
	var objects = new Array();
	
	for (a=0;a<20;a++) {
	objects.push({
		x:a*40,
		y:a*10,
		z:5,
		width:20,
		height:150,
		depth:5,
		r:(a*10),
		g:100,
		b:0
	});
	}

	for ( j = 0; j < imageHeight; ++j) {
		
		for (i = 0; i < imageWidth; ++i) {
				
			// compute primary ray direction
			var primRay = {x:i-camerax,y:j-cameray,z:1};
			var distance; // Dist from camera to intersection
			
			// Iterate through depth
			for (renderGo = 0; renderGo < 200; renderGo++) {
			
				// Magnitude of the primary ray.			
				var mag = Math.sqrt( Math.pow(primRay.x, 2) + Math.pow(primRay.y, 2) + Math.pow(primRay.z, 2) );
				
				// Primary ray unit vector
				var unit = {
					x: primRay.x / mag,
					y: primRay.y / mag,
					z: primRay.z / mag
				};
				
				// Increment the ray in its direction
				primRay.x += unit.x;
				primRay.y += unit.y;
				primRay.z += unit.z;
				
				// Check for intersection with each object
				for (k = 0; k < objects.length; ++k) {
					
					// If the ray is within bounds of the current object
					if (primRay.x > objects[k].x 
						&& primRay.x < objects[k].x+objects[k].width
						&& primRay.y > objects[k].y
						&& primRay.y < objects[k].y+objects[k].height
						&& primRay.z > objects[k].z
						&& primRay.z < objects[k].z+objects[k].depth
					) {
						
						// Find the distance from the object to the camera
						distance = Math.sqrt( Math.pow(primRay.x - camerax, 2) + Math.pow(primRay.y - cameray, 2) + Math.pow(primRay.z - cameraz, 2) );
						
						// Record the hit location
						pHit = {x:primRay.x,y:primRay.y,z:primRay.z};
						
						// Record the object to work with
						object1 = objects[k];
						
						// Make a new ray pointing from the hit location to the light source
						var shadowRay = {x:lightx-pHit.x,y:lighty-pHit.y,z:lightz-pHit.z};
						
						isInShadow = false;
							
						// Iterate through depth...
						for (renderGo = 0; renderGo < 200; renderGo++) {
							
							// For each object...
							for(k = 0; k < objects.length; ++k) {
								
								// Magnitude of the shadow ray.			
								var mag = Math.sqrt( Math.pow(shadowRay.x, 2) + Math.pow(shadowRay.y, 2) + Math.pow(shadowRay.z, 2) );
								
								// Primary ray unit vector
								var unit = {
									x: shadowRay.x / mag,
									y: shadowRay.y / mag,
									z: shadowRay.z / mag
								};
								
								// Increment the ray in its direction
								shadowRay.x += unit.x;
								shadowRay.y += unit.y;
								shadowRay.z += unit.z;
								
								// If the shadow ray intersects an object on its way to the light source, then this pixel is in shadow
								if (shadowRay.x > objects[k].x 
									&& shadowRay.x < objects[k].x+objects[k].width
									&& shadowRay.y > objects[k].y
									&& shadowRay.y < objects[k].y+objects[k].height
									&& shadowRay.z > objects[k].z
									&& shadowRay.z < objects[k].z+objects[k].depth
								) {
								
									isInShadow = true; // Yes, in shadow.
									
									break;

								} // End of if in shadow
								
							} // End of for each object
						
						} // End of iterate through depth
					
						var pixelToUse = mapPixel(i, j);
						if (!isInShadow) {
							setPixel(imageData, pixelToUse.x, pixelToUse.y, object1.r*1, object1.g*1, object1.b*1, 255); //pixels[i][j] = object->color * light.brightness;
						}
						else {
							setPixel(imageData, pixelToUse.x, pixelToUse.y, 0,0,0, 255); //pixels[i][j] = 0;
						}
						break;
					
					} // End of intersection with object
				
				} // End of for each object
					
			} // End of for traverse depth
			
		} // End of width
		
	} // End of height
	
	// Output image data
	context.putImageData(imageData, 0, 0);
	document.getElementById("output").innerHTML = toOut;
	
} // End of when document ready