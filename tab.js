document.addEventListener('DOMContentLoaded', function() {
  // Initialize state object
  const state = {
    leftPlayer: { isPlaying: false, currentTrackIndex: null },
    rightPlayer: { isPlaying: false, currentTrackIndex: null },
    playlist: [],
    continuousPlay: true // Toggle for continuous play
  };

  // Initialize audio elements and buttons
  const audioElement1 = document.getElementById('audioElement1');
  const audioElement2 = document.getElementById('audioElement2');
  const leftPlayBtn = document.getElementById('left-play');
  const rightPlayBtn = document.getElementById('right-play');

  // Add drag-drop listeners to player containers
  const leftPlayerDiv = document.getElementById('left-player');
  const rightPlayerDiv = document.getElementById('right-player');

  document.getElementById('continuousPlayBtn').addEventListener('click', () => {
    state.continuousPlay = !state.continuousPlay;
    continuousPlayBtn.innerText = `Continuous Play: ${state.continuousPlay ? 'ON' : 'OFF'}`;
  });

  function setPlayingIndicator(trackIndex) {
    document.querySelectorAll('.track-item.playing').forEach(el => el.classList.remove('playing'));
    if (trackIndex !== null) {
      document.getElementById(trackIndex).classList.add('playing');
    }
  }

  function loadNextSong(player, audioElement, trackNameElementId) {
    if (state[player].currentTrackIndex === null || state.playlist.length === 0) return;

    state[player].currentTrackIndex = (state[player].currentTrackIndex + 1) % state.playlist.length;
    const nextTrack = state.playlist[state[player].currentTrackIndex];
    audioElement.src = URL.createObjectURL(nextTrack.file);
    audioElement.load();
    audioElement.play();
    document.getElementById(trackNameElementId).innerText = nextTrack.name;
    setPlayingIndicator(state[player].currentTrackIndex);
  }

  audioElement1.addEventListener('ended', () => {
    if (state.continuousPlay && !audioElement2.src) {
      loadNextSong('leftPlayer', audioElement1, 'left-current-track');
    }
  });

  audioElement2.addEventListener('ended', () => {
    if (state.continuousPlay && !audioElement1.src) {
      loadNextSong('rightPlayer', audioElement2);
      loadNextSong('rightPlayer', audioElement2, 'right-current-track');
    }
  });

  // Initially disable play buttons
  leftPlayBtn.disabled = true;
  rightPlayBtn.disabled = true;

  // Function to update play button state
  function updatePlayButtonState(audioElement, button) {
    button.disabled = !audioElement.src;
  }

  // Attach play and pause event listeners to the audio elements
  audioElement1.addEventListener('play', () => {
    leftPlayBtn.textContent = 'Pause';
    updatePlayButtonState(audioElement1, leftPlayBtn);
  });
  audioElement1.addEventListener('pause', () => {
    leftPlayBtn.textContent = 'Play';
    updatePlayButtonState(audioElement1, leftPlayBtn);
    setPlayingIndicator(null);
  });
  audioElement1.addEventListener('loadeddata', () => {
    updatePlayButtonState(audioElement1, leftPlayBtn);
  });
  
  audioElement2.addEventListener('play', () => {
    rightPlayBtn.textContent = 'Pause';
    updatePlayButtonState(audioElement2, rightPlayBtn);
  });
  audioElement2.addEventListener('pause', () => {
    rightPlayBtn.textContent = 'Play';
    updatePlayButtonState(audioElement2, rightPlayBtn);
    setPlayingIndicator(null);
  });
  audioElement2.addEventListener('loadeddata', () => {
    updatePlayButtonState(audioElement2, rightPlayBtn);
  });

  // Function to update UI
  function updateUI() {
    const playlistDiv = document.getElementById('playlist');
    playlistDiv.innerHTML = '';
    state.playlist.forEach((track, index) => {
      const trackDiv = document.createElement('div');
      trackDiv.classList.add('track-item');
      trackDiv.draggable = true;
      trackDiv.innerText = track.name;
      trackDiv.id = index;
      playlistDiv.appendChild(trackDiv);

      trackDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectedTrackIndex = index;
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.style.display = 'block';
      });

      trackDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
      });
    });
    leftPlayBtn.disabled = !audioElement1.src;
    rightPlayBtn.disabled = !audioElement2.src;
    document.querySelectorAll('.track-item.playing').forEach(el => el.classList.remove('playing'));
  }

  // Event Listener for context menu actions
  document.getElementById('toLeft').addEventListener('click', () => {
    if (selectedTrackIndex !== null) {
      const selectedSong = state.playlist[selectedTrackIndex];
      audioElement1.src = URL.createObjectURL(selectedSong.file);
      audioElement1.load();
      document.getElementById('left-current-track').innerText = selectedSong.name;
    }
  });

  document.getElementById('toRight').addEventListener('click', () => {
    if (selectedTrackIndex !== null) {
      const selectedSong = state.playlist[selectedTrackIndex];
      audioElement2.src = URL.createObjectURL(selectedSong.file);
      audioElement2.load();
      document.getElementById('right-current-track').innerText = selectedSong.name;
    }
  });

  // Drag-drop listeners
  leftPlayerDiv.addEventListener('dragover', (e) => e.preventDefault());
  rightPlayerDiv.addEventListener('dragover', (e) => e.preventDefault());

  leftPlayerDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('text/plain'));
    const selectedSong = state.playlist[id];
    audioElement1.src = URL.createObjectURL(selectedSong.file);
    audioElement1.load();
    state.leftPlayer.currentTrackIndex = id; // Set the current track index
    document.getElementById('left-current-track').innerText = selectedSong.name;
    setPlayingIndicator(id);
  });

  rightPlayerDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('text/plain'));
    const selectedSong = state.playlist[id];
    audioElement2.src = URL.createObjectURL(selectedSong.file);
    audioElement2.load();
    state.rightPlayer.currentTrackIndex = id; // Set the current track index
    document.getElementById('right-current-track').innerText = selectedSong.name;
    setPlayingIndicator(id);
  });

  // Folder selection and playlist creation
  document.getElementById('selectFolder').addEventListener('click', async () => {
    const dirHandle = await window.showDirectoryPicker();
    const playlist = [];
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        playlist.push({ name: file.name, file: file });
      }
    }
    state.playlist = playlist;
    updateUI();
  });

  // Hide context menu on outside click
  document.addEventListener('click', function() {
    document.getElementById('contextMenu').style.display = 'none';
  });

  // Attach event listeners to play buttons
  leftPlayBtn.addEventListener('click', () => {
    if (audioElement1.paused) {
      audioElement1.play();
    } else {
      audioElement1.pause();
    }
  });
  
  rightPlayBtn.addEventListener('click', () => {
    if (audioElement2.paused) {
      audioElement2.play();
    } else {
      audioElement2.pause();
    }
  });

  // Initialize UI
  updateUI();
});
