import assert from 'assert';

import GMusicNamespace from '../GMusicNamespace';
import { ratingSelectors } from '../constants/selectors';
import click from '../utils/click';

export default class RatingNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);

    this._mapSelectors(ratingSelectors);
    this._hookEvents();

    this.addMethods(['getRating', 'toggleThumbsUp', 'toggleThumbsDown', 'setRating', 'resetRating']);
  }

  _isElSelected(el) {
    // DEV: We don't use English only strings (e.g. "Undo") to support i18n
    return el.__data.icon === 'thumb-up' || el.__data.icon === 'thumb-down';
  }

  getRating() {
    const thumbEls = document.querySelectorAll(ratingSelectors.thumbs);
    assert(thumbEls.length, `Failed to find thumb elements for rating "${ratingSelectors.thumbs}"`);

    for (let i = 0; i < thumbEls.length; i++) {
      if (this._isElSelected(thumbEls[i])) {
        return thumbEls[i].dataset.rating;
      }
    }
    return '0';
  }

  toggleThumbsUp() {
    click(this._thumbsUpEl);
  }

  toggleThumbsDown() {
    click(this._thumbsDownEl);
  }

  setRating(rating) {
    const ratingEl = document.querySelector(ratingSelectors.thumbsFormat.replace('{rating}', rating));

    if (ratingEl && !this._isElSelected(ratingEl)) {
      click(ratingEl);
    }
  }

  resetRating() {
    const ratingEl = document.querySelector(ratingSelectors.thumbsFormat.replace('{rating}', this.getRating()));

    if (ratingEl && this._isElSelected(ratingEl)) {
      click(ratingEl);
    }
  }

  _hookEvents() {
    let lastRating;

    // Change Rating Event
    new MutationObserver((mutations) => {
      const ratingsTouched = mutations.some((m) =>
        // Determine if our ratings were touched
        m.target.dataset && m.target.dataset.rating && m.target.hasAttribute('aria-label')
      );

      if (!ratingsTouched) return;

      const newRating = this.getRating();
      if (lastRating !== newRating) {
        this.emit('change:rating', newRating);
        lastRating = newRating;
      }
    }).observe(document.querySelector(ratingSelectors.ratingContainer), {
      attributes: true,
      subtree: true,
    });
  }
}
