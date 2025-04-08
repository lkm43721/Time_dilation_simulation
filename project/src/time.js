import { updateEarthVectors } from "./vector.js"
import { updateSetelliteVectors } from "./vector.js"
import { resetSatelliteId } from "./vector.js";
import { height } from "./vector.js"

let STD = document.getElementById("special-time-dilation");
let GTD = document.getElementById("general-time-dilation");
let sumTD = document.getElementById("sum-time-dilation");
let speedValue = document.querySelector(".speed-value");
let setId = document.getElementById("satellite-id");
let setIdSave = setId;

//재설정 버튼 함수
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  const satelliteIdElem = document.getElementById("satellite-id");
  satelliteIdElem.textContent = "없음";  // DOM 업데이트
  setId = satelliteIdElem;
  setIdSave = satelliteIdElem;
  
  resetSatelliteId();
  
  STD.textContent = '0.000000000000';
  GTD.textContent = '0.000000000000';
  sumTD.textContent = '0.000000000000';
    // location.reload();
});

//상수 정의
const G = 6.67430e-11;
const M = 5.972e24;
const c = 299792458;

let SpecialTimeSumDilation
let GeneralTimeSumDilation

//특수상대성이론 시간지연 계산
function specialTime() {

    if(setId!=setIdSave) {
        SpecialTimeSumDilation = 0;
        GeneralTimeSumDilation = 0;
        setIdSave = setId;
    } else;

    setId = document.getElementById("satellite-id").textContent;

    speedValue = document.querySelector(".speed-value");
    speedValue = speedValue.textContent;
    speedValue = speedValue.replace(/[^0-9]/g,'');

    let v1 = updateEarthVectors();
    let v2 = updateSetelliteVectors();

    if(v2!=undefined){
        STD = document.getElementById("special-time-dilation");

        let originTime = 0.004;

        let v = Math.sqrt((v1[0]/3.6 - v2[0]/3.6)**2 + (v1[1]/3.6 - v2[1]/3.6)**2 + (v1[2]/3.6 - v2[2]/3.6)**2) ; 

        let timeDilation = originTime/Math.sqrt(1 - (v**2/c**2)) - originTime;

        SpecialTimeSumDilation += timeDilation * speedValue;
        STD.textContent = SpecialTimeSumDilation.toFixed(12);
        // console.log(timeDilation);

        GTD = document.getElementById("general-time-dilation");

        let r1 = height*1000;
        let r2 = (20200 + 6371.0088)*1000;


        let earthTime = Math.sqrt(1 - (2*G*M)/(r1*(c**2)));
        let setelliteTime = Math.sqrt(1 - (2*G*M)/(r2*(c**2)));

        let timeDilation2 = (1 - earthTime/setelliteTime)*originTime;

        GeneralTimeSumDilation += timeDilation2 * speedValue;
        GTD.textContent = GeneralTimeSumDilation.toFixed(12);

        sumTD.textContent = (GeneralTimeSumDilation - SpecialTimeSumDilation).toFixed(12);
    } 
    else{
        
    }
}

 setInterval(specialTime, 4);