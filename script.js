let track_list = [];
let track_index = 0;
let isPlaying = false;
let updateTimer;

let curr_track = document.createElement('audio');

function handleFileSelect() {
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', function() {
    const selectedFiles = fileInput.files;
    if (selectedFiles.length > 0) {
      addToPlaylist(selectedFiles);
      loadTrack(track_index);
    }
  });
}

function addToPlaylist(files) {
  for (const file of files) {
    const track = {
      name: file.name.replace(/\.[^/.]+$/, ""),
    //   artist: "Unknown Artist",
      image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600", // Replace with a valid default image URL
      path: URL.createObjectURL(file)
    };
    track_list.push(track);
  }
  savePlaylist();
}

function savePlaylist() {
  localStorage.setItem('playlist', JSON.stringify(track_list));
}

function loadPlaylist() {
  const storedPlaylist = localStorage.getItem('playlist');
  if (storedPlaylist) {
    track_list = JSON.parse(storedPlaylist);
  }
}

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  if (curr_track.src === '') {
    loadTrack(track_index);
  }

  try {
    curr_track.play();
    isPlaying = true;
    document.querySelector('.playpause-track').innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
  } catch (error) {
    console.error("Error playing track:", error);
  }
}

function pauseTrack() {
  try {
    curr_track.pause();
    isPlaying = false;
    document.querySelector('.playpause-track').innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
  } catch (error) {
    console.error("Error pausing track:", error);
  }
}

function loadTrack(index) {
  clearInterval(updateTimer);
  resetValues();

  try {
    curr_track.src = track_list[index].path;
    curr_track.load();
  } catch (error) {
    console.error("Error loading track:", error);
    return;
  }

  document.querySelector('.track-art').style.backgroundImage = `url(${track_list[index].image})`;
  document.querySelector('.track-name').textContent = track_list[index].name;
  document.querySelector('.track-artist').textContent = track_list[index].artist;
  document.querySelector('.now-playing').textContent = `PLAYING ${index + 1} OF ${track_list.length}`;

  updateTimer = setInterval(seekUpdate, 1000);

  curr_track.addEventListener('ended', nextTrack);

  // Add event listeners for volume and seek sliders
  const seekSlider = document.querySelector(".seek_slider");
  const volumeSlider = document.querySelector(".volume_slider");

  seekSlider.addEventListener("input", seekTo);
  volumeSlider.addEventListener("input", setVolume);

  // Change background color when loading a new track
  randomBackgroundColor();
}

function resetValues() {
  document.querySelector('.current-time').textContent = "00:00";
  document.querySelector('.total-duration').textContent = "00:00";
  document.querySelector('.seek_slider').value = 0;
}

function seekTo() {
  let seekto = curr_track.duration * (document.querySelector('.seek_slider').value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = document.querySelector('.volume_slider').value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    document.querySelector('.seek_slider').value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) {
      currentSeconds = "0" + currentSeconds;
    }
    if (durationSeconds < 10) {
      durationSeconds = "0" + durationSeconds;
    }
    if (currentMinutes < 10) {
      currentMinutes = "0" + currentMinutes;
    }
    if (durationMinutes < 10) {
      durationMinutes = "0" + durationMinutes;
    }

    document.querySelector('.current-time').textContent = currentMinutes + ":" + currentSeconds;
    document.querySelector('.total-duration').textContent = durationMinutes + ":" + durationSeconds;
  }
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function clearPlaylist() {
  track_list = [];
  savePlaylist();
  loadTrack(track_index);
}

function randomBackgroundColor() {
  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color with the given values
  let bgColor = `rgb(${red},${green},${blue})`;

  // Set the background to that color
  document.body.style.background = bgColor;
}

// Load playlist on page load
loadPlaylist();
// Load the first track from the playlist
loadTrack(track_index);

// Other functions and event listeners...

handleFileSelect(); // Initialize file input handling
