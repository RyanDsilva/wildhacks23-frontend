let video;
let poseNet;
let poses = [];

const line_bones_dict = [
  { p1: 7, p2: 9, name: "right-forearm" },
  { p1: 5, p2: 7, name: "right-upperarm" },
  { p1: 5, p2: 11, name: "rigth-side" },
  { p1: 11, p2: 13, name: "right-tigh" },
  { p1: 13, p2: 15, name: "right-calf" },
  { p1: 10, p2: 8, name: "left-forearm" },
  { p1: 8, p2: 6, name: "left-upperarm" },
  { p1: 6, p2: 12, name: "left-side" },
  { p1: 12, p2: 14, name: "left-tigh" },
  { p1: 14, p2: 16, name: "left-calf" },
  { p1: 6, p2: 5, name: "shoulder" },
  { p1: 12, p2: 11, name: "hip" },
];

const list_points1 = groundTruth[0]["pose"]["keypoints"];

function modelReady() {
  console.log("Model Loaded!");
}

function setup() {
  let canvas = createCanvas(640, 580);
  canvas.parent("canvasP5");
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(
    video,
    "single",
    {
      architecture: "ResNet50",
      outputStride: 16,
      flipHorizontal: false,
      minConfidence: 0.3,
      scoreThreshold: 0.3,
      nmsRadius: 20,
      detectionType: "single",
      inputResolution: 801,
      multiplier: 0.75,
      quantBytes: 4,
    },
    modelReady
  );
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function (results) {
    poses = results;
    // console.log("poses :>> ", results);
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  background(0);
  image(video, 0, 0, width / 2, height);

  drawKeypoints();
  //   drawSkeletonOld();
  drawSkeleton();
  drawKeypointsForGroundTruth();
  drawSkeletonGroundTruth();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  let noOfPointsAccurate = 0;
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        if (keypoint.score > 0.85) {
          fill(0, 255, 0);
          noStroke();
          ellipse(keypoint.position.x / 2, keypoint.position.y, 10, 10);
        } else {
          fill(255, 0, 0);
          noStroke();
          ellipse(keypoint.position.x / 2, keypoint.position.y, 10, 10);
        }
      }
    }
  }
  if (noOfPointsAccurate >= 12) {
    select("#keypoints").html("All Set!");
  } else {
    select("#keypoints").html("Need more accurate keypoints");
  }
}

// A function to draw the skeletons
function drawSkeletonOld() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      strokeWeight(5);
      line(
        partA.position.x / 2,
        partA.position.y,
        partB.position.x / 2,
        partB.position.y
      );
    }
  }
}

function createMeraVector(A) {
  const distance = [A[0] - A[2], A[1] - A[3]];
  const norm = Math.sqrt(distance[0] * distance[0] + distance[1] * distance[1]);
  const direction = [distance[0] / norm, distance[1] / norm];
  const bulletVector = [direction[0] * Math.sqrt(2), direction[1] * Math.sqrt(2)];
  return bulletVector;
}
function dotproduct(v1, v2) {
  console.log(v1, v2);
  var result = v1[0] * v2[0] + v1[1] * v2[1];
  //   console.log("dotproduct", result);
  return result;
}
function length(v) {
  return Math.sqrt(dotproduct(v, v));
}
function angle(v1, v2) {
  return dotproduct(v1, v2) / (length(v1) * length(v2));
}
function cosineSim(A, B) {
  var simi = angle(createMeraVector(A), createMeraVector(B));
  return simi;
}

// A function to draw the skeletons with similarity metric
function drawSkeleton() {
  strokeWeight(5);
  for (let k = 0; k < poses.length; k += 1) {
    for (let i = 0; i < line_bones_dict.length; i++) {
      lineO = line_bones_dict[i];
      bodypart = line_bones_dict[i]["name"];
      const l1 = [
        list_points1[lineO.p1]["position"].x,
        list_points1[lineO.p1]["position"].y,
        list_points1[lineO.p2]["position"].x,
        list_points1[lineO.p2]["position"].y,
      ];
      const l2 = [
        poses[k]["pose"]["keypoints"][lineO.p1]["position"].x,
        poses[k]["pose"]["keypoints"][lineO.p1]["position"].y,
        poses[k]["pose"]["keypoints"][lineO.p2]["position"].x,
        poses[k]["pose"]["keypoints"][lineO.p2]["position"].y,
      ];
      cosineSimilarity = cosineSim(l1, l2);
      //   let dAx = l1[2] - l1[0];
      //   let dAy = l1[3] - l1[1];
      //   let dBx = l2[2] - l2[0];
      //   let dBy = l2[3] - l2[1];
      //   let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
      //   if (angle < 0) {
      //     angle = angle * -1;
      //   }
      //   let degree_angle = angle * (180 / Math.PI);
      //   console.log(degree_angle);
      //   let cosineSimilarity = Math.abs(Math.cos(degree_angle));
      if (
        poses[k]["pose"]["keypoints"][lineO.p1]["score"] > 0.9 &&
        poses[k]["pose"]["keypoints"][lineO.p2]["score"] > 0.9
      ) {
        if (cosineSimilarity < 0.5) {
          stroke(255, 0, 0);
          line(
            poses[k]["pose"]["keypoints"][lineO.p1]["position"].x / 2,
            poses[k]["pose"]["keypoints"][lineO.p1]["position"].y,
            poses[k]["pose"]["keypoints"][lineO.p2]["position"].x / 2,
            poses[k]["pose"]["keypoints"][lineO.p2]["position"].y
          );
        } else {
          // console.log(bodypart + " similarity is " + cosineSimilarity.toString());
          stroke(0, 255, 0);
          line(
            poses[k]["pose"]["keypoints"][lineO.p1]["position"].x / 2,
            poses[k]["pose"]["keypoints"][lineO.p1]["position"].y,
            poses[k]["pose"]["keypoints"][lineO.p2]["position"].x / 2,
            poses[k]["pose"]["keypoints"][lineO.p2]["position"].y
          );
        }
      }
    }
  }
}

function drawKeypointsForGroundTruth() {
  //   for (let i = 0; i < groundTruth.length; i += 1) {
  const pose = groundTruth[0].pose;
  for (let j = 0; j < pose.keypoints.length; j += 1) {
    const keypoint = pose.keypoints[j];
    if (keypoint.score > 0.2) {
      fill(0, 0, 255);
      noStroke();
      ellipse(width / 4 + keypoint.position.x, keypoint.position.y, 10, 10);
    }
  }
}

function drawSkeletonGroundTruth() {
  // for (let i = 0; i < poses.length; i += 1) {
  const skeleton = groundTruth[0].skeleton;
  for (let j = 0; j < skeleton.length; j += 1) {
    const partA = skeleton[j][0];
    const partB = skeleton[j][1];
    stroke(255, 255, 255);
    line(
      width / 4 + partA.position.x,
      partA.position.y,
      width / 4 + partB.position.x,
      partB.position.y
    );
  }
  // }
}
