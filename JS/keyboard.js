// Add a keyboard observable WASD
scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            // Check which key is pressed
            switch (kbInfo.event.key) {
                case "w":
                    // Set direction forward
                    direction.z = speed;
                    break;
                case "s":
                    // Set direction backward
                    direction.z = -speed;
                    break;
                case "a":
                    // Set direction left
                    direction.x = -speed;
                    break;
                case "d":
                    // Set direction right
                    direction.x = speed;
                    break;
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            // Reset direction when key is released
            switch (kbInfo.event.key) {
                case "w":
                case "s":
                    direction.z = 0;
                    break;
                case "a":
                case "d":
                    direction.x = 0;
                    break;    
            }
            break;    
    }
});

// JUMP!
scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            // Check which key is pressed
            switch (kbInfo.event.key) {
                case " ":
                    // Check if camera is on the ground by casting a ray downwards
                    const ray = new BABYLON.Ray(camera.position, new BABYLON.Vector3(0, -1, 0));
                    const hit = scene.pickWithRay(ray);
                    if (hit.hit && hit.pickedPoint.y <= groundLevel + 0.1) {
                        // Set direction upward
                        direction.y = jumpHeight;
                    }
                    break;
            }
            break;   
    }
});

    // Register a before render function
    scene.registerBeforeRender(() => {
        // Get the delta time between frames
        const deltaTime = engine.getDeltaTime();

        // Get the camera's rotation matrix
        const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(camera.rotation.y, camera.rotation.x, 0);

        // Transform the direction vector by the rotation matrix
        const transformedDirection = BABYLON.Vector3.TransformCoordinates(direction, rotationMatrix);

        // Update the camera position based on the transformed direction and delta time
        camera.position.addInPlace(transformedDirection.scale(deltaTime));
    });

    // Define some variables for jump height, gravity and ground level
    const jumpHeight = 0.05;
    const gravity = -0.002;
    const groundLevel = 1;

    // Or decrease the collision radius
    camera.collisionRadius = new BABYLON.Vector3(0.2, 0.2, 0.2);

    // Register a before render function
    scene.registerBeforeRender(() => {
    // Get the delta time between frames
    const deltaTime = engine.getDeltaTime();

    // Get the camera's rotation matrix
    const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(camera.rotation.y, camera.rotation.x, 0);

    // Transform the direction vector by the rotation matrix
    const transformedDirection = BABYLON.Vector3.TransformCoordinates(direction, rotationMatrix);

    // Update the camera position based on the transformed direction and delta time
    camera.position.addInPlace(transformedDirection.scale(deltaTime));

    // Apply gravity to the vertical direction
    direction.y += gravity;

    // Clamp the camera position to the ground level
    if (camera.position.y < groundLevel) {
        camera.position.y = groundLevel;
        // Reset the direction vector
        direction.y = 0;
    }
});