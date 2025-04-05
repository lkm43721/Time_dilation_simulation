// vector.js
// 위도, 경도, 위성 id 값을 실시간으로 변수에 저장하면서 vector UI를 업데이트하는 모듈

// 실시간 값 저장 변수 (필요시 외부에서 사용하기 위해 export 가능)
export let currentLat = 0;
export let currentLon = 0;
export let currentSatelliteId = null;

// 지구의 크기 상수 (km)
const a = 6378.139;  // 적도 반지름
const b = 6356.139;  // 극 반지름
const T = 23 + 56/60;  // 항성일 (23시간 56분)

// 라디안 변환 함수
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

// x_seta 계산 함수 (회전축으로부터의 거리)
function calculateXSeta(lat) {
  const latRad = degToRad(lat);
  return Math.sqrt((a**2 * b**2) / (b**2 + a**2 * (Math.tan(latRad))**2));
}

// 시뮬레이션 시간(시간 단위) 가져오기
function getSimulationHours() {
  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');
  
  if (timerDays && timerHours && timerMinutes && timerSeconds) {
    return parseInt(timerDays.textContent) * 24 + 
           parseInt(timerHours.textContent) + 
           parseInt(timerMinutes.textContent) / 60 + 
           parseInt(timerSeconds.textContent) / 3600;
  }
  return 0;
}

// 주기적으로 지구 벡터 업데이트
function updateEarthVectorPeriodically() {
  if (currentLat !== null && currentLon !== null) {
    updateEarthVectorDisplay(currentLat, currentLon);
  }
  
  // 0.01초마다 업데이트 (100ms)
  setTimeout(updateEarthVectorPeriodically, 100);
}

// 지구 벡터 디스플레이 업데이트
function updateEarthVectorDisplay(lat, lon) {
  const xElem = document.getElementById("earth-vector-x");
  const yElem = document.getElementById("earth-vector-y");
  const zElem = document.getElementById("earth-vector-z");
  
  if (xElem && yElem && zElem) {
    // 시뮬레이션 총 시간(시간 단위)
    const simulationHours = getSimulationHours();
    
    // x_seta 계산 (회전축으로부터의 거리)
    const x_seta = calculateXSeta(lat);
    
    // 각도 변위 계산 (수식: 30π*n/359 라디안)
    const phi = (30 * Math.PI * simulationHours) / 359;
    
    // 성분벡터 계산 (수식: -x_seta*π*sin(30π*n/359)/12, x_seta*π*cos(30π*n/359)/12 km/h)
    const vx = -x_seta * Math.PI * Math.sin(phi) / 12;
    const vy = x_seta * Math.PI * Math.cos(phi) / 12;
    
    // z 성분은 위도에 따라 달라짐 (단순 모델에서는 0)
    const vz = 0;
    
    // 소수점 6자리까지 표시 (km/h 단위)
    xElem.textContent = `${vy.toFixed(6)} km/h`;
    yElem.textContent = `${vz.toFixed(6)} km/h`;
    zElem.textContent = `${vx.toFixed(6)} km/h`;
  }
}

export function updateEarthVector(lat, lon) {
  // 전달받은 값을 실시간 변수에 저장
  currentLat = lat;
  currentLon = lon;
  
  // 즉시 업데이트 한 번 수행
  updateEarthVectorDisplay(lat, lon);
  
  // 콘솔에 계산 정보 출력
  console.log(`지구 표면 위치 업데이트 - 위도: ${lat}°, 경도: ${lon}°`);
  
  // 주기적 업데이트가 아직 설정되지 않았다면 시작
  if (!window.earthVectorUpdateStarted) {
    window.earthVectorUpdateStarted = true;
    updateEarthVectorPeriodically();
  }
}

export function updateSatelliteVector(id) {
  // 전달받은 위성 id 값을 실시간 변수에 저장
  currentSatelliteId = id;
  
  // 위성 id가 바뀔 때마다 console.log로 출력
  console.log(`위성 id: ${id}`);

  const xElem = document.getElementById("satellite-vector-x");
  const yElem = document.getElementById("satellite-vector-y");
  const zElem = document.getElementById("satellite-vector-z");
  
  if (xElem && yElem && zElem) {
    if (id == null || id === "없음") {
      xElem.textContent = "None";
      yElem.textContent = "None";
      zElem.textContent = "None";
    } else {
      // 위성 속도 계산 (실제 GPS 위성 속도는 약 3.87 km/s)
      const orbitRadius = 26578; // GPS 위성 궤도 반지름 (km) = 지구 반지름 + 고도(20,200km)
      const orbitPeriod = 11 * 60 * 60 + 58 * 60; // GPS 위성 궤도 주기 (초)
      const speed = (2 * Math.PI * orbitRadius) / orbitPeriod; // km/s
      
      // ID에 따라 다른 방향 벡터 생성 (실제로는 위성 위치에 따라 계산해야 함)
      const angle = (id / 24) * 2 * Math.PI; // ID를 기반으로 한 단순 각도
      
      xElem.textContent = `${(speed * Math.cos(angle)).toFixed(6)} km/s`;
      yElem.textContent = `${(speed * Math.sin(angle)).toFixed(6)} km/s`;
      zElem.textContent = `${(speed * 0.1 * Math.cos(angle * 2)).toFixed(6)} km/s`;
    }
  }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  // 주기적인 업데이트 시작
  if (!window.earthVectorUpdateStarted) {
    window.earthVectorUpdateStarted = true;
    updateEarthVectorPeriodically();
  }
  
  // 초기값으로 벡터 정보 표시
  updateEarthVector(0, 0);
});