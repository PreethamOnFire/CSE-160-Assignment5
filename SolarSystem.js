import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { TAARenderPass } from 'three/addons/postprocessing/TAARenderPass.js';

function main() {
    const canvas = document.querySelector('#screen');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    const listener = new THREE.AudioListener();
    camera.add(listener);
    let clock = new THREE.Clock();
    const loader = new THREE.TextureLoader();
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas, logarithmicDepthBuffer: true, powerPreference: "high-performance"});
    renderer.setSize( window.innerWidth, window.innerHeight );
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.setSize( window.innerWidth, window.innerHeight);
    composer.addPass(renderPass);

    const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);

    const taaRenderPass = new TAARenderPass(scene, camera);
    taaRenderPass.sampleLevel = 3;
    taaRenderPass.unbiased = false;
    composer.addPass(taaRenderPass);

    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.edgeStrength = 3;
    outlinePass.edgeGlow = 3;
    outlinePass.edgeThickness = 5;
    outlinePass.pulsePeriod = 1;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#ffffff');
    composer.addPass(outlinePass);


    const outputPass = new OutputPass();
    outlinePass.renderToScreen = false;
    const originalRender = outlinePass.render;
    outlinePass.render = function(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        originalRender.call(this, renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    };
    composer.addPass(outputPass);

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const dodecahedronGeomtery = new THREE.DodecahedronGeometry(1, 0);
    const sphereGeomtry = new THREE.SphereGeometry(1, 100, 100);
    const ringGeomtry = new THREE.RingGeometry(1,1, 64);
    const saturnRingGeomtry = new THREE.RingGeometry(3, 5, 64);
    var pos = saturnRingGeomtry.attributes.position;
    var v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
        v3.fromBufferAttribute(pos, i);
        saturnRingGeomtry.attributes.uv.setXY(i, v3.length() < 4 ? 0 : 1, 1);
    }

    const cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enableDamping = true;
    cameraControls.dampingFactor = 0.05;
    cameraControls.minDistance = 5;
    cameraControls.maxDistance = 200;

    const audioLoader = new THREE.AudioLoader();
        audioLoader.load( './assets/Mass Effect Trilogy - Extended Galaxy Map Theme (HD).mp3', function ( buffer ) { 
        const sound = new THREE.Audio( listener );
        sound.setBuffer( buffer ); 
        sound.setLoop( true );    
        sound.setVolume( 0.5 );   
        sound.play();          
    } );

    let normandy;
    let selectedPlanet = {
        planet: null,
        id: null,
    }

    const planetData = {
        0: { 
            name: "The Sun",
            distance: "0 AU",
            radius: "432685.6 miles",
            period: "N/A",
            temperature: "5,778 K surface",
            composition: "Hydrogen, Helium",
            moons: "N/A",
        },
        1: { 
            name: "Mars",
            distance: "1.52 AU",
            radius: "2,106 miles",
            period: "687 Earth days",
            temperature: "-153°C to 20°C",
            composition: "Iron oxide, basalt",
            moons: "Phobos and Deimos"
        },
        2: { 
            name: "Mercury",
            distance: "0.4 AU",
            radius: "1,516 miles",
            period: "88 Earth days",
            temperature: "-180°C to 430°C",
            composition: "Iron core, silicate mantle",
            moons: "None",
        },
        3: { 
            name: "Venus",
            distance: "0.72 AU",
            radius: "3750.5 miles",
            period: "243 Earth days",
            temperature: "475 °C",
            composition: "Carbon dioxide atmosphere",
            moons: "None",
        },
        4: { 
            name: "Earth",
            distance: "1.00 AU",
            radius: "3963 miles",
            period: "365.25 days",
            temperature: "-89°C to 58°C",
            composition: "Nitrogen, oxygen atmosphere",
            moons: "Our Moon"
        },
        5: { 
            name: "Jupiter",
            distance: "5.20 AU",
            radius: "43,440.7 miles",
            period: "12 Earth years",
            temperature: "-108°C",
            composition: "Hydrogen, helium gas giant",
            moons: "Ganymede, Callisto, lo, Europa, and some more",
        },
        6: { 
            name: "Saturn",
            distance: "9.58 AU",
            radius: "37,448.5 miles",
            period: "29 Earth years",
            temperature: "-139°C",
            composition: "Hydrogen, helium with rings",
            moons: "There are 146 moons",
        },
        7: { 
            name: "Uranus",
            distance: "19.22 AU",
            radius: "15,881.5 miles",
            period: "84 Earth years",
            temperature: "-197°C",
            composition: "Water, methane, ammonia",
            moons: "28 moons"
        },
        8: { 
            name: "Neptune",
            distance: "30.05 AU",
            radius: "15,387.5 miles",
            period: "165 Earth years",
            temperature: "-201°C",
            composition: "Water, methane, ammonia",
            moons: "16 moons",
        }
    };

    var planetTextures = {
        mars: configureTexture(loader.load('./assets/2k_mars.jpg')),
        sun: configureTexture(loader.load('./assets/2k_sun.jpg')),
        mercury: configureTexture(loader.load('./assets/2k_mercury.jpg')),
        venus: configureTexture(loader.load('./assets/2k_venus_surface.jpg')),
        jupiter: configureTexture(loader.load('./assets/2k_jupiter.jpg')),
        earth: configureTexture(loader.load('./assets/2k_earth_daymap.jpg')),
        saturn: configureTexture(loader.load('./assets/2k_saturn.jpg')),
        uranus: configureTexture(loader.load('./assets/2k_uranus.jpg')),
        neptune: configureTexture(loader.load('./assets/2k_neptune.jpg')),
        asteroids: configureTexture(loader.load('./assets/2k_ceres_fictional.jpg')),
    }

    var saturnRingTexture = configureTexture(loader.load('assets/2k_saturn_ring_alpha.png'));

    const background = loader.load('assets/2k_stars_milky_way.jpg', () => {
        background.mapping = THREE.EquirectangularReflectionMapping;
        background.colorSpace = THREE.SRGBColorSpace;
        background.colorSpace = THREE.SRGBColorSpace;
        background.minFilter = THREE.LinearFilter;
        background.magFilter = THREE.LinearFilter;
        background.generateMipmaps = false;
        scene.background = background;
    })

    function configureTexture(texture) {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    var planetDist = [0, 165, 42, 75, 110, 300, 500, 600, 700];

    var cubes = [
        makeInstanceTexture(sphereGeomtry, planetTextures.sun, 0, 0, 0, -30),
        makeInstanceTexture(sphereGeomtry, planetTextures.mars, 0, 0, 16.5, 4.8, 0.43964843857628105),
        makeInstanceTexture(sphereGeomtry, planetTextures.mercury, 0, 0, 4.2, 3.4),
        makeInstanceTexture(sphereGeomtry, planetTextures.venus, 0, 0, 7.5, 8.6, 3.0962141),
        makeInstanceTexture(sphereGeomtry, planetTextures.earth, 0, 0, 11.0, 9.1, 0.40927971),
        makeInstanceTexture(sphereGeomtry, planetTextures.jupiter, 0, 0, 30.0, 20),
        makeInstanceTexture(sphereGeomtry, planetTextures.saturn, 0, 0, 50.0, 16.4, 0.471239),
        makeInstanceTexture(sphereGeomtry, planetTextures.uranus, 0, 0, 60.0, 13.4, 1.70693200844622),
        makeInstanceTexture(sphereGeomtry, planetTextures.neptune, 0, 0, 70.0, 13.3, 0.5166174585890401),
    ];
    cubes[0].material.side = THREE.BackSide;
    cubes[4].material.specularMap = loader.load('assets/2k_earth_specular_map.tif');

    var saturnRing = makeInstanceTexture(saturnRingGeomtry, saturnRingTexture, 0, 0, 50.0, 8, Math.PI + Math.PI/2+0.471239);
    saturnRing.material.side = THREE.DoubleSide;

    var asteroids = [];

    function generateAsteroids() {
        const minDistance = 180; 
        const maxDistance = 280; 
        
        for (let i = 0; i < 300; i++) {
            const distance = minDistance + Math.random() * (maxDistance - minDistance);
            
            const angle = Math.random() * Math.PI * 2;
        
            const x = distance * Math.cos(angle);
            const z = distance * Math.sin(angle);
            
            const y = (Math.random() - 0.5) * 10;

            const size = 0.1 + Math.random() * 10;

            const choice =  Math.floor(Math.random() * 2);
            var asteroid;
            switch(choice) {
                case 0:
                    asteroid = makeInstanceTexture(cubeGeometry, planetTextures.asteroids, x, y, z, size);
                    break;
                case 1: 
                    asteroid = makeInstanceTexture(dodecahedronGeomtery, planetTextures.asteroids, x, y, z, size);
                    break;
            }
            
            
            asteroid.rotation.x = Math.random() * Math.PI * 2;
            asteroid.rotation.y = Math.random() * Math.PI * 2;
            asteroid.rotation.z = Math.random() * Math.PI * 2;
            
            asteroid.userData = {
                distance: distance,
                angle: angle,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            
            asteroids.push(asteroid);
        }
    }

    generateAsteroids();

    var outlines = [
        makeInstanceColor(ringGeomtry, '#90D5FF', 165),
        makeInstanceColor(ringGeomtry, '#90D5FF', 42),
        makeInstanceColor(ringGeomtry, '#90D5FF', 75),
        makeInstanceColor(ringGeomtry, '#90D5FF', 110),
        makeInstanceColor(ringGeomtry, '#90D5FF', 300),
        makeInstanceColor(ringGeomtry, '#90D5FF', 500),
        makeInstanceColor(ringGeomtry, '#90D5FF', 600),
        makeInstanceColor(ringGeomtry, '#90D5FF', 700),
    ]

    const pointLight = new THREE.PointLight(0xFFFFFF, 5, 0, 0);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
    const spotLight = new THREE.SpotLight(0xFFFFFF, 150, 200, Math.PI/6, 0.25, 1);
    const sunFlare = new Lensflare();
    const sunFlareTexture = loader.load('assets/Texturelabs_LensFX_139S.jpg');
    sunFlareTexture.colorSpace = THREE.SRGBColorSpace;
    sunFlare.addElement( new LensflareElement( sunFlareTexture, 800, 0) );
    sunFlare.addElement( new LensflareElement( sunFlareTexture, 512, 0.2 ) );
    sunFlare.addElement( new LensflareElement( sunFlareTexture, 60, 0.6 ) );
    pointLight.add(sunFlare);
    pointLight.position.set(0, 0, 0);

    scene.add(pointLight);
    scene.add(ambientLight);
    scene.add(spotLight);

    mtlLoader.load('assets/Normandy/Normandy.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);  
    })
    objLoader.load('assets/Normandy/Normandy.obj', (root) => {
        root.position.z = -140;
        root.scale.multiplyScalar(0.001);
        root.rotateY(Math.PI/2);
        normandy = root;
        scene.add(root);

        camera.position.set(normandy.position.x, normandy.position.y + 10, normandy.position.z - 30);
        cameraControls.target.copy(normandy.position);
        spotLight.position.set(normandy.position.x, normandy.position.y + 40, normandy.position.z);
        spotLight.target = normandy;
    });
    
    function makeInstanceColor(geometry, color, scale=1, x=0,) {
        const material = new THREE.LineBasicMaterial( { color: color } );
        const obj = new THREE.LineLoop(geometry, material);
        scene.add(obj);
        obj.position.x = x;
        obj.rotateX(Math.PI / 2);
        obj.scale.multiplyScalar(scale);
        return obj;
    }

    function makeInstanceTexture(geometry, texture, x=0, y=0, z=0, scale=1, rotateX=0, rotateY=0) {
        const material = new THREE.MeshPhongMaterial( { map: texture } );
        const obj = new THREE.Mesh(geometry, material);
        scene.add(obj);
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        obj.scale.multiplyScalar(scale);
        obj.rotateX(rotateX);
        obj.rotateY(rotateY);
        return obj;
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        composer.setSize(window.innerWidth, window.innerHeight);
        
        ssaoPass.setSize(window.innerWidth, window.innerHeight);
        
        outlinePass.setSize(window.innerWidth, window.innerHeight);
    
        return needResize;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);

    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
    }

    var e = false;

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        if (cameraIntroAnimation.isPlaying) {
            cameraIntroAnimation.isPlaying = false;
            var menu = document.getElementById("introMenu");
            menu.style.display = 'none';
            cameraControls.enabled = true;
            return;
        }

        if (keys.hasOwnProperty(key)) {
            keys[key] = true;
        } else if (key == 'e') {
            e = !e;
        }
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (keys.hasOwnProperty(key)) {
            keys[key] = false;
        }
    });

    function handleNormandyMovement(delta) {
        if (!normandy) return;

        const moveSpeed = 50 * delta;
        const movement = new THREE.Vector3();

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; 
        cameraDirection.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        cameraRight.normalize();

        if (keys.w) {
            movement.add(cameraDirection.clone().multiplyScalar(moveSpeed));
        }
        if (keys.a) {
            movement.add(cameraRight.clone().multiplyScalar(-moveSpeed));
        }
        if (keys.s) {
             movement.add(cameraDirection.clone().multiplyScalar(-moveSpeed));
        }
        if (keys.d) {
            movement.add(cameraRight.clone().multiplyScalar(moveSpeed));
        }

        if (movement.length() > 0 && !e) {
            normandy.position.add(movement);
            const movementDirection = movement.clone().normalize();
            const targetRotation = Math.atan2(movementDirection.x, movementDirection.z) + Math.PI/2;
            normandy.rotation.y = targetRotation;
            cameraControls.target.copy(normandy.position);
            spotLight.position.set(normandy.position.x, normandy.position.y + 40, normandy.position.z);
            spotLight.target = normandy;
            console.log(spotLight.target.position);
        }
    }

    function handlePlanetInteraction() {
        if (!normandy || !selectedPlanet) return; 
        if (e) {
            cameraControls.target.copy(selectedPlanet.planet.position);
            showPlanetUI(selectedPlanet.id);
        } else {
            cameraControls.target.copy(normandy.position);
            closePlanetUI();
        }
    }

    function showPlanetUI(planetIndex) {
        const ui = document.getElementById('planetUI');
        const data = planetData[planetIndex];
        
        if (data && ui) {
            document.getElementById('planetName').textContent = data.name;
            document.getElementById('planetDistance').textContent = data.distance;
            document.getElementById('planetRadius').textContent = data.radius;
            document.getElementById('planetPeriod').textContent = data.period;
            document.getElementById('planetTemp').textContent = data.temperature;
            document.getElementById('planetComposition').textContent = data.composition;
            document.getElementById('planetMoons').textContent = data.moons;
            
            ui.style.display = 'block';
        }
    }

    function closePlanetUI() {
        const ui = document.getElementById('planetUI');
        if (ui) {
            ui.style.display = 'none';
        }
    }

    function normandyToPlanet() {
        if(!normandy || e) return;
        let closestPlanet = null;
        let closestDistance = Infinity;
        let closestId = null;
        cubes.forEach((planet, x) => {
             const distance = normandy.position.distanceTo(planet.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPlanet = planet;
                closestId = x;
            }
        })
        if (outlinePass.selectedObjects.length > 0){
            if (outlinePass.selectedObjects[0] !== closestPlanet) {
                outlinePass.selectedObjects = [];
                outlinePass.selectedObjects.push(closestPlanet);
                selectedPlanet.planet = closestPlanet;
                selectedPlanet.id = closestId;
            }
        } else {
            outlinePass.selectedObjects.push(closestPlanet);
            selectedPlanet.planet = closestPlanet;
            selectedPlanet.id = closestId;
        }
    }

    let cameraIntroAnimation = {
        isPlaying: true,
        radius: 30,
        height: 10,
        speed: 0.5, 
        angle: Math.PI 
    };

    function introAnimation(delta) {
        if (!normandy || !cameraIntroAnimation.isPlaying) return;
        cameraIntroAnimation.angle += cameraIntroAnimation.speed * delta;
    
        const x = normandy.position.x + cameraIntroAnimation.radius * Math.cos(cameraIntroAnimation.angle);
        const y = normandy.position.y + cameraIntroAnimation.height;
        const z = normandy.position.z + cameraIntroAnimation.radius * Math.sin(cameraIntroAnimation.angle);
        
        camera.position.set(x, y, z);
        
        camera.lookAt(normandy.position);
    }

    function render(time) {
        time *= 0.001;
        var delta = clock.getDelta();

        if (resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.y = rot;
            cube.position.x = planetDist[ndx] * Math.cos(time * (300 / Math.max(planetDist[ndx], 1) * 0.05));
            cube.position.z = planetDist[ndx] * Math.sin(time * (300 / Math.max(planetDist[ndx], 1) * 0.05));
        });

        asteroids.forEach((asteroid) => {
            const orbitSpeed = 300 / Math.max(asteroid.userData.distance, 1) * 0.05;
            asteroid.userData.angle += orbitSpeed * 0.001;
            
            asteroid.position.x = asteroid.userData.distance * Math.cos(asteroid.userData.angle);
            asteroid.position.z = asteroid.userData.distance * Math.sin(asteroid.userData.angle);

            asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
            asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
            asteroid.rotation.z += asteroid.userData.rotationSpeed.z;
        })

        saturnRing.position.x = planetDist[6] * Math.cos(time * (300 / Math.max(planetDist[6], 1) * 0.05));
        saturnRing.position.z = planetDist[6] * Math.sin(time * (300 / Math.max(planetDist[6], 1) * 0.05));
        introAnimation(delta);
        normandyToPlanet();
        handleNormandyMovement(delta);
        handlePlanetInteraction();
        cameraControls.update(delta);
        composer.render();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();