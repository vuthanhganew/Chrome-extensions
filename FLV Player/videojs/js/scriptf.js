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
var crnttype = null;
var player = null;
var resizetimerid = null;
var loadtimerid = null;
var errorcount = 0;
var errortimerid = null;
var MEDIATYPE = null;
var srtobj = {
	srt:null,
	crntvideo:null,
	crnttype:null,
	crntutype:null,
	size:16
};
var txtcreateurl = null;
var base64url = null;
videojs.options.flash.swf = "video-js-swf/video-js.swf";

window.embedder = null
window.embedderOrigin = null
window.addEventListener("resize",resize,true);
window.addEventListener("message",checkType,true);
document.addEventListener("DOMContentLoaded", function(event) {
	resize();
	setVideoJS();
	document.getElementById("file_input").addEventListener("change",inputFile,false)
	document.getElementById("fileinput-container").addEventListener("click",function(){
		document.getElementById("file_input").click();
	},false)
},false);

function replaceInput(){
	var cont = document.getElementById("button-container");
	var inpt = document.getElementById("file_input");
	cont.removeChild(inpt);
	var ninpt = document.createElement("input");
	cont.appendChild(ninpt);
	ninpt.setAttribute("id","file_input");
	ninpt.setAttribute("type","file");
	ninpt.setAttribute("accept",".flv");
	ninpt.setAttribute("multiple","");
	ninpt.style.display = "none";
	ninpt.addEventListener("change",inputFile,false);
}
function inputFile(e){
	var nary = [],sary = [],idx = 0;
	for (var i = 0; i < e.target.files.length; i++) {
		var file = e.target.files[i];
	    if(/\.(flv)$/i.test(file.name)) {
			var furl = window.URL.createObjectURL(file);
			sary.push(furl)
	    	nary.push(furl);
	    	idx++;
	    }
	};
	if(nary.length > 0){
		_sendmsg__({type:"llv",list:sary});
		setTimeout(function(){
			replaceInput();
		},200);
		setVideo("llv",nary[0]);
	}
}
function setVideoJS(mtype,func,noplay,stopflg){
	var vpl = videojs('example_video_1', { plugins: { dialogbutton: true,loopbutton: true } });
	if(noplay)vpl.src(noplay)
	videojs("example_video_1").ready(function(){
		if(noplay)this.on('loadstart',function(){this.play();});
		setTimeout(function(){
	        if(document.getElementsByClassName("vjs-control-bar")[0])document.getElementsByClassName("vjs-control-bar")[0].style.display = "block";
		},120);
		errorcount = 0;
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
			hoverPlayer();
			_sendmsg__({type:"getvolume"});
		}).on("play", function(){ 
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
			if(!noplay)this.play();
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
				{ type: "video/"+mtype, src: "/LAUNCHENTRY" }
			]);
		}
		setTimeout(function(){
			if(func)func();
			if(stopflg){
				// player.pause();
				document.getElementById("loading-image-span").style.display = "block";
				player.on("loadedalldata",function(){
					document.getElementById("loading-image-span").style.display = "none";
				});
			}
		},180);
	});
}
function mediaError(){
	if(errorcount < 2 &&MEDIATYPE){
		errorcount++;
		setTimeout(function(){
			player.src([
				{ type: "video/"+MEDIATYPE, src: "/LAUNCHENTRY" }
			]);
		},250);
	}else{
		setTimeout(function(){
			if(!player.loop()){
				_sendmsg__({type:"nextitem"});
			}
		},2500);
	}
}
function hoverPlayer(){
    var flash = document.getElementById("example_video_1_flash_api");
    if(flash){
    	flash.removeEventListener("mousemove",showControl,false);
    	flash.addEventListener("mousemove",showControl,false);
    }
}
function showControl(){
	var vcontrl = document.getElementsByClassName("vjs-control-bar")[0];
	if(vcontrl&&vcontrl.style.display !== "block"){
		vcontrl.style.display = "block";
	}
}
function initElement(){
	var cvdm = document.getElementById("cover-dailymplayer");
	if(cvdm&&cvdm.parentNode){
		cvdm.parentNode.removeChild(cvdm);
	}
	var ncvdm = document.createElement("div");
	document.body.appendChild(ncvdm);
	ncvdm.setAttribute("id","cover-dailymplayer");
	ncvdm.addEventListener("dblclick",setFullScreen,true);
	cvdm = null;
	clearTimeout(errortimerid);
	if(player){
		if(player.pause)player.pause();
		setTimeout(function(){
			player.dispose();
		},20);
	}
	setTimeout(function(){
		if(document.getElementById("example_video_1"))document.getElementById("video-container").innerHTML = "";
	},150);	
}
function setVideo(type,url){
	var timer = 300;
	crnttype = type;
	setTimeout(initElement,0);
	srtobj.crntvideo = url;
	srtobj.crnttype = type;
	srtobj.crntutype = null;
	document.getElementById("loading-image-span").style.display = "none";
	document.getElementById("fileinput-container").style.display = "none";
	clearTimeout(loadtimerid);
	loadtimerid = setTimeout(function(){
		var vcont = document.getElementById("video-container");
		var setcover = null;
		if(type === "twitch"){
			setcover = null;
		    var dpl = document.getElementById("cover-dailymplayer");
		    dpl.style.display = "block";
		    dpl.addEventListener("mousemove",function(e){
		        clearTimeout(hovertimeid);
		        hovertimeid = setTimeout(function(){
		            if(document.getElementsByClassName("vjs-control-bar")[0])document.getElementsByClassName("vjs-control-bar")[0].style.display = "none";
		        },30);
		    },true);
		    setTimeout(function(){
			    dpl.style.display = "block";
		    },150);
		    setTimeout(function(){
			    dpl.style.display = "block";
		    },300);
		    setTimeout(function(){
			    dpl.style.display = "block";
		    },500);			    
		}else{
			setcover = function(){
		        if(type === "vimeo"){
		        }else if(type === "twitch"){
		        }else{
				    document.getElementById("cover-dailymplayer").addEventListener("click",function(e){
				        e.stopPropagation();
				        e.preventDefault();
				        if(player.paused()){
				            player.play()
				        }else{
				            player.pause()
				        }
				    },true);
				}
			    setTimeout(function(){
				    document.getElementById("cover-dailymplayer").addEventListener("mousemove",function(e){
				        if(document.getElementsByClassName("vjs-control-bar")[0])document.getElementsByClassName("vjs-control-bar")[0].style.display = "block";
				        clearTimeout(hovertimeid);
				        hovertimeid = setTimeout(function(){
				            if(document.getElementsByClassName("vjs-control-bar")[0])document.getElementsByClassName("vjs-control-bar")[0].style.display = "none";
				        },3500);
				    },true); 
				    setTimeout(function(){
					    document.getElementById("cover-dailymplayer").style.display = "block";
				    },200);
				},100);
			};
		}
		var video = document.createElement("video")
		vcont.appendChild(video);
		video.setAttribute("id","example_video_1");
		video.setAttribute("class","video-js vjs-default-skin");
		video.setAttribute("width",window.innerWidth);
		video.setAttribute("height",window.innerHeight);
		video.setAttribute("controls","");
		video.setAttribute("preload","auto");

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

		if(type === "remove"){
			videojs("example_video_1", {}, function(){});
		}else if(type === "youtube"){
			if(url){
				video.setAttribute("data-setup",'{"techOrder": ["youtube"], "src": "'+url+'" }');
				setVideoJS(null,setcover);
			}
		}else if(type === "dailymotion"){
			if(url){
				video.setAttribute("data-setup",'{ "techOrder": ["dailymotion"], "src": "'+url+'" }');
				setVideoJS(null,setcover);
			}
		}else if(type === "soundcloud"){
			if(url){
				video.setAttribute("data-setup",'{ "techOrder": ["soundcloud"], "src": "'+url+'" }');
				setVideoJS(null,setcover);
			}
		}else if(type === "vimeo"){
			if(url){
				video.setAttribute("data-setup",'{ "techOrder": ["vimeo"], "src": "'+url+'" }');
				setVideoJS(null,setcover);
			}
		}else if(type === "twitch"){
			if(url){
				video.setAttribute("data-setup",'{"techOrder": ["twitch"], "src": "'+url+'" }');
				setVideoJS(null,setcover);
			}
		}else if(type === "rtmp"){
			if(url){
				video.setAttribute("preload","none");
				video.setAttribute("data-setup",'{"techOrder": ["flash"]}');
				setVideoJS(null,setcover);
				videojs("example_video_1").src([
					{ type: "rtmp/mp4", src: url}
				]);
			}
		}else if(type === "m3u8"){
			video.setAttribute("preload","none");
			video.setAttribute("data-setup",'{"techOrder": ["flash"]}');
			setVideoJS(null,setcover,url);	
			videojs("example_video_1").src([
				{ type: "video/flv", src: url}
			]);
		}else if(type === "base64" || type == "llv"){
			var stopflg = false;
	    	// URL.revokeObjectURL(base64url)
	    	if(type === "base64"){
	    		url = window.URL.createObjectURL(url);
	    	}else{
	    		stopflg = true;
	    	}
			base64url = url;
			video.setAttribute("data-setup",'{"techOrder": ["flash"]}');
			setVideoJS(null,setcover,null,stopflg);
			videojs("example_video_1").src([
				{ type: "video/flv", src: url}
			]);
		}else if(type === "nflv"){
			video.setAttribute("data-setup",'{"techOrder": ["flash"]}');
			setVideoJS(null,setcover,null);
			videojs("example_video_1").src([
				{ type: "video/flv", src: url}
			]);
		}else{
			video.setAttribute("data-setup",'{"techOrder": ["flash"]}');
			setVideoJS(type,setcover);
		}
		setTimeout(function(){
			addEvent();
		},2400)
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
	_sendmsg__({type:"fullscreen"})
	if(e&&e.stopPropagation)e.stopPropagation();
}
function checkType(evt){
	if(evt.data){
	    if(evt.data.msg == 'loadf'){
	        window.embedder = evt.source;
	        window.embedderOrigin = evt.origin;
	        srtobj.size = evt.data.fsize-0;
	    } else if (evt.data.msg == 'sendfontsize') {
	        srtobj.size = evt.data.fsize-0;
			var stelem = document.getElementsByClassName("vjs-subtitles vjs-text-track")[0];
			if(stelem)stelem.style.fontSize = srtobj.size+"px";
	    } else if (evt.data.ex == 'flv') {
	    	if(evt.data.base64){
	    		var blob = new Blob([evt.data.base64],{type:"video/flv"});
		   		setVideo("base64",blob);
	    	}else{
		   		setVideo("flv");
	    	}
	    } else if (evt.data.ex == 'youtube') {
			setVideo("youtube",evt.data.url);
	    } else if (evt.data.ex == 'dailymotion') {
			setVideo("dailymotion",evt.data.url);
	    } else if (evt.data.ex == 'soundcloud') {
			setVideo("soundcloud",evt.data.url);
	    } else if (evt.data.ex == 'vimeo') {
			setVideo("vimeo",evt.data.url);
	    } else if (evt.data.ex == 'twitch') {
			setVideo("twitch",evt.data.url);
	    } else if (evt.data.ex == 'stream') {
	    	var url = evt.data.url;
	    	if(evt.data.stype === "rtmp"){
				setVideo("rtmp",url);
	    	}else if(evt.data.stype === "m3u8"){
				setVideo("m3u8",url);
	    	}else if(evt.data.stype === "nflv"){
				setVideo("nflv",url);
			}
	    } else if (evt.data.msg == 'setvolume') {
	        if(player)player.volume(evt.data.val);
	    } else if (evt.data.ex == 'open_llv') {
	    	document.getElementById("fileinput-container").style.display = "block";
	    	setTimeout(function(){
		    	document.getElementById("fileinput-container").style.display = "block";
	    	},300);
	    } else if (evt.data.ex == 'open_fdialog') {
	    } else if (evt.data.ex == 'llv') {
			setVideo("llv",evt.data.url);
	    } else if (evt.data.msg == 'stopplayerf') {
	        if(player){
	        	if(crnttype === "twitch"){
					setVideo("remove","");
	        	}else{
	        		if(srtobj.crnttype === "vimeo"){
	        			player.pause();
	        		}else{
				        if(player&&!player.paused())player.pause();
	        		}
	        	}
	        }
	    } else if (evt.data.msg == 'sendsrttxt') {
	    	var txt = evt.data.txt;
	    	if(txt)readText(txt)     
	    } else if (evt.data.msg == 'dispose') {
	    	initElement();
	    }
	}
}
function _sendmsg__(data) {
	if(window.embedder)window.embedder.postMessage(data, embedderOrigin);
}
