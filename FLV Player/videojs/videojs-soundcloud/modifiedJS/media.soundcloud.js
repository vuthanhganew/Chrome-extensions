var currentsrc = null;
var addScriptTag;


/*
Documentation can be generated using {https://github.com/coffeedoc/codo Codo}
 */


/*
Add a script to head with the given @scriptUrl
 */

addScriptTag = function(scriptUrl) {
  var headTag, tag;
  tag = document.createElement('script');
  tag.src = scriptUrl;
  headTag = document.getElementsByTagName('head')[0];
  return headTag.parentNode.appendChild(tag);
};


/*
Soundcloud Media Controller - Wrapper for Soundcloud Media API
API SC.Widget documentation: http://developers.soundcloud.com/docs/api/html5-widget
API Track documentation: http://developers.soundcloud.com/docs/api/reference#tracks
@param [videojs.Player] player
@option options {Object} options As given by vjs.Player.prototype.loadTech
                         Should include a source attribute as one given to @see videojs.Soundcloud::src
@param [Function] ready
 */

videojs.Soundcloud = videojs.MediaTechController.extend({
  init: function(player, options, ready) {
    videojs.MediaTechController.call(this, player, options, ready);
    this.volumeVal = 0;
    this.durationMilliseconds = 1;
    this.currentPositionSeconds = 0;
    this.loadPercentageDecimal = 0;
    this.paused_ = true;
    this.player_ = player;
    this.soundcloudSource = null;
    this.scWidgetId = "" + (this.player_.id()) + "_soundcloud_api_" + (Date.now());
    this.currentsrc = "https://w.soundcloud.com/player/?url=" + this.player_.options().src+
        '&enable_api=true&auto_play=true&buying=false&sharing=false&download=false&show_bpm=false&show_playcount=false'+
        '&show_user=false&show_playcount=false&show_comments=false';

    this.scWidgetElement = videojs.Component.prototype.createEl('iframe', {
      id: this.scWidgetId,
      className: 'vjs-tech',
      scrolling: 'no',
      marginWidth: 0,
      marginHeight: 0,
      frameBorder: 0,
      webkitAllowFullScreen: "true",
      mozallowfullscreen: "true",
      allowFullScreen: "true",
      src: this.currentsrc
    });
    this.scWidgetElement.style.visibility = "hidden";
    this.player_.el().appendChild(this.scWidgetElement);
    this.player_.el().classList.add("backgroundContainer");
    if (this.player_.options().autoplay) {
      this.playOnReady = true;
    }
    this.readyToPlay = false;
    this.ready((function(_this) {
      return function() {
        _this.readyToPlay = true;
        return _this.player_.trigger("loadstart");
      };
    })(this));


    return this.loadSoundcloud();
  }
});


/*
Destruct the tech and it's DOM elements
 */

videojs.Soundcloud.prototype.dispose = function() {
  if (this.scWidgetElement&&this.scWidgetElement.parentNode) {
    this.scWidgetElement.parentNode.removeChild(this.scWidgetElement);
  }
  if(this&&this.player_&&this.player_.el()){
    this.player_.el().classList.remove("backgroundContainer");
    this.player_.el().style.backgroundImage = "";
  }
  if (this.soundcloudPlayer) {
    return delete this.soundcloudPlayer;
  }
};

videojs.Soundcloud.prototype.load = function() {
  return this.loadSoundcloud();
};


/*
Called from [vjs.Player.src](https://github.com/videojs/video.js/blob/master/docs/api/vjs.Player.md#src-source-)
Triggers "newSource" from vjs.Player once source has been changed

@option option [String] src Source to load
@return [String] current source if @src isn't given
 */

videojs.Soundcloud.prototype.src = function(src) {
  if (!src) {
    return this.soundcloudSource;
  }
  return this.soundcloudPlayer.load(src, {
    callback: (function(_this) {
      return function() {
        _this.soundcloudSource = src;
        _this.onReady();
        return _this.player_.trigger("newSource");
      };
    })(this)
  });
};
videojs.Soundcloud.prototype.currentSrc = function() {
  return this.currentsrc;
};
videojs.Soundcloud.prototype.updatePoster = function() {
  var e;
  try {
    return this.soundcloudPlayer.getSounds((function(_this) {
      return function(sounds) {
        var posterUrl, sound;
        if (sounds.length !== 1) {
          return;
        }
        sound = sounds[0];
        if (!sound.artwork_url) {
          return;
        }
        posterUrl = sound.artwork_url.replace("large.jpg", "t500x500.jpg");
        return _this.player_.el().style.backgroundImage = "url('" + posterUrl + "')";
      };
    })(this));
  } catch (_error) {
    e = _error;
    return 
  }
};

