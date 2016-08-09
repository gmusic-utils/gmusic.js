import assert from 'assert';

import GMusicNamespace from '../GMusicNamespace';
import { volumeSelectors } from '../constants/selectors';

export default class VolumeNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);

    this._mapSelectors(volumeSelectors);
    this._hookEvents();

    this.addMethods(['getVolume', 'setVolume', 'increaseVolume', 'decreaseVolume']);
  }

  _assertVolume(vol) {
    assert(vol >= 0, `Expected target volume (${vol}) to be >= 0`);
    assert(vol <= 100, `Expected target volume (${vol}) to be <= 100`);
  }

  getVolume() {
    return this._volumeSliderEl.value;
  }

  setVolume(vol) {
    this._assertVolume(vol);
    this._volumeSliderEl.value = vol;
  }

  increaseVolume(amount = 5) {
    this._assertVolume(this._volumeSliderEl.value + amount);
    this._volumeSliderEl.value += amount;
  }

  decreaseVolume(amount = 5) {
    this._assertVolume(this._volumeSliderEl.value - amount);
    this._volumeSliderEl.value -= amount;
  }

  _hookEvents() {
    this._volumeSliderEl.addEventListener('value-change', () => {
      this.emit('change:volume', this.getVolume());
    });
  }
}
