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
  const texture = new THREE.TextureLoader().load('earth_texture.png');
  const material = new THREE.MeshPhongMaterial({ map: texture });
  const earth = new THREE.Mesh(geometry, material);
  earth.scale.set(radiusX, radiusY, radiusZ); // 타원체 스케일 적용
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
  const orbitScale = 3.167; // 궤도 반경 확장
  const numPoints = 200; // 궤도 점 개수
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
      color: 0xff0000 // 빨강
    },
    {
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) + (sqrt3_2) * Math.sin(t),
        y: cos35 * Math.cos(t),
        z: -sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0x00ff00 // 초록
    },
    {
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) - (sqrt3_2) * Math.sin(t),
        y: cos35 * Math.cos(t),
        z: sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0x0000ff // 파랑
    },
    {
      fn: t => ({
        x: sin35 * Math.cos(t),
        y: -cos35 * Math.cos(t),
        z: Math.sin(t)
      }),
      color: 0xffff00 // 노랑
    },
    {
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) + (sqrt3_2) * Math.sin(t),
        y: -cos35 * Math.cos(t),
        z: -sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0xff00ff // 분홍
    },
    {
      fn: t => ({
        x: 0.5 * sin35 * Math.cos(t) - (sqrt3_2) * Math.sin(t),
        y: -cos35 * Math.cos(t),
        z: sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t)
      }),
      color: 0x00ffff // 하늘색
    }
  ];

  // 각 궤도의 라인 생성
  orbitDefinitions.forEach(def => {
    createOrbit(def.fn, def.color);
  });

  // ------------------------------
  // 인공위성 24개 생성 (각 궤도마다 4개씩, 위성 간 각도 90도)
  // ------------------------------
  const satellites = []; // 각 위성: { id, orbitFn, offset, mesh, originalColor }
  const satelliteGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const offsets = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
  let satelliteId = 1; // 위성 ID 시작 번호

  orbitDefinitions.forEach(def => {
    offsets.forEach(offset => {
      const material = new THREE.MeshPhongMaterial({ color: def.color });
      const mesh = new THREE.Mesh(satelliteGeometry, material);
      mesh.userData = { id: satelliteId }; // 고유 ID 부여
      scene.add(mesh);
      satellites.push({
        id: satelliteId,
        orbitFn: def.fn,
        offset: offset,
        mesh: mesh,
        originalColor: def.color // 원래 색상 저장
      });
      satelliteId++;
    });
  });

  // ------------------------------
  // Raycaster 및 마우스 벡터 설정
  // ------------------------------
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredSatellite = null; // 현재 호버된 위성 추적

  // 클릭 이벤트 처리
  canvasContainer.addEventListener('click', onCanvasClick, false);

  function onCanvasClick(event) {
    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(satellites.map(sat => sat.mesh));

    if (intersects.length > 0) {
      const selectedSatellite = intersects[0].object;
      const satelliteId = selectedSatellite.userData.id;
      showSatelliteInfo(satelliteId);
    }
  }

  // 마우스 이동 이벤트 처리 (호버)
  canvasContainer.addEventListener('mousemove', onMouseMove, false);

  function onMouseMove(event) {
    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(satellites.map(sat => sat.mesh));

    // 이전에 호버된 위성이 있으면 원래 색상으로 복원
    if (hoveredSatellite && (!intersects.length || intersects[0].object !== hoveredSatellite)) {
      const sat = satellites.find(s => s.mesh === hoveredSatellite);
      sat.mesh.material.color.setHex(sat.originalColor);
      hoveredSatellite = null;
    }

    // 새로운 위성에 호버된 경우 색상 변경
    if (intersects.length > 0) {
      const newHoveredSatellite = intersects[0].object;
      if (newHoveredSatellite !== hoveredSatellite) {
        hoveredSatellite = newHoveredSatellite;
        hoveredSatellite.material.color.setHex(0xffffff); // 흰색으로 변경
      }
    }
  }

  // 위성 정보 표시 함수
  function showSatelliteInfo(id) {
    const satelliteIdElement = document.getElementById('satellite-id');
    if (satelliteIdElement) {
      satelliteIdElement.textContent = id;
    } else {
      console.warn('satellite-id 요소를 찾을 수 없습니다.');
    }
  }

  // ------------------------------
  // 시간 및 속도 관련 상수 정의
  // ------------------------------
  const EARTH_ROTATION_PERIOD = 23 * 60 * 60 + 56 * 60; // 지구 자전 주기 (초)
  const SATELLITE_ORBIT_PERIOD = EARTH_ROTATION_PERIOD / 2; // 인공위성 궤도 주기 (초)

  // 속도 배율 및 시간 관련 변수
  let speedMultiplier = 1000; // 초기 속도 배율 (1000x)
  const MIN_SPEED = 1; // 최소 속도
  const MAX_SPEED = 20000; // 최대 속도
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
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastUpdateTime) / 1000; // 초 단위
      lastUpdateTime = currentTime;

      simulationSeconds += deltaTime * speedMultiplier;
      updateTimer();

      const earthRotationAngle = (simulationSeconds % EARTH_ROTATION_PERIOD) * (2 * Math.PI / EARTH_ROTATION_PERIOD);
      earth.rotation.y = earthRotationAngle;

      const satelliteOrbitAngle = (simulationSeconds % SATELLITE_ORBIT_PERIOD) * (2 * Math.PI / SATELLITE_ORBIT_PERIOD);

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
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
      lastUpdateTime = Date.now();
    } else {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  });

  function mapSliderToSpeed(sliderValue) {
    const minLog = Math.log10(MIN_SPEED);
    const maxLog = Math.log10(MAX_SPEED);
    const scale = (maxLog - minLog) / 99;
    return Math.round(Math.pow(10, minLog + (sliderValue - 1) * scale));
  }

  function mapSpeedToSlider(speed) {
    const minLog = Math.log10(MIN_SPEED);
    const maxLog = Math.log10(MAX_SPEED);
    const scale = (maxLog - minLog) / 99;
    return Math.round(((Math.log10(speed) - minLog) / scale) + 1);
  }

  const initialSliderValue = mapSpeedToSlider(1000);
  speedSlider.value = initialSliderValue;
  speedValue.textContent = `${speedMultiplier}x`;

  speedSlider.addEventListener("input", () => {
    speedMultiplier = mapSliderToSpeed(parseFloat(speedSlider.value));
    speedValue.textContent = `${speedMultiplier}x`;
  });

  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", () => {
    simulationSeconds = 0;
    updateTimer();
    earth.rotation.set(0, 0, 0);
    satellites.forEach(sat => {
      const pos = sat.orbitFn(sat.offset);
      sat.mesh.position.set(
        pos.x * orbitScale,
        pos.y * orbitScale,
        pos.z * orbitScale
      );
      sat.mesh.material.color.setHex(sat.originalColor); // 리셋 시 원래 색상 복원
    });
    hoveredSatellite = null; // 호버 상태 초기화
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