videojs.Soundcloud.prototype.play = function() {
  if (this.readyToPlay) {
    return this.soundcloudPlayer.play();
  } else {
    return this.playOnReady = true;
  }
};


/*
Toggle the playstate between playing and paused
 */

videojs.Soundcloud.prototype.toggle = function() {
  if (this.player_.paused()) {
    return this.player_.play();
  } else {
    return this.player_.pause();
  }
};

videojs.Soundcloud.prototype.pause = function() {
  return this.soundcloudPlayer.pause();
};

videojs.Soundcloud.prototype.paused = function() {
  return this.paused_;
};


/*
@return track time in seconds
 */

videojs.Soundcloud.prototype.currentTime = function() {
  return this.currentPositionSeconds;
};

videojs.Soundcloud.prototype.setCurrentTime = function(seconds) {
  this.soundcloudPlayer.seekTo(seconds * 1000);
  return this.player_.trigger("seeking");
};


/*
@return total length of track in seconds
 */

videojs.Soundcloud.prototype.duration = function() {
  return this.durationMilliseconds / 1000;
};

videojs.Soundcloud.prototype.buffered = function() {
  var timePassed;
  timePassed = this.duration() * this.loadPercentageDecimal;
  if (timePassed > 0) {
  }
  return videojs.createTimeRange(0, timePassed);
};

videojs.Soundcloud.prototype.volume = function() {
  return this.volumeVal;
};


/*
Called from [videojs::Player::volume](https://github.com/videojs/video.js/blob/master/docs/api/vjs.Player.md#volume-percentasdecimal-)
@param percentAsDecimal {Number} A decimal number [0-1]
 */

videojs.Soundcloud.prototype.setVolume = function(percentAsDecimal) {
  if (percentAsDecimal !== this.volumeVal) {
    this.volumeVal = percentAsDecimal;
    this.soundcloudPlayer.setVolume(this.volumeVal);
    return this.player_.trigger('volumechange');
  }
};

videojs.Soundcloud.prototype.muted = function() {
  return this.volumeVal === 0;
};


/*
Soundcloud doesn't do muting so we need to handle that.

A possible pitfall is when this is called with true and the volume has been changed elsewhere.
We will use @unmutedVolumeVal

@param {Boolean}
 */

videojs.Soundcloud.prototype.setMuted = function(muted) {
  if (muted) {
    this.unmuteVolume = this.volumeVal;
    return this.setVolume(0);
  } else {
    return this.setVolume(this.unmuteVolume);
  }
};


/*
Take a wild guess ;)
 */

videojs.Soundcloud.isSupported = function() {
  return true;
};


/*
Fullscreen of audio is just enlarging making the container fullscreen and using it's poster as a placeholder.
 */

videojs.Soundcloud.prototype.supportsFullScreen = function() {
  return true;
};


/*
Fullscreen of audio is just enlarging making the container fullscreen and using it's poster as a placeholder.
 */

videojs.Soundcloud.prototype.enterFullScreen = function() {
  return this.scWidgetElement.webkitEnterFullScreen();
};


/*
We return the player's container to it's normal (non-fullscreen) state.
 */

videojs.Soundcloud.prototype.exitFullScreen = function() {
  return this.scWidgetElement.webkitExitFullScreen();
};


/*
Simple URI host check of the given url to see if it's really a soundcloud url
@param url {String}
 */

videojs.Soundcloud.prototype.isSoundcloudUrl = function(url) {
  return /^(https?:\/\/)?(www.)?soundcloud.com\//i.test(url);
};


/*
We expect "audio/soundcloud" or a src containing soundcloud
 */

videojs.Soundcloud.prototype.canPlaySource = videojs.Soundcloud.canPlaySource = function(source) {
  var ret;
  if (typeof source === "string") {
    return videojs.Soundcloud.prototype.isSoundcloudUrl(source);
  } else {
    ret = (source.type === 'audio/soundcloud') || videojs.Soundcloud.prototype.isSoundcloudUrl(source.src);
    return ret;
  }
};


/*
Take care of loading the Soundcloud API
 */

videojs.Soundcloud.prototype.loadSoundcloud = function() {
  var checkSoundcloudApiReady;
  if (videojs.Soundcloud.apiReady && !this.soundcloudPlayer) {
    return this.initWidget();
  } else {
    if (!videojs.Soundcloud.apiLoading) {
      checkSoundcloudApiReady = (function(_this) {
        return function() {
          if (typeof window.SC !== "undefined") {
            videojs.Soundcloud.apiReady = true;
            window.clearInterval(videojs.Soundcloud.intervalId);
            _this.initWidget();
            return 
          }
        };
      })(this);
      addScriptTag("http://w.soundcloud.com/player/api.js");
      videojs.Soundcloud.apiLoading = true;
      return videojs.Soundcloud.intervalId = window.setInterval(checkSoundcloudApiReady, 10);
    }
  }
};


