let img;
let input;
let poseNet;
let poses = [];

function setup() {
  let canvas = createCanvas(300, 300);
  canvas.parent("upload");
  input = createFileInput(handleFile);
  input.style("padding", "2em");
}
function handleFile(file) {
  if (file.type === "image") {
    // create an image using the p5 dom library
    img = createImg(file.data, imageReady);
    // set the image size to the size of the canvas
    img.size(300, 300);
    frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
    img.hide();
  } else {
    img = null;
  }
}

// when the image is ready, then load up poseNet
function imageReady() {
  // set some options
  let options = {
    // architecture: "ResNet50",
    // outputStride: 16,
    // flipHorizontal: false,
    minConfidence: 0.3,
    // scoreThreshold: 0.5,
    // nmsRadius: 20,
    // detectionType: "single",
    // inputResolution: 503,
    // multiplier: 0.75,
    quantBytes: 4,
  };

  // assign poseNet
  poseNet = ml5.poseNet(modelReady, options);
  // This sets up an event that listens to 'pose' events
  poseNet.on("pose", function (results) {
    poses = results;
  });
}

// when poseNet is ready, do the detection
function modelReady() {
  // When the model is ready, run the singlePose() function...
  // If/When a pose is detected, poseNet.on('pose', ...) will be listening for the detection results
  // in the draw() loop, if there are any poses, then carry out the draw commands
  poseNet.singlePose(img);
}

// draw() will not show anything until poses are found
function draw() {
  if (poses.length > 0) {
    // image(img, 0, 0, width, height);
    drawSkeleton(poses);
    drawKeypoints(poses);
    noLoop(); // stop looping when the poses are estimated
  }
}

// The following comes from https://ml5js.org/docs/posenet-webcam
// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(0, 255, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(0);
      strokeWeight(5);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
