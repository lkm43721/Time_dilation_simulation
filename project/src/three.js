import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// 타원체 지구 크기 설정
const radiusX = 1; 
const radiusY = 0.9965; 
const radiusZ = 1; 

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
  camera.position.z = 7;
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
  const orbitScale = 3.167;         // 궤도 반경 확장
  const numPoints = 200;         // 궤도 점 개수
  const tMin = -Math.PI;
  const tMax = Math.PI;
  const dt = (tMax - tMin) / numPoints;

  // 35도의 sin, cos 값 미리 계산
  const sin35 = Math.sin(THREE.MathUtils.degToRad(35));
  const cos35 = Math.cos(THREE.MathUtils.degToRad(35));
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
  const satelliteGeometry = new THREE.SphereGeometry(0.1, 16, 16);
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
  // 시간 및 속도 관련 상수 정의
  // ------------------------------
  // 지구 자전 주기: 23시간 56분 = 86160초
  const EARTH_ROTATION_PERIOD = 23 * 60 * 60 + 56 * 60; // 초 단위
  // 인공위성 궤도 주기: 지구 자전 주기의 1/2
  const SATELLITE_ORBIT_PERIOD = EARTH_ROTATION_PERIOD / 2; // 초 단위
  
  // 속도 배율 및 시간 관련 변수
  let speedMultiplier = 1000; // 초기 속도 배율 (1000x)
  const MIN_SPEED = 1;        // 최소 속도
  const MAX_SPEED = 20000;    // 최대 속도 20000x로 설정
  let simulationSeconds = 0; // 시뮬레이션 누적 시간 (초)
  let lastUpdateTime = Date.now(); // 마지막 업데이트 시간
  
  // 타이머 요소
  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');
  
  // 타이머 업데이트 함수
  function updateTimer() {
    const days = Math.floor(simulationSeconds / (24 * 60 * 60));
    const hours = Math.floor((simulationSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((simulationSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(simulationSeconds % 60);
    
    timerDays.textContent = days.toString().padStart(2, '0');
    timerHours.textContent = hours.toString().padStart(2, '0');
    timerMinutes.textContent = minutes.toString().padStart(2, '0');
    timerSeconds.textContent = seconds.toString().padStart(2, '0');
  }

  // ------------------------------
  // 애니메이션
  // ------------------------------
  let isPlaying = true;

  function animate() {
    requestAnimationFrame(animate);
    
    if (isPlaying) {
      // 실제 경과 시간 계산
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastUpdateTime) / 1000; // 초 단위
      lastUpdateTime = currentTime;
      
      // 시뮬레이션 시간 업데이트
      simulationSeconds += deltaTime * speedMultiplier;
      updateTimer();
      
      // 지구 회전 각도 계산 (0 ~ 2π)
      // 정확히 EARTH_ROTATION_PERIOD 초에 한 바퀴(2π)가 되도록 계산
      const earthRotationAngle = (simulationSeconds % EARTH_ROTATION_PERIOD) * (2 * Math.PI / EARTH_ROTATION_PERIOD);
      earth.rotation.y = earthRotationAngle;
      
      // 위성 위치 계산 - 정확히 SATELLITE_ORBIT_PERIOD 초에 한 바퀴가 되도록 계산
      const satelliteOrbitAngle = (simulationSeconds % SATELLITE_ORBIT_PERIOD) * (2 * Math.PI / SATELLITE_ORBIT_PERIOD);
      
      // 각 위성의 위치 업데이트
      satellites.forEach(sat => {
        const pos = sat.orbitFn(satelliteOrbitAngle + sat.offset);
        sat.mesh.position.set(
          pos.x * orbitScale,
          pos.y * orbitScale,
          pos.z * orbitScale
        );
      });
    }

    renderer.render(scene, camera);
  }
  animate();

  // ------------------------------
  // 상호작용 코드 (플레이/슬라이더)
  // ------------------------------
  const playButton = document.querySelector(".play-button");
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.querySelector(".speed-value");
 
  playButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    const icon = playButton.querySelector("i");
    if (isPlaying) {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
      lastUpdateTime = Date.now(); // 재생 시 시간 재설정
    } else {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    }
  });
 
  // 슬라이더 값 매핑 함수 (1~100 -> 1~20000)
  function mapSliderToSpeed(sliderValue) {
    // 로그 스케일 적용 (1~100 -> 1~20000)
    const minLog = Math.log10(MIN_SPEED);
    const maxLog = Math.log10(MAX_SPEED);
    const scale = (maxLog - minLog) / 99;
    
    // sliderValue(1~100) -> log 스케일(1~20000)
    return Math.round(Math.pow(10, minLog + (sliderValue - 1) * scale));
  }
  
  // 속도를 슬라이더 값으로 변환하는 역함수
  function mapSpeedToSlider(speed) {
    const minLog = Math.log10(MIN_SPEED);
    const maxLog = Math.log10(MAX_SPEED);
    const scale = (maxLog - minLog) / 99;
    
    // speed(1~20000) -> sliderValue(1~100)
    return Math.round(((Math.log10(speed) - minLog) / scale) + 1);
  }
  
  // 슬라이더 초기값 설정 (1000x에 해당하는 값)
  const initialSliderValue = mapSpeedToSlider(1000);
  speedSlider.value = initialSliderValue;
  speedValue.textContent = `${speedMultiplier}x`;
 
  // 슬라이더 값에 따라 속도 배율 조절
  speedSlider.addEventListener("input", () => {
    speedMultiplier = mapSliderToSpeed(parseFloat(speedSlider.value));
    speedValue.textContent = `${speedMultiplier}x`;
  });
  
  // 재설정 버튼
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", () => {
    // 시뮬레이션 시간 초기화
    simulationSeconds = 0;
    updateTimer();
    
    // 지구 회전 초기화
    earth.rotation.set(0, 0, 0);
    
    // 위성 위치 초기화
    satellites.forEach(sat => {
      const pos = sat.orbitFn(sat.offset);
      sat.mesh.position.set(
        pos.x * orbitScale,
        pos.y * orbitScale,
        pos.z * orbitScale
      );
    });
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