/*
It should initialize a soundcloud Widget, which will be our player
and which will react to events.
 */

videojs.Soundcloud.prototype.initWidget = function() {
  this.soundcloudPlayer = SC.Widget(this.scWidgetId);
  this.soundcloudPlayer.bind(SC.Widget.Events.READY, (function(_this) {
    return function() {
      return _this.onReady();
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, (function(_this) {
    return function(eventData) {
      return _this.onPlayProgress(eventData.relativePosition);
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.LOAD_PROGRESS, (function(_this) {
    return function(eventData) {
      return _this.onLoadProgress(eventData.loadedProgress);
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.ERROR, (function(_this) {
    return function() {
      return _this.onError();
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.PLAY, (function(_this) {
    return function() {
      return _this.onPlay();
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.PAUSE, (function(_this) {
    return function() {
      return _this.onPause();
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.FINISH, (function(_this) {
    return function() {
      return _this.onFinished();
    };
  })(this));
  this.soundcloudPlayer.bind(SC.Widget.Events.SEEK, (function(_this) {
    return function(event) {
      return _this.onSeek(event.currentPosition);
    };
  })(this));
  if (!this.soundcloudSource) {
    return this.triggerReady();
  }
};


/*
Callback for soundcloud's READY event.
 */
var hovertimeid = null;
videojs.Soundcloud.prototype.onReady = function() {
  var e;
  this.soundcloudPlayer.getVolume((function(_this) {
    return function(volume) {
      _this.unmuteVolume = volume;
      return 
    };
  })(this));
  try {
    this.soundcloudPlayer.getDuration((function(_this) {
      return function(duration) {
        _this.durationMilliseconds = duration;
        _this.player_.trigger('durationchange');
        return _this.player_.trigger("canplay");
      };
    })(this));
  } catch (_error) {
    e = _error;
  }
  this.updatePoster();
  this.triggerReady();
  try {
    if (this.playOnReady) {
      this.soundcloudPlayer.play();
    }
  } catch (_error) {
    e = _error;
  }
  return 
};


/*
Callback for Soundcloud's PLAY_PROGRESS event
It should keep track of how much has been played.
@param {Decimal= playPercentageDecimal} [0...1] How much has been played  of the sound in decimal from [0...1]
 */

videojs.Soundcloud.prototype.onPlayProgress = function(playPercentageDecimal) {
  this.currentPositionSeconds = this.durationMilliseconds * playPercentageDecimal / 1000;
  return this.player_.trigger("playing");
};


/*
Callback for Soundcloud's LOAD_PROGRESS event.
It should keep track of how much has been buffered/loaded.
@param {Decimal= loadPercentageDecimal} How much has been buffered/loaded of the sound in decimal from [0...1]
 */

videojs.Soundcloud.prototype.onLoadProgress = function(loadPercentageDecimal) {
  this.loadPercentageDecimal = loadPercentageDecimal;
  return this.player_.trigger("timeupdate");
};


/*
Callback for Soundcloud's SEEK event after seeking is done.

@param {Number= currentPositionMs} Where soundcloud seeked to
 */

videojs.Soundcloud.prototype.onSeek = function(currentPositionMs) {
  this.currentPositionSeconds = currentPositionMs / 1000;
  return this.player_.trigger("seeked");
};


/*
Callback for Soundcloud's PLAY event.
It should keep track of the player's paused and playing status.
 */

videojs.Soundcloud.prototype.onPlay = function() {
  this.paused_ = false;
  this.playing = !this.paused_;
  return this.player_.trigger("play");
};


/*
Callback for Soundcloud's PAUSE event.
It should keep track of the player's paused and playing status.
 */

videojs.Soundcloud.prototype.onPause = function() {
  this.paused_ = true;
  this.playing = !this.paused_;
  return this.player_.trigger("pause");
};


/*
Callback for Soundcloud's FINISHED event.
It should keep track of the player's paused and playing status.
 */

videojs.Soundcloud.prototype.onFinished = function() {
  var that = this;
  setTimeout(function(){
	if(that.player_.options_.loop){
      that.pause();
      setTimeout(function(){
	      that.play();
      },200)
	}
  },200);

  this.paused_ = false;
  this.playing = !this.paused_;
  return this.player_.trigger("ended");
};
// videojs.Soundcloud.prototype.ended = function() {
//   this.paused_ = false;
//   this.playing = !this.paused_;
//   return this.player_.trigger("ended");
// };

/*
Callback for Soundcloud's ERROR event.
Sadly soundlcoud doesn't send any information on what happened when using the widget API --> no error message.
 */

videojs.Soundcloud.prototype.onError = function() {
  return this.player_.error("There was a soundcloud error. Check the view.");
};
