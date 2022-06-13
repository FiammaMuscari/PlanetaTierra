import gsap from "gsap";
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)

//parte visual de los pixeles, emprolijar
const renderer = new THREE.WebGLRenderer(
  {antialias: true}
);
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

//crear la esfera
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture:{
        value:new THREE.TextureLoader().load('https://i.ibb.co/0ZWqKLN/map.jpg')
      }
    }
  })

)

scene.add(sphere)

//crear la atmosfera
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader:atmosphereVertexShader,
    fragmentShader:atmosphereFragmentShader,
    blending: THREE.AdditiveBlending, //difuminado
    side: THREE.BackSide //posiiton al fondo
    })
)
atmosphere.scale.set(1.1, 1.1, 1.1)
scene.add(atmosphere)
//giro de la esfera con mouse
const group = new THREE.Group()
group.add(sphere)
scene.add(group)

//estrellas
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color:0xffffff
})
//cantidades al azar
const starVertices = []
for(let i = 0; i < 10000; i++){
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = -Math.random() * 1000
  starVertices.push(x, y, z)
}
starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(
    starVertices, 3
  )
)
//estrellas como puntos
const stars = new THREE.Points(
  starGeometry, starMaterial
)
scene.add(stars)

//posicion de la camara mayor a 5 para poder ver la esfera
camera.position.z = 15

//movimiento del mouse antes de llamara a la rotacion
const mouse = {
  x: 0,
  y: 0
}
//animacion 
function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  sphere.rotation.y += 0.002 // rotacion velocidad
  gsap.to(group.rotation, {//posicion mouse movimiento del planeta en grupo con gsap resultado smooth
    x: -mouse.y * 0.3,
    y: mouse.x * 0.5,
    duration: 2 //delay smooth del movimiento
  })
  
}
animate()

//movimientos del mouse

addEventListener('mousemove', (event) => {
  mouse.x = (event.pageX / window.innerWidth)* 2 - 1
  mouse.y = -(event.pageY / window.innerHeight)* 2 + 1
  console.log(mouse);
})

let isDragging = false;
let previousMousePosition = {
    x: undefined,
    y: undefined
};

const toRadians = (angle) => {
    return angle * (Math.PI / 180);
};

//sin esto aparece un cuadrado blanco
const toDegrees = (angle) => {
    return angle * (180 / Math.PI);
}; 

const renderArea = renderer.domElement;

//al hacer click inicia el drag
renderArea.addEventListener('mousedown', (e) => {
    isDragging = true;
});
//movimiento con drag en la esfera
renderArea.addEventListener('mousemove', (e) => {
    let deltaMove = {
        x: e.offsetX-previousMousePosition.x,
        y: e.offsetY-previousMousePosition.y
    };

    if (isDragging) {

        let deltaRotationQuaternion = new THREE.Quaternion().

        setFromEuler(
            new THREE.Euler(toRadians(deltaMove.y * 0.3), toRadians(deltaMove.x * 0.3), 0, 'XYZ')
        );

        sphere.quaternion.multiplyQuaternions(deltaRotationQuaternion, sphere.quaternion);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});
//al soltar mouse
document.addEventListener('mouseup', (e) => {
    isDragging = false;
});