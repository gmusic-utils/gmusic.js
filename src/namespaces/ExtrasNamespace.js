import GMusicNamespace from '../GMusicNamespace';
import { nowPlayingSelectors } from '../constants/selectors';

export default class ExtrasNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);

    this.addMethods(['getTrackURL']);
  }

  _parseID(id) {
    return id.substring(0, id.indexOf('/'));
  }

  getTrackURL() {
    const albumEl = document.querySelector(nowPlayingSelectors.albumName);
    const artistEl = document.querySelector(nowPlayingSelectors.artistName);

    const urlTemplate = 'https://play.google.com/music/m/';
    let url;

    if (albumEl === null && artistEl === null) {
      return null;
    }

    const albumId = this._parseID(albumEl.dataset.id);
    const artistId = this._parseID(artistEl.dataset.id);

    if (albumId) {
      url = urlTemplate + albumId;
    } else if (artistId) {
      url = urlTemplate + artistId;
    }

    return url;
  }
}
