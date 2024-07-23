const { ipcRenderer } = require("electron");

let handPose;
let video;
let hands = [];

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function setup() {
  // createCanvas(640, 480);
  // start detecting hands from the webcam video
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

// NOTE: uncomment to show the video
// function draw() {
//   // Draw the webcam video
//   image(video, 0, 0, width, height);

//   // Draw all the tracked hand points
//   for (let i = 0; i < hands.length; i++) {
//     let hand = hands[i];
//     for (let j = 0; j < hand.keypoints.length; j++) {
//       let keypoint = hand.keypoints[j];
//       fill(0, 255, 0);
//       noStroke();
//       circle(keypoint.x, keypoint.y, 10);
//     }
//   }
// }

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
  // Send the hands data to the main process
  ipcRenderer.send("hands", hands);
}
