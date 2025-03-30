import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// 타원체 지구 크기 설정
const radiusX = 5; 
const radiusY = 5; 
const radiusZ = 5; 

document.addEventListener("DOMContentLoaded", () => {
  const canvasContainer = document.getElementById('three-canvas');
  const aspectRatio = canvasContainer.clientWidth / canvasContainer.clientHeight;

  // Three.js 기본 설정
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  canvasContainer.appendChild(renderer.domElement);
  
  // 카메라 위치 설정 및 초기 방향
  camera.position.z = -10;
  camera.position.x = -10 * Math.sqrt(3);
  camera.lookAt(0, 0, 0);

  // 지구 생성
  const geometry = new THREE.SphereGeometry(1, 32, 32); // 기본 반지름 1
  const texture = new THREE.TextureLoader().load('earth_texture.jpg');
  const material = new THREE.MeshPhongMaterial({ map: texture });
  const earth = new THREE.Mesh(geometry, material);
  // 타원체 스케일 적용
  earth.scale.set(radiusX, radiusY, radiusZ); 
  scene.add(earth);

  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // ------------------------------
  // 6개의 GPS 위성 궤도 (라인) 추가
  // ------------------------------
  const orbitScale = 10;         // 궤도 반경 확장
  const numPoints = 200;         // 궤도 점 개수
  const tMin = -Math.PI;
  const tMax = Math.PI;
  const dt = (tMax - tMin) / numPoints;

  // 35도의 sin, cos 값 미리 계산
  const sin35 = Math.sin(THREE.Math.degToRad(35));
  const cos35 = Math.cos(THREE.Math.degToRad(35));
  const sqrt3_2 = Math.sqrt(3) / 2;

  // 위성 궤도 생성 함수 (라인 그리기용)
  function createOrbit(getPoint, colorHex) {
    const points = [];
    for (let t = tMin; t <= tMax; t += dt) {
      const { x, y, z } = getPoint(t);
      points.push(new THREE.Vector3(x * orbitScale, y * orbitScale, z * orbitScale));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
  }

  // 궤도 함수 및 색상 정의 (6개 궤도)
  const orbitDefinitions = [
    { 
      fn: t => ({
        x: sin35 * Math.cos(t),
        y: cos35 * Math.cos(t),
        z: Math.sin(t)
      }),
      color: 0xff0000  // 빨강
    },
    { 
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) + (sqrt3_2) * Math.sin(t),
        y: cos35 * Math.cos(t),
        z: -sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0x00ff00  // 초록
    },
    { 
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) - (sqrt3_2) * Math.sin(t),
        y: cos35 * Math.cos(t),
        z: sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0x0000ff  // 파랑
    },
    { 
      fn: t => ({
        x: sin35 * Math.cos(t),
        y: -cos35 * Math.cos(t),
        z: Math.sin(t)
      }),
      color: 0xffff00  // 노랑
    },
    { 
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) + (sqrt3_2) * Math.sin(t),
        y: -cos35 * Math.cos(t),
        z: -sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0xff00ff  // 분홍
    },
    { 
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) - (sqrt3_2) * Math.sin(t),
        y: -cos35 * Math.cos(t),
        z: sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0x00ffff  // 하늘색
    }
  ];

  // 각 궤도의 라인 생성
  orbitDefinitions.forEach(def => {
    createOrbit(def.fn, def.color);
  });

  // ------------------------------
  // 인공위성 24개 생성 (각 궤도마다 4개씩, 위성 간 각도 90도)
  // ------------------------------
  const satellites = [];  // 각 위성: { orbitFn, offset, mesh }
  const satelliteGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const offsets = [0, Math.PI/2, Math.PI, 3*Math.PI/2];

  orbitDefinitions.forEach(def => {
    offsets.forEach(offset => {
      const material = new THREE.MeshPhongMaterial({ color: def.color });
      const mesh = new THREE.Mesh(satelliteGeometry, material);
      scene.add(mesh);
      satellites.push({
        orbitFn: def.fn,
        offset: offset,
        mesh: mesh
      });
    });
  });

  // ------------------------------
  // 애니메이션
  // ------------------------------
  let rotationSpeed = 0.01;      // 지구 자전 속도
  let satelliteSpeed = 0.1;     // 위성 궤도 진행 속도
  let t = 0;                   // 전역 시간 변수

  function animate() {
    requestAnimationFrame(animate);

    // 지구 회전 업데이트
    earth.rotation.y += rotationSpeed;

    // 전역 시간 업데이트 (위성 진행)
    t += satelliteSpeed;

    // 각 위성의 위치 업데이트
    satellites.forEach(sat => {
      const pos = sat.orbitFn(t + sat.offset);
      sat.mesh.position.set(
        pos.x * orbitScale,
        pos.y * orbitScale,
        pos.z * orbitScale
      );
    });

    renderer.render(scene, camera);
  }
  animate();

  // ------------------------------
  // 상호작용 코드 (플레이/슬라이더)
  // ------------------------------
  const playButton = document.querySelector(".play-button");
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.querySelector(".speed-value");
  let isPlaying = true;
 
  playButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    const icon = playButton.querySelector("i");
    if (isPlaying) {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    } else {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    }
  });
 
  // 슬라이더 값에 따라 지구의 회전속도와 위성의 속도가 함께 조절되도록 설정
  speedSlider.addEventListener("input", () => {
    const value = parseFloat(speedSlider.value);
    rotationSpeed = value * 0.001;
    // 위성 속도는 지구 회전속도의 2배 정도로 설정 (필요에 따라 조정 가능)
    satelliteSpeed = value * 0.002;
    speedValue.textContent = `${Math.floor(value * 20)}x`;
  });

  // ------------------------------
  // 창 크기 조정 이벤트
  // ------------------------------
  window.addEventListener('resize', () => {
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});
