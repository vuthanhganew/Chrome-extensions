var hovertimeid = null;
videojs.Dailymotion = videojs.MediaTechController.extend({
    init: function(e, t, n) {
        videojs.MediaTechController.call(this, e, t, n);
        this.player_ = e;
        this.player_el_ = document.getElementById(this.player_.id());
        if (typeof this.player_.options().dmControls != "undefined") {
            var r = this.player_.options().dmControls = parseInt(this.player_.options().dmControls) && this.player_.controls_;
            if (r && this.player_.controls_) this.player_.controls(!r)
        }
        if (typeof t.source != "undefined")
            for (var i in t.source) this.player_.options()[i] =
                t.source[i];
        this.videoId = videojs.Dailymotion.parseVideoId(this.player_.options().src);
        if (typeof this.videoId != "undefined")
            if (!this.player_.options().dmControls) {
                if (typeof this.player_.poster() == "undefined") this.player_.poster("https://api.dailymotion.com/video/" + this.videoId + "?fields=url");
                var s = this;
                setTimeout(function() {
                    s.player_.posterImage.el().style.backgroundSize = "cover"
                }, 50)
            }
        this.id_ = this.player_.id() + "_dailymotion_api";
        this.el_ = videojs.Component.prototype.createEl("iframe", {
            id: this.id_,
            className: "vjs-tech",
            scrolling: "no",
            marginWidth: 0,
            marginHeight: 0,
            frameBorder: 0,
            webkitAllowFullScreen: "",
            mozallowfullscreen: "",
            allowFullScreen: ""
        });
        this.player_el_.insertBefore(this.el_, this.player_el_.firstChild);
        this.params = {
            id: this.id_,
            autoplay: 1,
            chromeless: 1,
            html: 1,
            info: 0,
            logo: 0,
            related:0,
            controls: "html",
            wmode: "opaque",
            format: "json",
            url: this.player_.options().src
        };
        if (typeof this.params.list == "undefined") delete this.params.list;
        if (this.player_.options().autoplay) {
            this.player_.bigPlayButton.hide();
            this.playOnReady = true
        }
        if (window.location.protocol != "file:") this.params.origin = window.location.protocol + "//" + window.location.hostname;
        this.el_.src = "http://www.dailymotion.com/services/oembed?" + videojs.Dailymotion.makeQueryString(this.params)+"&api=1";
        if (videojs.Dailymotion.apiReady) this.loadApi();
        else {
            videojs.Dailymotion.loadingQueue.push(this);
            if (!videojs.Dailymotion.apiLoading) {
                var o = document.createElement("script");
                o.src = "http://api.dmcdn.net/all.js";
                var u = document.getElementsByTagName("script")[0];
                u.parentNode.insertBefore(o,
                    u);
                videojs.Dailymotion.apiLoading = true
            }
        }
    }
});
videojs.Dailymotion.prototype.params = [];
videojs.Dailymotion.prototype.dispose = function() {
    if (this.el_&&this.el_.parentNode) this.el_.parentNode.removeChild(this.el_);
    videojs.MediaTechController.prototype.dispose.call(this)
};
videojs.Dailymotion.prototype.src = function(e) {
    this.dmPlayer.load(videojs.Dailymotion.parseVideoId(e))
};
videojs.Dailymotion.prototype.currentSrc = function() {
    if (this.isReady_) return this.params.url;
    else return null
};
videojs.Dailymotion.prototype.play = function() {
    if (this.isReady_) this.dmPlayer.play();
    else {
        this.playOnReady = true;
        if (!this.player_.options.dmControls) this.player_.bigPlayButton.show()
    }
};
videojs.Dailymotion.prototype.ended = function() {
    if (this.isReady_) {
        var e = this.dmPlayer.getPlayerState();
        return e == 0
    } else return false
};
videojs.Dailymotion.prototype.pause = function() {
	if(this.dmPlayer.paused){
	    this.dmPlayer.play()
	}else{
	    this.dmPlayer.pause()
	}
};
videojs.Dailymotion.prototype.paused = function() {
    return this.dmPlayer.paused
};
videojs.Dailymotion.prototype.currentTime = function() {
    return this.dmPlayer.currentTime
};
videojs.Dailymotion.prototype.setCurrentTime = function(e) {
    this.dmPlayer.seek(e, true);
    this.player_.trigger("timeupdate")
};
videojs.Dailymotion.prototype._duration;
videojs.Dailymotion.prototype.duration = function() {
    return this.dmPlayer.duration
};
videojs.Dailymotion.prototype.buffered = function() {
    return []
};
videojs.Dailymotion.prototype.volume = function() {
    if (isNaN(this.volumeVal)) this.volumeVal = this.dmPlayer.volume;
    return this.volumeVal
};
videojs.Dailymotion.prototype.setVolume = function(e) {
    if (e && e != this.volumeVal) {
		this.dmPlayer.setVolume(e)
        this.dmPlayer.volume = e;
        this.volumeVal = e;
        this.player_.trigger("volumechange")
    }
};
videojs.Dailymotion.prototype.muted = function() {
    return this.dmPlayer.muted
};
videojs.Dailymotion.prototype.setMuted = function(e) {
    this.dmPlayer.setMuted(e);
    this.dmPlayer.muted = e;
    var t = this;
    setTimeout(function() {
        t.player_.trigger("volumechange")
    }, 50)
};
videojs.Dailymotion.prototype.onReady = function() {
    this.isReady_ = true;
    this.player_.trigger("techready");
    this.triggerReady();
    this.player_.trigger("durationchange");
};
videojs.Dailymotion.isSupported = function() {
    return true
};
videojs.Dailymotion.prototype.supportsFullScreen = function() {
    return false
};
videojs.Dailymotion.canPlaySource = function(e) {
    return e.type == "video/dailymotion"
};
videojs.Dailymotion.loadingQueue = [];
videojs.Dailymotion.prototype.loadApi = function() {
    this.dmPlayer = new DM.player(this.id_, {
        video: this.videoId,
        width: this.options.width,
        height: this.options.height,
        params: this.params
    });
    this.setupTriggers();
    this.dmPlayer.vjsTech = this
};
videojs.Dailymotion.prototype.onStateChange = function(e) {
    var t = e.type;
    if (t != this.lastState) {
        switch (t) {
            case -1:
                this.player_.trigger("durationchange");
                break;
            case "apiready":
                this.onReady();
                break;
            case "ended":
                break;
            case "play":
            case "playing":
                break;
            case "pause":
                break;
            case "durationchange":
                break;
            case "timeupdate":
                this.player_.loadingSpinner.hide();
                break;
            case "progress":
                break
        }
        this.lastState = t
    }
};
videojs.Dailymotion.makeQueryString = function(e) {
    var t = [];
    for (var n in e)
        if (e.hasOwnProperty(n)) t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
    return t.join("&")
};
videojs.Dailymotion.parseVideoId = function(e) {
    var t = /^.+dailymotion.com\/((video|hub)\/([^_]+))?[^#]*(#video=([^_&]+))?/;
    var n = e.match(t);
    return n ? n[5] || n[3] : null
};
videojs.Dailymotion.parsePlaylist = function(e) {
    var t = /[?&]list=([^#\&\?]+)/;
    var n = e.match(t);
    if (n != null && n.length > 1) return n[1]
};
videojs.Dailymotion.prototype.setupTriggers = function() {
    for (var e = videojs.Dailymotion.Events.length - 1; e >= 0; e--) this.dmPlayer.addEventListener(videojs.Dailymotion.Events[e], videojs.bind(this, this.eventHandler))
};
videojs.Dailymotion.prototype.eventHandler = function(e) {
    this.onStateChange(e);
    this.trigger(e)
};
videojs.Dailymotion.Events = "apiready,play,playing,pause,ended,canplay,canplaythrough,timeupdate,progress,seeking,seeked,volumechange,durationchange,fullscreenchange,error".split(",");
window.dmAsyncInit = function() {
    var e;
    while (e = videojs.Dailymotion.loadingQueue.shift()) e.loadApi();
    videojs.Dailymotion.loadingQueue = [];
    videojs.Dailymotion.apiReady = true
};