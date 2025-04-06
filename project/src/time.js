import { updateEarthVectors } from "./vector.js"
import { updateSetelliteVectors } from "./vector.js"
import { resetSatelliteId } from "./vector.js";

let TD = document.getElementById("special-time-dilation");
let setId = document.getElementById("satellite-id");
let setId1 = setId;
export let TimeSumDilation = 0;


const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
//   const satelliteIdElem = document.getElementById("satellite-id");
//   satelliteIdElem.textContent = "없음";  // DOM 업데이트
//   setId = satelliteIdElem;
//   setId1 = satelliteIdElem;
  
//   resetSatelliteId();
  
//   TD.textContent = '0.00000000000';
    location.reload();
});



function specialTime() {

    if(setId!=setId1) {
        TimeSumDilation = 0;
        setId1 = setId;
    } else;

    setId = document.getElementById("satellite-id").textContent;

    let speedValue = document.querySelector(".speed-value");
    speedValue = speedValue.textContent;
    speedValue = speedValue.replace(/[^0-9]/g,'');

    let v1 = updateEarthVectors();
    let v2 = updateSetelliteVectors();

    if(v2!=undefined){
        TD = document.getElementById("special-time-dilation");

        let originTime = 0.01

        const c = 299792458; //빛의 속도 상수 시간으로 m/s - > km/h

        let v = Math.sqrt((v1[0]/3.6 - v2[0]/3.6)**2 + (v1[1]/3.6 - v2[1]/3.6)**2 + (v1[2]/3.6 - v2[2]/3.6)**2) ; 

        let timeDilation = originTime/Math.sqrt(1 - (v**2/c**2)) - originTime;

        TimeSumDilation += timeDilation * speedValue;
        TD.textContent = TimeSumDilation.toFixed(12);
        // console.log(timeDilation);
    } 
    else{
        console.log(0);
    }
}

 setInterval(specialTime, 10);
// https://wordic.loeaf.com/variable-name