document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('metaverse-canvas');
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = () => {
        const scene = new BABYLON.Scene(engine);

        BABYLON.SceneLoader.ImportMesh("","models/","A.glb", scene, (meshes) => {
            model = meshes[0];
  
        });

        // Create camera
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 2, 35), scene);
        camera.setTarget(new BABYLON.Vector3(0, -0.0001, 1));

        // Attach camera to canvas
        camera.attachControl(canvas, true);

        // Enable collisions and gravity for camera
        camera.checkCollisions = true;
        camera.applyGravity = true;

        // Define some variables for movement speed and direction
        const speed = 0.01;
        const direction = new BABYLON.Vector3(0, 0, 0);

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
            const jumpHeight = 0.01;
            const gravity = -0.0003;
            const groundLevel = 2;

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

        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
        ground.receiveShadows = true;
        ground.position.y = -0.07;

        var pbr = new BABYLON.PBRMaterial("pbr", scene);
        ground.material = pbr;
        pbr.albedoColor = new BABYLON.Color3(1.0, 1, 1);
        pbr.metallic = 1.0;
        pbr.roughness = 0.5;

        // Load environment texture
        const envTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData('https://assets.babylonjs.com/environments/environmentSpecular.env', scene);
        scene.environmentTexture = envTexture;
        
        const gl = new BABYLON.GlowLayer("glow", scene, {
            mainTextureFixedSize: 256,
            blurKernelSize: 128,
          });
        gl.intensity = 1;

        const ssr = new BABYLON.SSRRenderingPipeline(
            "ssr", // The name of the pipeline
            scene, // The scene to which the pipeline belongs
            [scene.activeCamera], // The list of cameras to attach the pipeline to
            false, // Whether or not to use the geometry buffer renderer (default: false, use the pre-pass renderer)
            BABYLON.Constants.TEXTURETYPE_UNSIGNED_BYTE // The texture type used by the SSR effect (default: TEXTURETYPE_UNSIGNED_BYTE)
        );
            ssr.thickness = 0.1;
            ssr.selfCollisionNumSkip = 2;
            ssr.enableAutomaticThicknessComputation = false;
            ssr.blurDispersionStrength = 0.1;
            ssr.roughnessFactor = 0.1;
            ssr.enableSmoothReflections = true;
            ssr.step = 20;
            ssr.maxSteps = 100;
            ssr.maxDistance = 500;
            ssr.blurDownsample = 1;
            ssr.ssrDownsample = 1;

            // Create SSAO and configure all properties (for the example)
            var ssaoRatio = {
                ssaoRatio: 0.5, // Ratio of the SSAO post-process, in a lower resolution
                combineRatio: 1.0 // Ratio of the combine post-process (combines the SSAO and the scene)
            };

            var ssao = new BABYLON.SSAORenderingPipeline("ssao", scene, ssaoRatio);
            ssao.fallOff = 0.00007;
            ssao.area = 1;
            ssao.radius = 0.00003;
            ssao.totalStrength = 1.0;
            ssao.base = 0.1;

            // Attach camera to the SSAO render pipeline
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);

        return scene;
    };

    const scene = createScene();
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });

    // Model loading
    let model;
    const modelInput = document.getElementById('model-input');
    const loadModel = document.getElementById('load-model');
    loadModel.addEventListener('click', (e) => {
        e.preventDefault();
        modelInput.click();
    });

    modelInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                if (model) {
                    model.dispose();
                }

                const dataUrl = event.target.result;
                const base64data = dataUrl.split(',')[1];

                BABYLON.SceneLoader.ImportMesh('', '', `data:${file.type};base64,${base64data}`, scene, (meshes) => {
                    model = meshes[0];
                    model.position.y = 0;
                });
            };
            reader.readAsDataURL(file);
        }
    });
});
