/*
 * Copyright (C) 2014 Kunihiro Ando
 *      senna5150ando@gmail.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// videojs.options.flash.swf = "video-js-swf/video-js.swf";
var player = null;
var resizetimerid = null;
var loadtimerid = null;
var errortimerid = null;
var MEDIATYPE = null;
var mpegdashplayer = null;
var srtobj = {
	srt:null,
	crntvideo:null,
	crnttype:null,
	crntutype:null,
	size:16
};
var txtcreateurl = null;
window.embedder = null
window.embedderOrigin = null
window.addEventListener("resize",resize,true);
window.addEventListener("message",checkType,true);
document.addEventListener("DOMContentLoaded", function(event) {
	resize();
	setVideoJS();
},false);

function setVideoJS(mtype,vurl,mpd){
	if(mpd){
		videojs("example_video_1", {context:new Dash.di.DashContext(), plugins: { dialogbutton: true,loopbutton: true } });
	}else{
		videojs("example_video_1", { plugins: { dialogbutton: true,loopbutton: true } });
	}
	videojs("example_video_1").ready(function(){
		if(!mtype){
			MEDIATYPE = null;
		}else{
			MEDIATYPE = mtype;
		}
		var that = this;
		player = this;
		resize();
		this.hotkeys({
			volumeStep: 0.1,
			seekStep: 5,
			enableMute: true,
			enableFullscreen: true
		}).on("loadstart", function(){ 
			_sendmsg__({type:"getvolume"});
		}).on("firstplay", function(){ 
			var scr = this.currentSrc();
			var vtag = document.querySelector("video");
			if(vtag)vtag.removeAttribute("controls");
		    _sendmsg__({type:"hiddenmodal"});
			setTimeout(function(){
				resize();
			},250);
		}).on("volumechange", function(){ 
			var val = this.volume();
			_sendmsg__({type:"volume",val:val})
		}).on("loadeddata", function(){ 
			this.play();
		}).on("ended", function(){ 
			_sendmsg__({type:"finish"});
		});
		var errelem = document.getElementsByClassName("vjs-error-display");
		if(errelem&&errelem.length > 0){
			errelem[0].addEventListener("click",function(){
				_sendmsg__({type:"oepndialog"})
			},true);
		}
		if(mtype){
			this.src([
				{ type: "video/"+mtype, src: vurl }
			]);
		}
	});
}
function mediaError(){
	setTimeout(function(){
		if(!player.loop())_sendmsg__({type:"nextitem"});
	},500);
}
function initElement(){
	if(player){
		if(player.currentSrc)player.currentSrc()
		if(player.pause)player.pause();
		setTimeout(function(){
			if(player.dispose)player.dispose();
		},20)
	}
	setTimeout(function(){
		if(mpegdashplayer){
			if(player&&player.pause)player.pause();
			if(mpegdashplayer.reset)mpegdashplayer.reset(); 
		}
	},150)
}
function setVideo(type,url,utype){
	var timer = 300;
	clearTimeout(errortimerid);
	setTimeout(initElement,0);
	srtobj.crntvideo = url;
	srtobj.crnttype = type;
	srtobj.crntutype = utype;
	clearTimeout(loadtimerid);
	loadtimerid = setTimeout(function(){
		var vcont = document.getElementById("video-container");
		var video = document.createElement("video")
		vcont.appendChild(video);
		video.setAttribute("id","example_video_1");
		video.setAttribute("class","video-js vjs-default-skin");
		video.setAttribute("width",window.innerWidth);
		video.setAttribute("height",window.innerHeight);
		video.setAttribute("controls","");
		video.setAttribute("preload","auto");

		video.setAttribute("data-setup",'{"techOrder": ["html5"],"playbackRates": [0.6,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9] }');
		video.addEventListener("dblclick",setFullScreen,true);

	 	var track = document.createElement("track");
		video.appendChild(track);
		track.setAttribute("kind","chapters");
		track.setAttribute("src","input.vtt");
		track.setAttribute("srclang","en");
		track.setAttribute("label","Chapters1");
		track.setAttribute("default","default");

	 	var track2 = document.createElement("track");
		video.appendChild(track2);
		track2.setAttribute("kind","subtitles");
		if(srtobj.srt){
			var srtfile = srtobj.srt;
			srtobj.srt = null;
			track2.setAttribute("src",srtfile);
		}else{
			track2.setAttribute("src","blank.srt");
		}
		track2.setAttribute("label","Open Srt");
		track2.setAttribute("default","default");

		if(utype&&(type === "url" || type === "m3u8" || type === "mpd"|| type === "bmpd")){
			if(type === "m3u8"){
				setVideoJS();
				videojs("example_video_1").src([
					{ type: "application/x-mpegURL", src: url}
				]);
			}else if(type === "bmpd"){
				setVideoJS();
				videojs("example_video_1").src([
					{ type: "application/dash+xml", src: url}
				]);
			}else if(type === "mpd"){
				setTimeout(function(){
					var context = new Dash.di.DashContext(); 
					mpegdashplayer = new MediaPlayer(context);
					mpegdashplayer.startup(); 
					mpegdashplayer.attachView(document.getElementById("example_video_1"));
					mpegdashplayer.attachSource(url); 
					setVideoJS(null,null,true);
				},100);
			}else{
				if(url)setVideoJS(utype,url);
			}
		}else{
			if(url)setVideoJS(type,url);
		}
		setTimeout(function(){
			addEvent();
		},2200)
	},timer);
}
function addEvent(){
	var buttons = document.getElementsByClassName("vjs-subtitles-button");
	var button = buttons[0];
	if(!button)return;
	var menus = button.querySelectorAll(".vjs-menu-item");
	menus[0].addEventListener("click",function(e){
		_sendmsg__({type:"changefont"})
	},false);
	menus[1].addEventListener("click",function(e){
		createOpen()
	},false);
	var stelem = document.getElementsByClassName("vjs-subtitles vjs-text-track")[0];
	if(stelem)stelem.style.fontSize = srtobj.size+"px";
	function createOpen(){
		_sendmsg__({type:"opensrt"})
	}
}
function readText(txt){
	var blob = new Blob([txt], { type: "text/plain;charset=UTF-8" });
	URL.revokeObjectURL(txtcreateurl)
	var txturl = URL.createObjectURL(blob);
	txtcreateurl = txturl;
	srtobj.srt = txturl;
	setVideo(srtobj.crnttype,srtobj.crntvideo,srtobj.crntutype);
}
function resize(){
	if(player){
		var ww = window.innerWidth;
		var wh = window.innerHeight;
		player.width(ww);
		player.height(wh);
	}
}
function setFullScreen(e){
	_sendmsg__({type:"fullscreen"});
	if(e&&e.stopPropagation)e.stopPropagation();
}
function checkType(evt){
	if(evt.data){
	    if(evt.data.msg == 'loadv'){
	        window.embedder = evt.source;
	        window.embedderOrigin = evt.origin;
	        srtobj.size = evt.data.fsize-0;
	    } else if (evt.data.msg == 'sendfontsize') {
	        srtobj.size = evt.data.fsize-0;
			var stelem = document.getElementsByClassName("vjs-subtitles vjs-text-track")[0];
			if(stelem)stelem.style.fontSize = srtobj.size+"px";
	    } else if (evt.data.ex == 'mp4') {
	    	var url = evt.data.url;
			setVideo("mp4",url);
	    } else if (evt.data.ex == 'webm') {
	    	var url = evt.data.url;
			setVideo("webm",url);
	    } else if (evt.data.ex == 'ogg') {
	    	var url = evt.data.url;
			setVideo("ogg",url);
	    } else if (evt.data.ex == 'url') {
	    	if(evt.data.uex === "m3u8"){
				setVideo("m3u8",evt.data.url,"m3u8");
	    	}else if(evt.data.uex === "mpd"){
				setVideo("mpd",evt.data.url,"mpd");
	    	}else if(evt.data.uex === "bmpd"){
				setVideo("bmpd",evt.data.url,"bmpd");
	    	}else{
				setVideo("url",evt.data.url,evt.data.uex);
			}
	    } else if (evt.data.msg == 'setvolume') {
	        if(player)player.volume(evt.data.val);
	    } else if (evt.data.msg == 'stopplayerv') {
	        if(player&&!player.paused())player.pause();
	    } else if (evt.data.msg == 'sendsrttxt') {
	    	var txt = evt.data.txt;
	    	if(txt)readText(txt)
	    }else{
	    	evt.data.ex = "mp4";
	    	if(evt.data.ex&&evt.data.url)setVideo(evt.data.ex,evt.data.url)
	    }
	}
}
function _sendmsg__(data) {
	if(window.embedder)window.embedder.postMessage(data, embedderOrigin);
}
