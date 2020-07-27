const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;
let checkOperate = 0; // 전역변수로 체킹 변수 설정
let modal = document.getElementById("myModal");
var audio1 = new Audio("./검사가 완료되었습니다.mp3");
var audio2 = new Audio("./마스크를 착용해주세요.mp3");
var audio3 = new Audio("./마스크 착용은 필수입니다.mp3");
let maskimgsrc = "maskimg.png";

let btn = document.getElementsByClassName("start_button");
btn = document.querySelector("button");

var count;

// Load the image model and setup the webcam
async function init() {
  //우리가 만든 모델을 불러온다
  btn.style.display = "none";

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(400, 600, flip); // 웹캠 사이즈 조정
  await webcam.setup(); // request access to the webcam
  await webcam.play(); //웹캠 재생

  window.requestAnimationFrame(loop);
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}
async function loop() {
  await webcam.update();

  if (checkOperate == 120) {
    console.log("1_판단을 시작하지!");
    var check_predict = await predict(); // 판단 여부를 변수값에 저장

    await webcam.play();
    console.log("8_Play!! DID!!!");
    checkOperate = 0;

    if (check_predict == 1) {
      window.requestAnimationFrame(loop); //순서 변경 x
    }
  } else if (checkOperate < 120) {
    labelContainer.childNodes[0].innerHTML = "판단을 시작합니다";
    checkOperate++;
    console.log("1번 : 루프돌자 슝슝");
    window.requestAnimationFrame(loop); //순서 변경 x
  }
}

function check(prediction) {
  //predict()의 prediction배열을 파라미터로 받음
  console.log("5_check함수 실행");
  return new Promise(function (resolve, reject) {
    if (
      prediction[0].className == "mask" &&
      prediction[0].probability.toFixed(2) >= 0.7
    ) {
      resolve("마스크 착용");
      console.log("6_응");
      //여기서 해야 하는거 : 안내 창 띄우고 자동 지우기 근데 야발 아무것도 못하고 있잖아 시불
    } else if (
      prediction[1].className == "no mask" &&
      prediction[1].probability.toFixed(2) >= 0.7
    ) {
      resolve("마스크 미착용");
      console.log("6_아니");
    } else {
      resolve("불분명");
      console.log("6_불분명함");
    }
    reject("엥 안되넹");
  });
}
function printOn(resultOfPrediction) {
  //predict()에 사용 // check()의 결과값을 파라미터로 받음
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      labelContainer.childNodes[0].innerHTML = "판단이 완료되었습니다";
      resolve("");
    }, 1000);
  });
} // 이 함수는 2초동안 판단 결과를 보여주기 위한 setInternal 함수에 쓰이기 위함.

async function predict() {
  // 예측 진행 함수
  let count = 0; //하 쒯 이거도 안되네
  console.log("2_predict 함수 실행");

  await webcam.pause();
  console.log("3_일시정지 완료");

  const prediction = await model.predict(webcam.canvas);
  console.log("4_predict success");

  var result = await check(prediction);
  // check 함수 실행 -> 판단 결과를 얻을 수 있음.
  console.log("result값: " + result);

  await printOn(result);
  console.log("7_결과 출력 완료");
  await new Promise((resolve, reject) => {
    modal.style.display = "block";
    document.getElementById("text").innerHTML = result;
    resolve("");
  });
  if (result == "마스크 착용") {
    audio1.currentTime = 0;
    audio1.play();
    document.getElementById("text").innerHTML = "검사가 완료되었습니다.";

    count = document.getElementsByClassName("count").innerHTML;
    count++;
    document.getElementsByClassName("count").innerHTML = count;

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        audio1.pause();
        resolve("");
      }, 2000);
    });
  } else if (result == "마스크 미착용") {
    audio2.currentTime = 0;
    audio2.play();
    document.getElementById("text").innerHTML = "마스크를 착용해주세요!";
    document.getElementById("maskimg").src = maskimgsrc;
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        audio2.pause();
        resolve("");
      }, 2000);
    });
    audio3.currentTime = 0;
    audio3.play();
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        audio3.pause();
        resolve("");
      }, 2000);
    });
  }
  count = await new Promise((resolve, reject) => {
    setTimeout(() => {
      audio1.pause();
      modal.style.display = "none";
      resolve(1);
    }, 1000);
  });
  return count;
}
