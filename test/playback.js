describe.skip('A Google Music instance playing music (via manual click)', function () {
  describe('when paused via our API', function () {
    it('is paused', function () {
      // Placeholder for linter
    });

    describe('when played via our API', function () {
      it('is playing', function () {
        // Placeholder for linter
      });

      describe('playing the next track', function () {
        it('changes songs', function () {
          // Placeholder for linter
        });

        describe('playing the previous track', function () {
          it('goes back to the original song', function () {
            // Placeholder for linter
          });
        });
      });
    });
  });
});

describe.skip('A Google Music instance not playing music', function () {
  it('has no time for playback', function () {
    // Placeholder for linter
  });

  describe('playing music', function () {
    it('is within the 0 to 10% of playback', function () {
      // Placeholder for linter
    });

    describe('when seeked to 50% of a track', function () {
      it('is within 50 to 60% of playback', function () {
        // Placeholder for linter
      });
    });
  });
});

describe.skip('A Google Music instance with shuffle and repeat off', function () {
  it('has shuffle off', function () {
    // Placeholder for linter
  });

  it('has repeat off', function () {
    // Placeholder for linter
  });

  describe('when we enable shuffle', function () {
    it('has shuffle on', function () {
      // Placeholder for linter
    });
  });

  describe('when we enable repeat', function () {
    it('has repeat on', function () {
      // Placeholder for linter
    });
  });
});
