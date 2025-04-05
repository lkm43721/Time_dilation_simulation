// vector.js
// 위도, 경도, 위성 id 값을 실시간으로 변수에 저장하면서 vector UI를 업데이트하는 모듈

// 실시간 값 저장 변수 (필요시 외부에서 사용하기 위해 export 가능)
export let currentLat = 0;
export let currentLon = 0;
export let currentSatelliteId = null;

export function updateEarthVector(lat, lon) {
  // 전달받은 값을 실시간 변수에 저장
  currentLat = lat;
  currentLon = lon;

  // 위도와 경도가 바뀔 때마다 console.log로 출력
  console.log(`위도: ${lat.toFixed(6)}, 경도: ${lon.toFixed(6)}`);

  const xElem = document.getElementById("earth-vector-x");
  const yElem = document.getElementById("earth-vector-y");
  const zElem = document.getElementById("earth-vector-z");
  if (xElem && yElem && zElem) {
    // 소수점 6자리까지 표시
    xElem.textContent = lat.toFixed(6);
    yElem.textContent = lon.toFixed(6);
    zElem.textContent = (lat + lon).toFixed(6);
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
      // 위성 ID를 그대로 각 필드에 표시
      xElem.textContent = id;
      yElem.textContent = id;
      zElem.textContent = id;
    }
  }
}

