var hovertimeid = null;
videojs.Twitch = videojs.MediaTechController.extend({
    init: function(e, t, n) {
        videojs.MediaTechController.call(this, e, t, n);
	    this.volumeVal = 50;
	    this.durationMilliseconds = 1;
	    this.currentPositionSeconds = 0;
	    this.loadPercentageDecimal = 0;
	    this.paused_ = false;
        this.player_ = e;
        this.player_el_ = document.getElementById(this.player_.id());
        if (typeof t.source != "undefined")for (var i in t.source) this.player_.options()[i] = t.source[i];
        var url = this.player_.options().src;
        if(url.indexOf("/embed") === -1){
            var uname = url.split("twitch.tv/")[1];
            if(!uname)return;
            url = "http://www.twitch.tv/"+uname+"/embed";
        }
        this.videoId = videojs.Twitch.parseVideoId(url);
        this.id_ = this.player_.id() + "_Twitch_api";
        this.el_ = videojs.Component.prototype.createEl("iframe", {
            id: this.id_,
            className: "vjs-tech",
            scrolling: "no",
            marginWidth: 0,
            marginHeight: 0,
            frameBorder: 0,
            width:window.innerWidth,
            height:window.innerHeight,
            src:url+""
        });
        this.player_el_.insertBefore(this.el_, this.player_el_.firstChild);
        this.playOnReady = true;
        this.el_.setAttribute('allowFullScreen', '');
    } 
});
videojs.Twitch.prototype.params = [];
videojs.Twitch.prototype.dispose = function(e) {
    if (this.el_&&this.el_.parentNode) this.el_.parentNode.removeChild(this.el_);
    videojs.MediaTechController.prototype.dispose.call(this)
};
videojs.Twitch.prototype.src = function(e) {
};
videojs.Twitch.prototype.currentSrc = function() {
};
videojs.Twitch.prototype.play = function() {
};
videojs.Twitch.prototype.ended = function() {
};
videojs.Twitch.prototype.pause = function() {
};
videojs.Twitch.prototype.paused = function() {
};
videojs.Twitch.prototype.currentTime = function() {
};
videojs.Twitch.prototype.setCurrentTime = function(e) {
};
videojs.Twitch.prototype._duration;
videojs.Twitch.prototype.duration = function() {
};
videojs.Twitch.prototype.buffered = function() {
    return []
};
videojs.Twitch.prototype.volume = function() {
};
videojs.Twitch.prototype.setVolume = function(e) {
};
videojs.Twitch.prototype.muted = function() {
};
videojs.Twitch.prototype.setMuted = function(e) {
};
videojs.Twitch.prototype.onReady = function() {
};
videojs.Twitch.isSupported = function() {
    return true
};
videojs.Twitch.prototype.supportsFullScreen = function() {
    return false
};
videojs.Twitch.canPlaySource = function(e) {
};
videojs.Twitch.loadingQueue = [];
videojs.Twitch.prototype.loadApi = function() {
};
videojs.Twitch.prototype.onStateChange = function(e) {
};
videojs.Twitch.makeQueryString = function(e) {
};
videojs.Twitch.parseVideoId = function(e) {
};
videojs.Twitch.parsePlaylist = function(e) {
};
videojs.Twitch.prototype.setupTriggers = function() {
};
videojs.Twitch.prototype.eventHandler = function(e) {
};
videojs.Twitch.Events = "apiready,play,playing,pause,ended,canplay,canplaythrough,timeupdate,progress,seeking,seeked,volumechange,durationchange,fullscreenchange,error".split(",");

