import * as THREE from 'three';
import * as YUKA from 'yuka';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0xA3A3A3);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 15);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

const vehicle = new YUKA.Vehicle();

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const path = new YUKA.Path();
path.add( new YUKA.Vector3(-6, 0, 4));
path.add( new YUKA.Vector3(-12, 0, 0));
path.add( new YUKA.Vector3(-6, 0, -12));
path.add( new YUKA.Vector3(0, 0, 0));
path.add( new YUKA.Vector3(8, 0, -8));
path.add( new YUKA.Vector3(10, 0, 0));
path.add( new YUKA.Vector3(4, 0, 4));
path.add( new YUKA.Vector3(0, 0, 6));

path.loop = true;

vehicle.position.copy(path.current());

vehicle.maxSpeed = 3;

const followPathBehavior = new YUKA.FollowPathBehavior(path, 3);
vehicle.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
//onPathBehavior.radius = 2;
vehicle.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

function createCPointMesh(name, x, y, z) {
    const geo = new THREE.SphereGeometry(.25)
    const mat = new THREE.MeshBasicMaterial({color: 0xFF0000})
    const mesh = new THREE.Mesh(geo, mat)

    mesh.position.set(x,y,z)
    mesh.name = name
    return mesh
}

const group = new THREE.Group()

const sphereMesh1 = createCPointMesh('sphereMesh1', -6, 0, 4)
group.add(sphereMesh1)

const sphereMesh2 = createCPointMesh('sphereMesh2', -12, 0, 0)
group.add(sphereMesh2)

const sphereMesh3 = createCPointMesh('sphereMesh3', -6, 0, -12)
group.add(sphereMesh3)

const sphereMesh4 = createCPointMesh('sphereMesh4', 0, 0, 0)
group.add(sphereMesh4)

const sphereMesh5 = createCPointMesh('sphereMesh5', 8, 0, -8)
group.add(sphereMesh5)

const sphereMesh6 = createCPointMesh('sphereMesh6', 10, 0, 0)
group.add(sphereMesh6)

const sphereMesh7 = createCPointMesh('sphereMesh7', 4, 0, 4)
group.add(sphereMesh7)

const sphereMesh8 = createCPointMesh('sphereMesh8', 0, 0, 6)
group.add(sphereMesh8)

scene.add(group)

const p = document.createElement('p')
p.className = 'tooltip'
const pContainer = document.createElement('div')
pContainer.appendChild(p)
const cPointLabel = new CSS2DObject(pContainer)
scene.add(cPointLabel)

const mousePos = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

window.addEventListener('mousemove', function (e) {
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mousePos, camera)
    const intersects = raycaster.intersectObject(group)

    if(intersects.length > 0){
        switch (intersects[0].object.name) {
            case 'sphereMesh1':
                p.className = 'tooltip show'
                cPointLabel.position.set(-6, .8, 4)
                p.textContent = 'Checkpont 1 (-6, 0, 4)'
                break;
            case 'sphereMesh2':
                p.className = 'tooltip show'
                cPointLabel.position.set(-12, .8, 0)
                p.textContent = 'Checkpont 2 (-12, .8, 0)'
                break;
            case 'sphereMesh3':
                p.className = 'tooltip show'
                cPointLabel.position.set(-6, .8, -12)
                p.textContent = 'Checkpont 3 (-12, .8, 0)'
                break;
            case 'sphereMesh4':
                p.className = 'tooltip show'
                cPointLabel.position.set(0, .8, 0)
                p.textContent = 'Checkpont 4 (0, .8, 0)'
                break;
            case 'sphereMesh5':
                p.className = 'tooltip show'
                cPointLabel.position.set(8, .8, -8)
                p.textContent = 'Checkpont 5 (8, .8, -8)'
                break;
            case 'sphereMesh6':
                p.className = 'tooltip show'
                cPointLabel.position.set(10, .8, 0)
                p.textContent = 'Checkpont 6 (10, .8, 0)'
                break;
            case 'sphereMesh7':
                p.className = 'tooltip show'
                cPointLabel.position.set(4, .8, 4)
                p.textContent = 'Checkpont 7 (4, .8, 4)'
                break;
            case 'sphereMesh8':
                p.className = 'tooltip show'
                cPointLabel.position.set(0, .8, 6)
                p.textContent = 'Checkpont 8 (0, 0, 6)'
                break;
            default:
                break;
        }
    } else {
        p.className = 'tooltip hide'
    }
})

const carP = document.createElement('p')
const carLabel = new CSS2DObject(carP)
carLabel.position.set(0,3,0)

const loader = new GLTFLoader();
loader.load('./assets/SUV.glb', function(glb) {
    const model = glb.scene;
    //model.scale.set(0.5, 0.5, 0.5);
    scene.add(model);
    model.matrixAutoUpdate = false;
    vehicle.scale = new YUKA.Vector3(0.5, 0.5, 0.5);
    vehicle.setRenderComponent(model, sync);

    model.add(carLabel)
});

// const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
// vehicleGeometry.rotateX(Math.PI * 0.5);
// const vehicleMaterial = new THREE.MeshNormalMaterial();
// const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
// vehicleMesh.matrixAutoUpdate = false;
// scene.add(vehicleMesh);

const position = [];
for(let i = 0; i < path._waypoints.length; i++) {
    const waypoint = path._waypoints[i];
    position.push(waypoint.x, waypoint.y, waypoint.z);
}

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));

const lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
scene.add(lines);

const time = new YUKA.Time();

function animate() {
    const delta = time.update().getDelta();
    entityManager.update(delta);

    labelRenderer.render(scene, camera)

    carP.textContent = 'Current speed: ' + vehicle.getSpeed().toFixed(2)

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
});