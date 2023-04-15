<script setup>
import { ref } from 'vue'
// import * as posenet from "@tensorflow-models/posenet";
// const net = await posenet.load();

let isCameraOpen = false;
const camera = ref(null);


const createCameraElement = () => {
  const constraints = (window.constraints = {
    audio: false,
    video: true
  });
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      camera.srcObject = stream;
    })
    .catch(error => {
      console.log(error);
      alert("Error!");
    });
};

const stopCameraStream = () => {
  let tracks = camera.srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });
};

const toggleCamera = () => {
  if (isCameraOpen) {
    stopCameraStream();
  } else {
    isCameraOpen = true;
    createCameraElement();
  }
};
</script>

<template>
  <div>
    <h1>Pose Thingy</h1>
    <div id="app" class="web-camera-container">
      <div class="camera-button">
        <button type="button" class="button is-rounded"
          :class="{ 'is-primary': !isCameraOpen, 'is-danger': isCameraOpen }" @click="toggleCamera">
          <span v-if="!isCameraOpen">Open Camera</span>
          <span v-else>Close Camera</span>
        </button>
      </div>

      <div v-if="isCameraOpen" class="camera-box">
        <video ref="camera" :width="400" :height="400" autoplay></video>
      </div>
    </div>

  </div>
</template>

<style>
body {
  display: flex;
  justify-content: center;
}

.web-camera-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 500px;
}

.web-camera-container .camera-button {
  margin-bottom: 2rem;
}
</style>
