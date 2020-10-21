import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/GLTFLoader.js';



// variables for event listeners
const beginBtn = document.querySelector('#btn-begin');
const overlay = document.querySelector('#overlay');
const threeJsWindow = document.querySelector('#three-js-container');
const popupWindow = document.querySelector('.popup-window');
const closeBtn = document.querySelector('#btn-close');

let currentObject;

// loader
const loadingElem = document.querySelector('#loading');
const progressBarElem = loadingElem.querySelector('.progressbar');

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let orbiting = false;
let viewing = false;

const next = document.querySelector('#next');
const previous = document.querySelector('#previous');

let newLocation = 22.5;



// three.js functions
const main  = () => {
    const canvas = document.querySelector('#c');

    // renderer
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // camera
    const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 15000 );
    camera.position.set( 0, 20, 110);


    // scene
    const scene = new THREE.Scene();

    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 40;
    controls.maxDistance = 120;
    controls.minPolarAngle = 70 * Math.PI/180;
    controls.maxPolarAngle = 85 * Math.PI/180;
    controls.enableKeys = false;
    controls.maxAzimuthAngle = Math.PI * 0.07;
    controls.minAzimuthAngle = Math.PI * -0.07;


    

    // loaders
    const loadManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadManager);

    const addPointLight = (shade, intense, parent, angle, far, top, distance) => {
        const color = shade;
        const intensity = intense;
        const light = new THREE.SpotLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, top, camera.position.z -10);
        light.target.position.set(0, 0, 0);
        light.penumbra = 1;
        light.angle = angle;
        light.far = far;
        light.distance = distance;
        parent.add(light);
        parent.add(light.target);
    }

    addPointLight(0xFFFFFF, 0.7, scene, 1, 50, 10, 1000);

    scene.add( new THREE.AmbientLight( 0xffffff, 0.5 ) );

    

    // add two torus
    let column;
    let roof;
    let floor;

    {
        const radius = 20;
        const height = 40;
        const radialSegments = 100;
        const concrete = textureLoader.load('assets/concrete.jpg');
        concrete.magFilter = THREE.NearestFilter;
        concrete.wrapS = THREE.RepeatWrapping;
        concrete.wrapT = THREE.RepeatWrapping;
        concrete.magFilter = THREE.NearestFilter;
        concrete.repeat.set(radialSegments/30, height/30);

        const geometry = new THREE.CylinderGeometry( radius, radius, height, radialSegments,radialSegments,true );
        const material = new THREE.MeshPhongMaterial({map: concrete, side: THREE.DoubleSide, shininess: 0.2});
        column = new THREE.Mesh(geometry, material);
        column.rotation.z = 180* Math.PI/180;
        column.position.y = height/2;
        column.rotation.y = 22.5* Math.PI/180;
    }
    {
        const innerRadius = 20;  
        const outerRadius = 100;  
        const thetaSegments = 100;  
        const geometry = new THREE.RingBufferGeometry(
            innerRadius, outerRadius, thetaSegments);

        const concrete = textureLoader.load('assets/concrete.jpg');
        concrete.magFilter = THREE.NearestFilter;
        concrete.wrapS = THREE.RepeatWrapping;
        concrete.wrapT = THREE.RepeatWrapping;
        concrete.magFilter = THREE.NearestFilter;
        concrete.repeat.set(outerRadius/15, outerRadius/15);

        const material = new THREE.MeshPhongMaterial({map: concrete, side: THREE.DoubleSide, shininess: 0.2});

        roof = new THREE.Mesh(geometry, material);
        roof.position.y = -20;
        roof.rotation.x = 90* Math.PI/180;

        floor = new THREE.Mesh(geometry, material);
        floor.position.y = 20;
        floor.rotation.x = 90* Math.PI/180;

    }

    let walls = [];
    const centerWidth = 0;
    const centerHeight = 0;
    const width = 80;  
    const height = 40;

    const concrete = textureLoader.load('assets/concrete.jpg');
        concrete.magFilter = THREE.NearestFilter;
        concrete.wrapS = THREE.RepeatWrapping;
        concrete.wrapT = THREE.RepeatWrapping;
        concrete.magFilter = THREE.NearestFilter;
        concrete.repeat.set(width/30, height/30);

    for(let i = 0; i < 8; i++){
        createWall(45*i);
    }

    function createWall(angle){centerWidth
        const centerGeometery = new THREE.PlaneBufferGeometry(centerWidth, centerHeight);
        const geometry = new THREE.PlaneBufferGeometry(width, height);
        const material = new THREE.MeshPhongMaterial({map: concrete, side: THREE.DoubleSide, shininess: 0.2});
        const centerMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})
        const center = new THREE.Mesh(centerGeometery, centerMaterial);
        center.rotation.y = angle * Math.PI/180;
        const wall = new THREE.Mesh(geometry, material);
        wall.position.x = 20 + width/2;

        walls.push({center, wall});

    }

    let lenses = [];
    for(let i = 0; i < 16; i+=2){
        makeLens(i + 1);
    }
    console.log(lenses);

    function makeLens(index) {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('assets/lens.gltf', (gltf) => {
            const root = gltf.scene;
            const texture = textureLoader.load(assets + index + '.jpg');
            const material = new THREE.MeshPhongMaterial({color: 0xffffff, map: texture });;
            root.children[2].material = material;
            root.rotation.y = 90* Math.PI/180;
            root.position.y = -height/4;
            lenses.push(root);
        });
        gltfLoader.load('assets/lens.gltf', (gltf) => {
            const root = gltf.scene;
            const texture = textureLoader.load(assets + (index + 1) + '.jpg');
            const material = new THREE.MeshPhongMaterial({color: 0xffffff, map: texture });;
            root.children[2].material = material;
            root.rotation.y = - Math.PI /2;
            root.position.y = -height/4;
            lenses.push(root);
        });


    }

        


    let barriers = [];


    loadManager.onLoad = () => {
        loadingElem.style.display = 'none';
        scene.add(column);
        column.add(roof);
        column.add(floor);

        walls.forEach(wall => {
            column.add(wall.center);
            wall.center.add(wall.wall);
        });

        console.log(walls);
        lenses.forEach((lens, index) => {
            if(index % 2 === 0){
                //even number
                const barrier = walls[index/2].wall;
                barrier.add(lens);
            } else {
                const barrier = walls[(index - 1)/2].wall;
                barrier.add(lens);
            }
        })
        
    };

    

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal*100;
        progressBarElem.style.width = progress + '%';
    };


    
  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.raycaster.far = 300;
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera) {
      // restore the color if there is a picked object
      if (this.pickedObject) {
        this.pickedObject = undefined;
      }

      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
      }
    }
  }

  const pickPosition = {x: 0, y: 0};
  const pickHelper = new PickHelper();
  clearPickPosition();

    

    renderer.render( scene, camera );

    // resize function
    const onWindowResize = () => {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
    
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    
    }

    const render = () => {
        currentObject = undefined;
        let itemSelected = false;
        window.addEventListener('resize', onWindowResize, false);

        pickHelper.pick(pickPosition, scene, camera);
        
        if(pickHelper.pickedObject && !orbiting){
            if(pickHelper.pickedObject.name){
                currentObject = pickHelper.pickedObject.name;
                itemSelected = true;
                redColor(pickHelper.pickedObject, true);
            }
        }

        const location = newLocation * Math.PI/180;
        if(column.rotation.y !== location){
            column.rotation.y += ((location - column.rotation.y) )/100
        }
        
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.render(scene, camera);

        requestAnimationFrame(render);


        
    }

    requestAnimationFrame(render);
    controls.update();


    function getCanvasRelativePosition(event) {
		const rect = canvas.getBoundingClientRect();
		return {
		x: (event.clientX - rect.left) * canvas.width  / rect.width,
		y: (event.clientY - rect.top ) * canvas.height / rect.height,
		};
	}

	function setPickPosition(event) {
		const pos = getCanvasRelativePosition(event);
		pickPosition.x = (pos.x /  canvas.width ) *  2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
	}

	
    controls.addEventListener('change', () => {

        orbiting = true;

    });

	function clearPickPosition() {
		pickPosition.x = -100000;
		pickPosition.y = -100000;
  }
  

    window.addEventListener('mousemove', setPickPosition);
	window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
    window.addEventListener('mouseup', () => {
        orbiting = false;
    })


	window.addEventListener('touchstart', (event) => {
		// prevent the window from scrolling
		event.preventDefault();
        setPickPosition(event.touches[0]);
        checkForClick();
	}, {passive: false});

	window.addEventListener('touchmove', (event) => {
        setPickPosition(event.touches[0]);
        checkForClick();
	});

	window.addEventListener('touchend', () => {
        clearPickPosition();
        orbiting = false;
        checkForClick();
	})
}


// event listeners
beginBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    threeJsWindow.style.display = 'block';
    main();
});

beginBtn.addEventListener('touchend', () => {
    overlay.style.display = 'none';
    threeJsWindow.style.display = 'block';
    main();
});


// functions
window.addEventListener('mouseup', () => {
    checkForClick();
});

const checkForClick = () => {
    if(!orbiting && !viewing && currentObject){
        console.log(currentObject);
    }
    currentObject = undefined;
}


closeBtn.addEventListener('click', () => {
    closeWindow();
})
closeBtn.addEventListener('touchstart', () => {
    closeWindow();
})

function closeWindow() {
    popupWindow.style.opacity = 0;
    popupWindow.style.zIndex = -10;
    viewing = false;
}
function openWindow(){
    popupWindow.style.opacity = 1;
    popupWindow.style.zIndex = 100;
    viewing = true;
}

next.addEventListener('click', () => {
    newLocation -= 45;
});
previous.addEventListener('click', () => {
    newLocation += 45;
})