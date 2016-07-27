export default class Track {
  static fromTrackArray = (trackArr, index) =>
    new Track({
      id: trackArr[0],
      title: trackArr[1],
      albumArt: trackArr[2],
      artist: trackArr[3],
      album: trackArr[4],
      index,
      duration: trackArr[13],
      playCount: trackArr[22],
    });

  constructor({
    id,
    title,
    albumArt,
    artist,
    album,
    index = 1,
    duration,
    playCount = 0,
  }) {
    this.id = id;
    this.title = title;
    this.albumArt = albumArt;
    this.artist = artist;
    this.album = album;
    this.index = index;

    this.duration = duration;
    this.playCount = playCount;
  }

  equals(other) {
    return this.id === other.id &&
      this.title === other.title &&
      this.albumArt === other.albumArt &&
      this.artist === other.artist &&
      this.album === other.album &&
      this.index === other.index &&
      this.duration === other.duration &&
      this.playCount === other.playCount;
  }
}
