let state = {
  isPlaying: false,
  currentTrackIndex: 0,
  playlist: [],
  folderHandle: null,
};

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'tab.html' });
});

self.addEventListener('message', async (event) => {
  const { action, folderHandle } = event.data;
  
  if (action === 'setPlaylist') {
    state.folderHandle = folderHandle;
    await refreshPlaylist();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ action: 'updateUI', state }));
    });
  }

  if (action === 'refreshPlaylist') {
    await refreshPlaylist();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ action: 'updateUI', state }));
    });
  }

  if (action === 'getState') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ action: 'updateUI', state }));
    });
  }
});

async function refreshPlaylist() {
  if (!state.folderHandle) return;

  const files = [];
  for await (const entry of state.folderHandle.values()) {
    if (entry.kind === 'file' && (entry.name.endsWith('.mp3') || entry.name.endsWith('.wav'))) {
      const file = await entry.getFile();
      files.push({ name: entry.name, file });
    }
  }
  state.playlist = files;
}
