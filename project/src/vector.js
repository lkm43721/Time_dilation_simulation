// vector.js
// 위도, 경도, 위성 ID 값을 실시간으로 변수에 저장하면서 벡터 UI를 업데이트하는 모듈

export let currentLat = 0;
export let currentLon = 0;
export let currentSatelliteId = null;

export function resetSatelliteId() {
  currentSatelliteId = '없음';
  // TimeSumDilation 재할당 제거
  console.log("위성 ID가 리셋되었습니다.");
}



// 화면에서 시간을 가져와 초 단위로 변환하는 함수
function getSimulationTimeInSeconds() {
  const days = parseInt(document.getElementById('timer-days').textContent, 10) || 0;
  const hours = parseInt(document.getElementById('timer-hours').textContent, 10) || 0;
  const minutes = parseInt(document.getElementById('timer-minutes').textContent, 10) || 0;
  const seconds = parseInt(document.getElementById('timer-seconds').textContent, 10) || 0;
  
  const totalSeconds = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
  return totalSeconds;
}

// 지구 벡터 업데이트 함수
export function updateEarthVector(lat, lon) {
  currentLat = lat;
  currentLon = lon;
  console.log(`위도: ${lat.toFixed(6)}, 경도: ${lon.toFixed(6)}`);
}

// 위성 벡터 업데이트 함수
export function updateSatelliteVector(id) {
  currentSatelliteId = id;
  console.log(`위성 ID: ${id}`);
}

// 주기적으로 벡터 정보를 업데이트하는 함수
export function updateEarthVectors() {
  const totalSeconds = getSimulationTimeInSeconds();

  // 지구 벡터 업데이트 중요!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //여기 함수에서 위도:current Lat
  //여기 함수에서 경도:current Lon
  //여기 함수에서 시간: totalSeconds
  if (currentLat !== null && currentLon !== null) {
    const xElem = document.getElementById("earth-vector-x");
    const yElem = document.getElementById("earth-vector-y");
    const zElem = document.getElementById("earth-vector-z");
    if (xElem && yElem && zElem) {
      const a = 6378.139
      const b = 6356.139
      const seta = currentLat
      const n = ((totalSeconds/86160)*360) % 360
      const x_seta = Math.sqrt((a**2*b**2)/(b**2+a**2*Math.tan((Math.abs(seta) * Math.PI) / 180)))
      const newX = ((30*x_seta*Math.PI)/359)*Math.cos((n * Math.PI) / 180)
      const newY = 0
      const newZ = ((-30*x_seta*Math.PI)/359)*Math.sin((n * Math.PI) / 180)
      
      xElem.textContent = newX.toFixed(6) + ' km/h';
      yElem.textContent = newY.toFixed(6) + ' km/h';
      zElem.textContent = newZ.toFixed(6) + ' km/h';

      return [newX,newY,newZ]
      
    }

  }
}

export function updateSetelliteVectors() {
  const totalSeconds = getSimulationTimeInSeconds();

  // 위성 벡터 업데이트
  if (currentSatelliteId !== null) {
    const xElem = document.getElementById("satellite-vector-x");
    const yElem = document.getElementById("satellite-vector-y");
    const zElem = document.getElementById("satellite-vector-z");
    const n2 = ((totalSeconds/43080)*360) % 360
    const satellite_radius = 20200+6400; //지구 반지름 6400으로 임의 설정 한 것 이므로 나중에 수정할것
    if (xElem && yElem && zElem) {
      if (currentSatelliteId === "없음") {
        xElem.textContent = "None";
        yElem.textContent = "None";
        zElem.textContent = "None";
      } else {
        const currentId = parseFloat(currentSatelliteId);
        if (isNaN(currentId)) {
          xElem.textContent = "Invalid ID";
          yElem.textContent = "Invalid ID";
          zElem.textContent = "Invalid ID";


          //빨강 궤도
        } else if(currentId == 1){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

        } else if(currentId == 2){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

        } else if(currentId == 3){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

        } else if(currentId == 4){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

          //초록 궤도
        } else if(currentId == 5){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 6){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]
          
        } else if(currentId == 7){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 8){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]


          //파랑 궤도
        } else if(currentId == 9){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 10){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 11){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 12){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //55도 회전변환
          const rot1_newX = newX*Math.cos((55 * Math.PI)/180)-newY*Math.sin((55 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((55 * Math.PI)/180)+newY*Math.cos((55 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]


          //노랑 궤도
        }else if(currentId == 13){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

        } else if(currentId == 14){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

        } else if(currentId == 15){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]

        } else if(currentId == 16){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          xElem.textContent = rot1_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot1_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot1_newZ.toFixed(6)+ ' km/h';
          return [rot1_newX, rot1_newY, rot1_newZ]
          

          //핑크 궤도
        } else if(currentId == 17){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 18){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 19){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 20){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //300도 회전변환
          const rot2_newX = rot1_newX*Math.cos((300 * Math.PI)/180)-rot1_newZ*Math.sin((300 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((300 * Math.PI)/180)+rot1_newZ*Math.cos((300 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]


          //하늘 궤도
        } else if(currentId == 21){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]

        } else if(currentId == 22){
          const newX = ((-30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]
          
        } else if(currentId == 23){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((((90-n2)%360) * Math.PI)/180)
          const newY = 0
          const newZ = ((-30*satellite_radius*2*Math.PI)/359)*Math.sin((((90-n2)%360) * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]
          
        } else if(currentId == 24){
          const newX = ((30*satellite_radius*2*Math.PI)/359)*Math.cos((n2 * Math.PI)/180)
          const newY = 0
          const newZ = ((30*satellite_radius*2*Math.PI)/359)*Math.sin((n2 * Math.PI)/180)
          //305도 회전변환
          const rot1_newX = newX*Math.cos((305 * Math.PI)/180)-newY*Math.sin((305 * Math.PI)/180)
          const rot1_newY = newX*Math.sin((305 * Math.PI)/180)+newY*Math.cos((305 * Math.PI)/180)
          const rot1_newZ = newZ
          //60도 회전변환
          const rot2_newX = rot1_newX*Math.cos((60 * Math.PI)/180)-rot1_newZ*Math.sin((60 * Math.PI)/180)
          const rot2_newY = rot1_newY
          const rot2_newZ = rot1_newX*Math.sin((60 * Math.PI)/180)+rot1_newZ*Math.cos((60 * Math.PI)/180)
          xElem.textContent = rot2_newX.toFixed(6)+ ' km/h';
          yElem.textContent = rot2_newY.toFixed(6)+ ' km/h';
          zElem.textContent = rot2_newZ.toFixed(6)+ ' km/h';
          return [rot2_newX, rot2_newY, rot2_newZ]
        }
      }
    }
  }
}

// 1초마다 업데이트 실행
setInterval(updateEarthVectors, 10);
setInterval(updateSetelliteVectors, 10);