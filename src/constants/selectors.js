export const volumeSelectors = {
  volumeSlider: '#material-vslider',
};

export const nowPlayingSelectors = {
  albumArt: '#playerBarArt',
  albumName: '.player-album',
  artistName: '#player-artist',
  nowPlayingContainer: '#playerSongInfo',
  infoWrapper: '.now-playing-info-wrapper',
  title: '#currently-playing-title',
};

export const controlsSelectors = {
  forward: '[data-id="forward"]',
  playPause: '[data-id="play-pause"]',
  repeat: '[data-id="repeat"]',
  rewind: '[data-id="rewind"]',
  shuffle: '[data-id="shuffle"]',
  progress: '#material-player-progress',
};

export const ratingSelectors = {
  ratingContainer: '#playerSongInfo',
  thumbs: '#player .player-rating-container [icon^="sj:thumb-"][data-rating]',
  thumbsUp: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="5"]',
  thumbsDown: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="1"]',
  thumbsFormat: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="{rating}"]',
};
