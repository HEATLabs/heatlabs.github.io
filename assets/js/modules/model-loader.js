// 3D Model Loader for HEAT Labs Tank Viewer
class ModelLoader {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Model container not found:', containerId);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Animation state (or just the helicopter mode)
        this.isRotating = false;
        this.rotationSpeed = 8; // degrees per second

        // Shadow state
        this.shadowsEnabled = true;

        // Model configuration (Prod)
        this.modelPath = 'https://github.com/HEATLabs/Database-Files/raw/refs/heads/main/tanks/test-model/60TP.fbx';
        this.texturePath = 'https://github.com/HEATLabs/Database-Files/raw/refs/heads/main/tanks/test-model/';

        // Model configuration (Local)
        // this.modelPath = '../../Database-Files/tanks/test-model/60TP.FBX';
        // this.texturePath = '../../Database-Files/tanks/test-model/';

        // Store original dimensions for fullscreen handling
        this.originalWidth = null;
        this.originalHeight = null;

        this.specialTextures = {
            'details': ['Details_map'],
            'guns_id': ['guns_ID'],
            'shadow': ['HangarShadowMap']
        };

        // Define available texture patterns
        this.availableTextures = {
            'hull': ['hull_AM', 'hull_ANM', 'hull_AO', 'hull_GMM'],
            'turret': ['turret_AM', 'turret_ANM', 'turret_AO', 'turret_GMM'],
            'guns': ['guns_AM', 'guns_ANM', 'guns_AO', 'guns_GMM'],
            'chassis': ['chassis_AM', 'chassis_ANM', 'chassis_AO', 'chassis_GMM'],
            'equipment': ['equipment_AM', 'equipment_ANM', 'equipment_AO', 'equipment_GMM'],
            'track': ['track_AM', 'track_ANM', 'track_GMM'],
            'segment_track': ['segment_track_AM', 'segment_track_ANM', 'segment_track_GMM'],
            'proxy': ['proxy_AM', 'proxy_ANM', 'proxy_AO', 'proxy_GMM'],
            'lewandowsky_track': ['Lewandowsky_track_AM', 'Lewandowsky_track_ANM']
        };

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupGrid();
        this.createControlsUI();
        this.loadModel();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
        this.scene.fog = new THREE.Fog(0x1a1a1a, 20, 100);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 15);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        // Store original dimensions
        this.originalWidth = this.container.clientWidth;
        this.originalHeight = this.container.clientHeight;

        this.renderer.setSize(this.originalWidth, this.originalHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.className = 'model-viewer-canvas';

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 2, 0);
    }

    setupLighting() {
        // Store lighting references
        this.lights = {
            ambient: null,
            directional: null,
            fill: null
        };

        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(this.lights.ambient);

        // Directional light (main light)
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1);
        this.lights.directional.position.set(10, 10, 5);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 2048;
        this.lights.directional.shadow.mapSize.height = 2048;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 50;
        this.lights.directional.shadow.camera.left = -20;
        this.lights.directional.shadow.camera.right = 20;
        this.lights.directional.shadow.camera.top = 20;
        this.lights.directional.shadow.camera.bottom = -20;
        this.scene.add(this.lights.directional);

        // Fill light
        this.lights.fill = new THREE.DirectionalLight(0xffffff, 0.3);
        this.lights.fill.position.set(-5, 5, -5);
        this.lights.fill.castShadow = false;
        this.scene.add(this.lights.fill);
    }

    setupGrid() {
        const gridHelper = new THREE.GridHelper(200, 200, 0x444444, 0x222222);
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);

        // Add a ground plane for shadows
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.ShadowMaterial({
            opacity: 0.1,
            transparent: true
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createControlsUI() {
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'model-viewer-controls';

        // Rotate toggle button
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'model-control-btn';
        rotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        rotateBtn.title = 'Toggle Auto Rotation';
        rotateBtn.addEventListener('click', () => this.toggleRotation());

        // Reset view button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'model-control-btn';
        resetBtn.innerHTML = '<i class="fas fa-home"></i>';
        resetBtn.title = 'Reset View';
        resetBtn.addEventListener('click', () => this.resetView());

        // Shadow toggle button
        const shadowBtn = document.createElement('button');
        shadowBtn.className = 'model-control-btn';
        shadowBtn.innerHTML = '<i class="fas fa-lightbulb"></i>';
        shadowBtn.title = 'Toggle Shadows (On)';
        shadowBtn.addEventListener('click', () => this.toggleShadows());

        // Fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'model-control-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = 'Enter Fullscreen';
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        controlsContainer.appendChild(rotateBtn);
        controlsContainer.appendChild(resetBtn);
        controlsContainer.appendChild(shadowBtn);
        controlsContainer.appendChild(fullscreenBtn);

        this.container.appendChild(controlsContainer);
    }

    toggleShadows() {
        this.shadowsEnabled = !this.shadowsEnabled;

        // Update renderer shadow map
        this.renderer.shadowMap.enabled = this.shadowsEnabled;

        // Update directional light shadow casting
        if (this.lights.directional) {
            this.lights.directional.castShadow = this.shadowsEnabled;
        }

        // Update model shadow properties
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = this.shadowsEnabled;
                    child.receiveShadow = this.shadowsEnabled;
                }
            });
        }

        // Update ground plane shadow reception
        this.scene.traverse((object) => {
            if (object.isMesh && object.material && object.material.isShadowMaterial) {
                object.visible = this.shadowsEnabled;
            }
        });

        // Update button state
        const shadowBtn = this.container.querySelector('.model-control-btn:nth-child(3)');
        if (shadowBtn) {
            if (this.shadowsEnabled) {
                shadowBtn.classList.add('active');
                shadowBtn.innerHTML = '<i class="fas fa-lightbulb"></i>';
                shadowBtn.title = 'Toggle Shadows (On)';
            } else {
                shadowBtn.classList.remove('active');
                shadowBtn.innerHTML = '<i class="far fa-lightbulb"></i>';
                shadowBtn.title = 'Toggle Shadows (Off)';
            }
        }
    }

    async loadModel() {
        this.showLoadingState();

        try {
            // Load FBX model
            const loader = new THREE.FBXLoader();
            const fbx = await new Promise((resolve, reject) => {
                loader.load(this.modelPath, resolve, undefined, reject);
            });

            // Process the model
            this.model = this.processModel(fbx);

            // Center and position the model
            this.centerModel(this.model);

            // Load and apply textures
            await this.loadTextures(this.model);

            // Add to scene
            this.scene.add(this.model);

            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading model:', error);
            this.showErrorState('Failed to load 3D model');
        }
    }

    processModel(group) {
        const processedGroup = new THREE.Group();

        // Copy the original group's properties
        processedGroup.position.copy(group.position);
        processedGroup.rotation.copy(group.rotation);
        processedGroup.scale.copy(group.scale);

        // Process all children
        group.traverse((child) => {
            if (child.isMesh) {
                // Clone the mesh and add to processed group
                const clonedMesh = child.clone();

                // Ensure the mesh can cast and receive shadows based on current state
                clonedMesh.castShadow = this.shadowsEnabled;
                clonedMesh.receiveShadow = this.shadowsEnabled;

                // Create a new PBR material for better rendering
                const material = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.8,
                    metalness: 0.2
                });

                // Apply the new material
                clonedMesh.material = material;

                processedGroup.add(clonedMesh);
            }
        });

        return processedGroup;
    }

    centerModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Scale the model to fit nicely in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 8 / maxDim;
        model.scale.setScalar(scale);

        // Position the model so it sits on the grid
        const boxAfterScale = new THREE.Box3().setFromObject(model);
        const minY = boxAfterScale.min.y;
        model.position.y -= minY;

        model.position.z += 2.3;

        if (this.controls) {
            this.controls.target.set(0, model.position.y + 0.7, 0);
            this.controls.update();
        }
    }

    async loadTextures(model) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setPath(this.texturePath);

        // Get all mesh names to help with texture matching
        const meshNames = [];
        model.traverse((child) => {
            if (child.isMesh && child.name) {
                meshNames.push(child.name.toLowerCase());
            }
        });

        // Try to load textures for each mesh
        const texturePromises = [];

        model.traverse((child) => {
            if (child.isMesh && child.material) {
                const material = child.material;
                const meshName = child.name.toLowerCase();

                // Try to find matching texture based on mesh name
                const texturePromise = this.findAndApplyTextures(material, meshName, textureLoader);
                texturePromises.push(texturePromise);
            }
        });

        // Wait for all textures to load
        await Promise.allSettled(texturePromises);
    }

    async findAndApplyTextures(material, meshName, textureLoader) {
        // Try to match mesh name with available texture patterns
        const matchedPattern = this.findMatchingTexturePattern(meshName);

        if (matchedPattern) {
            await this.applyTextureSet(material, matchedPattern, textureLoader);
        } else {
            // If no specific pattern found, try common patterns
            await this.tryCommonTextures(material, meshName, textureLoader);
        }
    }

    findMatchingTexturePattern(meshName) {
        // Check if mesh name contains any of our known texture patterns
        for (const pattern of Object.keys(this.availableTextures)) {
            if (meshName.includes(pattern)) {
                return pattern;
            }
        }
        return null;
    }

    async tryCommonTextures(material, meshName, textureLoader) {
        // Common patterns to try based on typical tank parts
        const commonPatterns = ['hull', 'turret', 'guns', 'chassis', 'track', 'equipment'];

        for (const pattern of commonPatterns) {
            if (this.availableTextures[pattern]) {
                try {
                    await this.applyTextureSet(material, pattern, textureLoader);
                    return; // Success
                } catch (error) {
                    // Continue to next pattern
                    continue;
                }
            }
        }

        // If no textures found, apply default material
        console.warn(`No textures found for mesh: ${meshName}, using default material`);
        material.color.set(0x666666);
        material.roughness = 0.7;
        material.metalness = 0.3;
        material.needsUpdate = true;
    }

    async applyTextureSet(material, pattern, textureLoader) {
        const textureSet = this.availableTextures[pattern];
        if (!textureSet) {
            throw new Error(`No texture set found for pattern: ${pattern}`);
        }

        // File extensions to try (prioritize DDS for better quality)
        const extensions = ['.dds', '.png'];

        // Load color texture (AM)
        const colorTextureBase = textureSet.find(tex => tex.includes('_AM'));
        if (colorTextureBase) {
            for (const ext of extensions) {
                try {
                    const colorTexture = await this.loadTexture(textureLoader, colorTextureBase + ext);
                    if (colorTexture) {
                        material.map = colorTexture;
                        material.needsUpdate = true;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        // Load additional texture maps
        const textureTypes = {
            normalMap: '_ANM',
            aoMap: '_AO',
            roughnessMap: '_GMM',
            metalnessMap: '_GMM'
        };

        for (const [type, suffix] of Object.entries(textureTypes)) {
            const textureBase = textureSet.find(tex => tex.includes(suffix));
            if (textureBase) {
                for (const ext of extensions) {
                    try {
                        const texture = await this.loadTexture(textureLoader, textureBase + ext);
                        if (texture) {
                            this.applyTextureToMaterial(material, type, texture);
                            break;
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        }
    }

    applyTextureToMaterial(material, type, texture) {
        switch (type) {
            case 'normalMap':
                material.normalMap = texture;
                material.normalScale = new THREE.Vector2(1, 1);
                break;
            case 'aoMap':
                material.aoMap = texture;
                break;
            case 'roughnessMap':
                material.roughnessMap = texture;
                material.roughness = 1.0;
                break;
            case 'metalnessMap':
                material.metalnessMap = texture;
                material.metalness = 0.3;
                break;
        }
        material.needsUpdate = true;
    }

    async loadTexture(textureLoader, texturePath) {
        return new Promise((resolve, reject) => {
            textureLoader.load(
                texturePath,
                (texture) => {
                    texture.encoding = THREE.sRGBEncoding;
                    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    reject(new Error(`Texture not found: ${texturePath}`));
                }
            );
        });
    }

    toggleRotation() {
        this.isRotating = !this.isRotating;

        // Update button state
        const rotateBtn = this.container.querySelector('.model-control-btn:nth-child(1)');
        if (rotateBtn) {
            if (this.isRotating) {
                rotateBtn.classList.add('active');
            } else {
                rotateBtn.classList.remove('active');
            }
        }
    }

    resetView() {
        if (this.controls) {
            this.controls.reset();
        }

        // Stop auto rotation when resetting
        this.isRotating = false;
        const rotateBtn = this.container.querySelector('.model-control-btn:nth-child(1)');
        if (rotateBtn) {
            rotateBtn.classList.remove('active');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        // Store current dimensions before entering fullscreen
        this.originalWidth = this.container.clientWidth;
        this.originalHeight = this.container.clientHeight;

        this.container.classList.add('fullscreen-model');

        if (this.container.requestFullscreen) {
            this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
            this.container.webkitRequestFullscreen();
        } else if (this.container.msRequestFullscreen) {
            this.container.msRequestFullscreen();
        }

        // Add close button for fullscreen
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', () => this.exitFullscreen());
        this.container.appendChild(closeBtn);

        // Force resize after a brief delay to ensure fullscreen is active
        setTimeout(() => {
            this.onWindowResize();
        }, 100);
    }

    exitFullscreen() {
        // Exit fullscreen first
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        // Remove fullscreen class
        this.container.classList.remove('fullscreen-model');

        // Remove close button
        const closeBtn = this.container.querySelector('.fullscreen-close');
        if (closeBtn) {
            closeBtn.remove();
        }

        // Restore original dimensions and trigger resize
        setTimeout(() => {
            if (this.originalWidth && this.originalHeight) {
                this.renderer.setSize(this.originalWidth, this.originalHeight);
                this.camera.aspect = this.originalWidth / this.originalHeight;
                this.camera.updateProjectionMatrix();
            }
            this.onWindowResize();
        }, 100);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        // Only update if we're not in fullscreen mode
        if (!document.fullscreenElement) {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        } else {
            // In fullscreen, use the full container size
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    showLoadingState() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'model-loading';
        loadingDiv.innerHTML = `
            <div class="model-loading-spinner"></div>
            <p>Loading 3D Model...</p>
        `;
        this.container.appendChild(loadingDiv);
        this.loadingElement = loadingDiv;
    }

    hideLoadingState() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;
        }
    }

    showErrorState(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'model-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Model Load Error</h3>
            <p>${message}</p>
            <button class="btn-accent mt-4" onclick="location.reload()">Retry</button>
        `;
        this.container.appendChild(errorDiv);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Handle auto rotation
        if (this.isRotating && this.model) {
            this.model.rotation.y += THREE.MathUtils.degToRad(this.rotationSpeed) * delta;
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update animations
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Clean up method for when component is destroyed
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.controls) {
            this.controls.dispose();
        }

        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);

        // Clean up Three.js objects
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.isMesh) {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => this.disposeMaterial(material));
                        } else {
                            this.disposeMaterial(object.material);
                        }
                    }
                }
            });
        }
    }

    disposeMaterial(material) {
        Object.keys(material).forEach(key => {
            if (material[key] && material[key].isTexture) {
                material[key].dispose();
            }
        });
        material.dispose();
    }
}

// Initialize model loader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const modelViewer = document.getElementById('tank-model-viewer');
    if (modelViewer) {
        // Check if Three.js is available
        if (typeof THREE !== 'undefined') {
            new ModelLoader('tank-model-viewer');
        } else {
            console.error('Three.js is not loaded');
            modelViewer.innerHTML = `
                <div class="model-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>3D Engine Not Available</h3>
                    <p>Three.js library failed to load. Please refresh the page.</p>
                </div>
            `;
        }
    }
});

// Handle fullscreen changes globally
document.addEventListener('fullscreenchange', function() {
    const modelViewer = document.getElementById('tank-model-viewer');
    if (!document.fullscreenElement && modelViewer) {
        modelViewer.classList.remove('fullscreen-model');
        const closeBtn = modelViewer.querySelector('.fullscreen-close');
        if (closeBtn) {
            closeBtn.remove();
        }
    }
});

document.addEventListener('webkitfullscreenchange', function() {
    const modelViewer = document.getElementById('tank-model-viewer');
    if (!document.webkitFullscreenElement && modelViewer) {
        modelViewer.classList.remove('fullscreen-model');
        const closeBtn = modelViewer.querySelector('.fullscreen-close');
        if (closeBtn) {
            closeBtn.remove();
        }
    }
});