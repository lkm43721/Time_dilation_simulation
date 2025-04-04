import * as THREE from "../node_modules/three/build/three.module.js";

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

  // 카메라 위치 설정
  camera.position.z = 7;
  camera.lookAt(0, 0, 0);

  // 지구 생성
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const texture = new THREE.TextureLoader().load('earth_texture.png');
  const material = new THREE.MeshPhongMaterial({ map: texture });
  const earth = new THREE.Mesh(geometry, material);
  earth.scale.set(radiusX, radiusY, radiusZ);
  scene.add(earth);

  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // GPS 위성 궤도 생성
  const orbitScale = 3.167;
  const numPoints = 200;
  const tMin = -Math.PI;
  const tMax = Math.PI;
  const dt = (tMax - tMin) / numPoints;

  const sin35 = Math.sin(THREE.MathUtils.degToRad(35));
  const cos35 = Math.cos(THREE.MathUtils.degToRad(35));
  const sqrt3_2 = Math.sqrt(3) / 2;

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

  const orbitDefinitions = [
    { fn: t => ({ x: sin35 * Math.cos(t), y: cos35 * Math.cos(t), z: Math.sin(t) }), color: 0xff0000 },
    { fn: t => ({ x: 0.5 * sin35 * Math.cos(t) + sqrt3_2 * Math.sin(t), y: cos35 * Math.cos(t), z: -sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t) }), color: 0x00ff00 },
    { fn: t => ({ x: 0.5 * sin35 * Math.cos(t) - sqrt3_2 * Math.sin(t), y: cos35 * Math.cos(t), z: sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t) }), color: 0x0000ff },
    { fn: t => ({ x: sin35 * Math.cos(t), y: -cos35 * Math.cos(t), z: Math.sin(t) }), color: 0xffff00 },
    { fn: t => ({ x: 0.5 * sin35 * Math.cos(t) + sqrt3_2 * Math.sin(t), y: -cos35 * Math.cos(t), z: -sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t) }), color: 0xff00ff },
    { fn: t => ({ x: 0.5 * sin35 * Math.cos(t) - sqrt3_2 * Math.sin(t), y: -cos35 * Math.cos(t), z: sqrt3_2 * sin35 * Math.cos(t) + 0.5 * Math.sin(t) }), color: 0x00ffff }
  ];

  orbitDefinitions.forEach(def => createOrbit(def.fn, def.color));

  // 인공위성 생성
  const satellites = [];
  const satelliteGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const offsets = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
  let satelliteId = 1;

  orbitDefinitions.forEach(def => {
    offsets.forEach(offset => {
      const material = new THREE.MeshPhongMaterial({ color: def.color });
      const mesh = new THREE.Mesh(satelliteGeometry, material);
      mesh.userData = { id: satelliteId };
      scene.add(mesh);
      satellites.push({ id: satelliteId, orbitFn: def.fn, offset, mesh, originalColor: def.color });
      satelliteId++;
    });
  });

  // Raycaster 및 상호작용 코드
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredSatellite = null;

  canvasContainer.addEventListener('click', onCanvasClick);
  function onCanvasClick(event) {
    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(satellites.map(sat => sat.mesh));
    if (intersects.length > 0) {
      const selectedSatellite = intersects[0].object;
      showSatelliteInfo(selectedSatellite.userData.id);
    }
  }

  canvasContainer.addEventListener('mousemove', onMouseMove);
  function onMouseMove(event) {
    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(satellites.map(sat => sat.mesh));

    if (hoveredSatellite && (!intersects.length || intersects[0].object !== hoveredSatellite)) {
      const sat = satellites.find(s => s.mesh === hoveredSatellite);
      sat.mesh.material.color.setHex(sat.originalColor);
      hoveredSatellite = null;
    }

    if (intersects.length > 0) {
      const newHoveredSatellite = intersects[0].object;
      if (newHoveredSatellite !== hoveredSatellite) {
        hoveredSatellite = newHoveredSatellite;
        hoveredSatellite.material.color.setHex(0xffffff);
      }
    }
  }

  function showSatelliteInfo(id) {
    const satelliteIdElement = document.getElementById('satellite-id');
    if (satelliteIdElement) satelliteIdElement.textContent = id;
  }

  // 시간 및 속도 설정
  const EARTH_ROTATION_PERIOD = 23 * 60 * 60 + 56 * 60;
  const SATELLITE_ORBIT_PERIOD = EARTH_ROTATION_PERIOD / 2;
  let speedMultiplier = 1000;
  const MIN_SPEED = 1;
  const MAX_SPEED = 20000;
  let simulationSeconds = 0;
  let lastUpdateTime = Date.now();

  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');

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

  // 지구 표면 점 생성
  let surfacePoint = null;

  function createSurfacePoint(lat, lon) {
    if (surfacePoint) scene.remove(surfacePoint);

    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    surfacePoint = new THREE.Mesh(geometry, material);

    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 90);
    const radius = 1;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    surfacePoint.position.set(x, y, z);
    surfacePoint.scale.set(radiusX, radiusY, radiusZ);
    surfacePoint.userData = { lat, lon };
    scene.add(surfacePoint);
  }

  createSurfacePoint(0, 0);

  // 애니메이션 함수 (플레이/정지 버튼 제거로 항상 실행됨)
  function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;

    simulationSeconds += deltaTime * speedMultiplier;
    updateTimer();

    const earthRotationAngle = (simulationSeconds % EARTH_ROTATION_PERIOD) * (2 * Math.PI / EARTH_ROTATION_PERIOD);
    earth.rotation.y = earthRotationAngle;

    // 점 위치 업데이트 (자전과 반대 방향)
    if (surfacePoint) {
      const { lat, lon } = surfacePoint.userData;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon + 90) - earthRotationAngle;
      const x = radiusX * Math.sin(phi) * Math.cos(theta);
      const y = radiusY * Math.cos(phi);
      const z = radiusZ * Math.sin(phi) * Math.sin(theta);
      surfacePoint.position.set(x, y, z);
    }

    const satelliteOrbitAngle = (simulationSeconds % SATELLITE_ORBIT_PERIOD) * (2 * Math.PI / SATELLITE_ORBIT_PERIOD);
    satellites.forEach(sat => {
      const pos = sat.orbitFn(satelliteOrbitAngle + sat.offset);
      sat.mesh.position.set(pos.x * orbitScale, pos.y * orbitScale, pos.z * orbitScale);
    });

    renderer.render(scene, camera);
  }
  animate();

  // 슬라이더 관련 코드
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.querySelector(".speed-value");

  // 수정된 슬라이더 매핑 함수: 슬라이더 값이 0이면 0x 속도로 적용 (정지 기능 제거)
  function mapSliderToSpeed(sliderValue) {
    if (sliderValue == 0) return 0;
    const minLog = Math.log10(MIN_SPEED);
    const maxLog = Math.log10(MAX_SPEED);
    const scale = (maxLog - minLog) / 99;
    return Math.round(Math.pow(10, minLog + (sliderValue - 1) * scale));
  }

  function mapSpeedToSlider(speed) {
    if (speed === 0) return 0;
    const minLog = Math.log10(MIN_SPEED);
    const maxLog = Math.log10(MAX_SPEED);
    const scale = (maxLog - minLog) / 99;
    return Math.round(((Math.log10(speed) - minLog) / scale) + 1);
  }

  speedSlider.value = mapSpeedToSlider(1000);
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
      sat.mesh.position.set(pos.x * orbitScale, pos.y * orbitScale, pos.z * orbitScale);
      sat.mesh.material.color.setHex(sat.originalColor);
    });
    hoveredSatellite = null;
    createSurfacePoint(surfacePoint ? surfacePoint.userData.lat : 0, surfacePoint ? surfacePoint.userData.lon : 0);
  });

  // 좌표 입력 UI 동기화
  const latitudeSlider = document.getElementById("latitude-slider");
  const latitudeInput = document.getElementById("latitude-input");
  const longitudeSlider = document.getElementById("longitude-slider");
  const longitudeInput = document.getElementById("longitude-input");
  const updatePointButton = document.getElementById("update-point");

  function syncLatitude() {
    latitudeSlider.value = latitudeInput.value;
  }

  function syncLongitude() {
    longitudeSlider.value = longitudeInput.value;
  }

  latitudeSlider.addEventListener("input", () => {
    latitudeInput.value = latitudeSlider.value;
  });
  longitudeSlider.addEventListener("input", () => {
    longitudeInput.value = longitudeSlider.value;
  });
  latitudeInput.addEventListener("input", syncLatitude);
  longitudeInput.addEventListener("input", syncLongitude);

  updatePointButton.addEventListener("click", () => {
    let lat = parseFloat(latitudeInput.value);
    let lon = parseFloat(longitudeInput.value);

    lat = Math.max(-90, Math.min(90, lat));
    lon = Math.max(-180, Math.min(180, lon));
    latitudeInput.value = lat;
    longitudeInput.value = lon;
    syncLatitude();
    syncLongitude();

    createSurfacePoint(lat, -1 * lon);
  });

  // 창 크기 조정
  window.addEventListener('resize', () => {
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});
