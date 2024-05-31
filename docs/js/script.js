const context = new window.AudioContext();

function playFile(filepath) {
  // see https://jakearchibald.com/2016/sounds-fun/
  // Fetch the file
  fetch(filepath)
    // Read it into memory as an arrayBuffer
    .then(response => response.arrayBuffer())
    // Turn it from mp3/aac/whatever into raw audio data
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      // Now we're ready to play!
      const soundSource = context.createBufferSource();
      soundSource.buffer = audioBuffer;
      soundSource.connect(context.destination);
      soundSource.start();
    });
}

let successButton = document.querySelector("#success");
successButton.addEventListener("click", function() {
  playFile('https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3');
});

let errorButton = document.querySelector("#error");
errorButton.addEventListener("click", function() {
  playFile('https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/error.mp3');
});
