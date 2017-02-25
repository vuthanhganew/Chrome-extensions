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

var VIDEOINDEX = -1;
var VIDEO_FILE_ENTRYS = [];
var VIDEO_INDEX_ARRAY = [];
var PLAYERMODE = "html5";
var PREVENTRESZEEVENT = null;
var RESIZETIMERID = null;
var SHOWFRAMETIMERID = null;
var BROWSERSCRIPT = null;
var CURRENTBROWSEURL = null;
var CLICKNEXTVIDEOTIMERID = null;
var ADDEVENTFLAG = false;
var SRTFONTSIZE = 16;
var FLASHSTREAM = true;
var PREFILEURL = null;
var IMAGEURLS = [];

document.addEventListener("DOMContentLoaded", function(event) {
    var webviewf = document.getElementById('webviewf');
    var webviewv = document.getElementById('webviewv');
    var webviewb = document.getElementById('webviewb');
    webviewv.addEventListener('contentload', function() {
        this.contentWindow.postMessage({msg:"loadv",fsize:SRTFONTSIZE},"*");
    });
    webviewf.addEventListener('contentload', function() {
        this.contentWindow.postMessage({msg:"loadf",fsize:SRTFONTSIZE},"*");
	    chrome.runtime.getBackgroundPage( function(bg) {
	    	if(bg.LaunchDATA&&bg.LaunchDATA.items&&bg.LaunchDATA.items[0]){
	            document.getElementById('FileModal').style.display = "none";
                document.getElementById("loadingModal").style.display = "block";
                var aitem = bg.LaunchDATA.items[0].entry;
                if((aitem.type === "sendurl") || (aitem.type === "sendlink") || (aitem.type === "sendvideo")){
                    setTimeout(function(){
                        checkSendURL(aitem);
                    },1200);
                }else{
    			    setTimeout(function(){
    			    	if(/\.(mfppl)$/i.test(aitem.name)) {
    			    		setTimeout(function(){
	    			    		checkPlaylist(aitem);
    			    		},300);
                        }else if((aitem.type === "youtube") || (aitem.type === "dailymotion") || (aitem.type === "twitch") || (aitem.type === "soundcloud") || (aitem.type === "vimeo") || (aitem.type === "url")){
                            checkURLEntry(aitem.name);
                            document.getElementById("loadingModal").style.display = "none";
                        }else{
    				    	checkFileEntry([aitem]);
                        }
    				},2000);   
                }
                bg.LaunchDATA = null;
	        }
	    });
    });
    webviewb.addEventListener('contentload', function() {
        this.contentWindow.postMessage({msg:"loadb"},"*");
        if(BROWSERSCRIPT){
        	var scrpt = BROWSERSCRIPT;
            BROWSERSCRIPT = null;
		    if(webviewb.src.match(/^https?:\/\/.*\.pandora\.tv\/.*/)) {
	            setTimeout(function(){
	                webviewb.executeScript({ code:scrpt}); 
	            },8000);
            }else{
	            setTimeout(function(){
	                webviewb.executeScript({ code:scrpt}); 
	            },2000);
	        }
            showBrowserMode(true);
        }
    });
    webviewf.addEventListener("message",receiveMessage,false);
    webviewv.addEventListener("message",receiveMessage,false);
    webviewb.addEventListener("message",receiveMessage,false);
    webviewb.addEventListener('loadcommit', function() {
        if(BROWSERSCRIPT)webviewb.executeScript({ code:"setTimeout(function(){document.body.style.overflow = 'hidden';},10);document.documentElement.style.overflow = 'hidden';"}); 
    });
    addEvents();
    gglObj();
    createCountrycode();
    resizeWindow();
    chrome.storage.local.get('_alwaysontop',function(obj){
        if(obj['_alwaysontop']){
	        var crntw = chrome.app.window.current();
        	document.getElementById("modal-awesome-pid").classList.add("alwaysontop")
        	document.getElementById("modal-awesome-pid0").classList.add("alwaysontop")
            crntw.setAlwaysOnTop(true);
        }
    });
    chrome.storage.local.get('shoutcastvolume',function(obj){
        if(obj['shoutcastvolume'])document.getElementById("shoutcast-volume").value = obj['shoutcastvolume']-0;
    });    
    chrome.runtime.sendMessage("hmjaimbpcoggfnbmcenplmcblhdcleii","install",function(resp){
        if(resp === "ok")document.getElementById("modal-awesome-extension").style.display = "none";
    });
    chrome.storage.local.get('_srtfontsize',function(obj){
        if(obj['_srtfontsize']){
            var fsize = obj['_srtfontsize']-0;
            setTimeout(function(){
                document.getElementById('webviewf').contentWindow.postMessage({msg:"sendfontsize",fsize:fsize},"*");
                document.getElementById('webviewv').contentWindow.postMessage({msg:"sendfontsize",fsize:fsize},"*");
            },2800);
            document.getElementById('srtfont-size').value = fsize;
        }
    });
    chrome.storage.local.get('_coloradjust',function(obj){
        if(obj['_coloradjust']){
            var robj = obj['_coloradjust'];
            document.getElementById('brightness-range').value = robj.brval-0;
            document.getElementById('contrast-range').value = robj.cntval-0;
            document.getElementById('saturate-range').value = robj.satval-0;
            document.getElementById('hue-rotate-range').value = robj.huval-0;
            document.getElementById('grayscale-range').value = 0;
            document.getElementById('sepia-range').value = robj.sepval-0;
            adjustColor();
        }
    });
    chrome.storage.local.get('_vimeoToken',function(obj){
        if(obj['_vimeoToken']){
            vimeo_t_o_k_e_n = obj['_vimeoToken'];
        }
    });
    setTimeout(function(){
        resizeWindow();
    },360);
},true);
chrome.app.runtime.onLaunched.addListener(function(launchData) {
	chrome.runtime.getBackgroundPage( function(bg) {
	    if(bg.LaunchDATA&&bg.LaunchDATA.items&&bg.LaunchDATA.items[0]){
	        document.getElementById('FileModal').style.display = "none";
	        document.getElementById("loadingModal").style.display = "block";
	        var aitem = bg.LaunchDATA.items[0].entry;
	        setTimeout(function(){
	            if(/\.(mfppl)$/i.test(aitem.name)) {
	                checkPlaylist(aitem);
	            }else{
	                checkFileEntry([aitem]);
	            }
	        },100);   
	        bg.LaunchDATA = null;
	    }
	});
});
function addEvents(){
	window.addEventListener("message",receiveMessage,false);
	window.addEventListener("resize",function(){
		clearTimeout(RESIZETIMERID);
		RESIZETIMERID = setTimeout(function(){
		    var cfrm = document.getElementById('custom-frame');
			if(cfrm.style.display === "block"){
				resizeWindow();
			}else{
				resizeWindow(null,true);
			}
		},120);
	},false);
    window.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, true);
    window.addEventListener("dragleave", function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, true);
    window.addEventListener("drop",function(e) {
        e.preventDefault();
        e.stopPropagation();
        __dropLocalFile(e);
    }, true);
    document.getElementById('file-modal-inner-item').addEventListener("click",function(){
        __openfile();
    });
    document.getElementById('dir-modal-inner-item').addEventListener("click",function(){
        __openfolder();
    });
    document.getElementById('url-modal-inner-item').addEventListener("click",function(e){
        __openURL();
    });
    document.getElementById('playlist-close').addEventListener("click",function(){
        document.getElementById('PlaylistModal').style.display = "none";
    });
    addFrameEvent("modal-awesome-frame",clickFrameItem);
    addFrameEvent("modal-awesome-minus",clickFrameItem);
    addFrameEvent("modal-awesome-max",clickFrameItem);
    addFrameEvent("modal-awesome-close",clickFrameItem);
    addFrameEvent("modal-awesome-pin",clickFrameItem);
    addFrameEvent("modal-awesome-blank",clickFrameItem);
    addFrameEvent("modal-awesome-browser",clickFrameItem);
    addFrameEvent("modal-awesome-bookmarks",clickFrameItem);
    document.getElementsByClassName('modal-awesome-about')[0].addEventListener("click",function(){
        document.getElementById('settingsModal').style.display = "none";
        document.getElementById('aboutModal').style.display = "block";
    });

    document.getElementById("modal-awesome-bgm").addEventListener("click",function(){
        document.getElementById("rdselectstream7").checked = true;
	    __openURL();
	    setTimeout(function(){
	    	setStreamingSearch();
	        document.getElementById('settings-close').click();
	    },300);
    });
    document.getElementById('modal-awesome-sleep').addEventListener("click",function(){
        document.getElementById('settingsModal').style.display = "none";
        document.getElementById('sleepModal').style.display = "block";
        chrome.alarms.get("auto-stop",function(alr){
            if(alr){
                document.getElementById("sleep-time").value = parseInt((alr.scheduledTime - Date.now())/1000/60);
                document.getElementById('sleep-set').checked = true;
            }
        });
    });  
    document.getElementById('sleep-close').addEventListener("click",function(){
        document.getElementById('sleepModal').style.display = "none";
    });
    document.getElementById('modal-awesome-flash').addEventListener("click",function(){
        document.getElementById('settingsModal').style.display = "none";
        document.getElementById('flashplayModal').style.display = "block";
    });
    document.getElementById('flash-close').addEventListener("click",function(){
        document.getElementById('flashplayModal').style.display = "none";
    });
    document.getElementById('flash-playback-streaming').addEventListener("change",function(){
        if(this.checked){
            FLASHSTREAM = true;
            chrome.storage.local.remove("_flash-playback");
        }
    });
    document.getElementById('flash-playback-direct').addEventListener("change",function(){
        if(this.checked){
            FLASHSTREAM = false;
            var obj = {"_flash-playback":"normal"};
            chrome.storage.local.set(obj)
        }
    });
    chrome.storage.local.get("_flash-playback",function(obj){
        if(obj["_flash-playback"]){
            FLASHSTREAM = false;
            document.getElementById('flash-playback-direct').checked = true;
        }
    });
    document.getElementById('srtfont-close').addEventListener("click",function(){
        document.getElementById('SrtFontModal').style.display = "none";
    });
    document.getElementById('srtfont-size').addEventListener("change",function(){
        SRTFONTSIZE = this.value-0;
        var obj = {};
        obj['_srtfontsize'] = this.value-0;
        chrome.storage.local.set(obj);
        document.getElementById('webviewf').contentWindow.postMessage({msg:"sendfontsize",fsize:SRTFONTSIZE},"*");
        document.getElementById('webviewv').contentWindow.postMessage({msg:"sendfontsize",fsize:SRTFONTSIZE},"*");
    });
    document.getElementById('modal-awesome-color').addEventListener("click",function(){
        document.getElementById('settingsModal').style.display = "none";
        document.getElementById('colorModal').style.display = "block";
    });
    document.getElementById('color-close').addEventListener("click",function(){
        document.getElementById('colorModal').style.display = "none";
    });
    document.getElementById('brightness-range').addEventListener("change",function(e){
        adjustColor();
    });
    document.getElementById('contrast-range').addEventListener("change",function(e){
        adjustColor();
    });
    document.getElementById('saturate-range').addEventListener("change",function(e){
        adjustColor();
    });
    document.getElementById('hue-rotate-range').addEventListener("change",function(e){
        adjustColor();
    });
    document.getElementById('grayscale-range').addEventListener("change",function(e){
        adjustColor();
    });
    document.getElementById('sepia-range').addEventListener("change",function(e){
        adjustColor();
    });
    document.getElementById('reset-color-adjust').addEventListener("click",function(e){
        resetColor();
    });
    document.getElementById('sleep-set').addEventListener("change",function(){
        chrome.alarms.clearAll();
        if(this.checked){
            var m = document.getElementById("sleep-time").value;
            chrome.alarms.create("auto-stop",{delayInMinutes:m-0});
            chrome.power.requestKeepAwake("display");
        }else{
            var bl = document.querySelector(".modal-awesome-blank");
            if(bl.classList.contains("alwaysontop")){
                chrome.power.requestKeepAwake("display");              
            }else{
                chrome.power.releaseKeepAwake();
            }            
        }
    });
    document.getElementById('modal-awesome-playlist').addEventListener("click",function(){
        document.getElementById('settings-close').click();
        showPlaylist();
    });
    document.getElementById('modal-awesome-open').addEventListener("click",function(){
        document.getElementById('settings-close').click();
        document.getElementById('FileModal').style.display = "block";
        setTimeout(function(){
            resizeWindow();
        },100);
    });
    document.getElementById('about-close').addEventListener("click",function(){
        document.getElementById('aboutModal').style.display = "none";
    });
    document.getElementById('aboutModal').addEventListener("click",function(){
        document.getElementById('aboutModal').style.display = "none";
    });
    document.getElementById('about-message-container').addEventListener("click",function(e){
        e.stopPropagation();
    },true);
    document.getElementsByClassName('modal-awesome-settings')[0].addEventListener("click",function(){
        document.getElementById('settingsModal').style.display = "block";
    });
    document.getElementById('settings-close').addEventListener("click",function(){
        document.getElementById('settingsModal').style.display = "none";
    });
    document.getElementById('bookmark-close').addEventListener("click",function(){
        hideBookmarkMode();
    });
    document.getElementById("URLModal").addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        var that = this;
        this.style.opacity = 0;
        setTimeout(function(){
            that.style.display = "none";
        },400);
    },false);
    document.getElementById("url-input").addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
    },true);
    document.getElementById("url-input").addEventListener("keypress",function(e){
        if(e.keyCode === 13)document.getElementById("url-okbutton").click();
    },true);
    document.getElementById("url-okbutton").addEventListener("click",function(e){
        var txt = document.getElementById("url-input").value.replace(/^\s+|\s+$/g, "");
        var that = document.getElementById("URLModal");
        that.style.opacity = 0;
        setTimeout(function(){
            that.style.display = "none";
        },400);  
        checkURLEntry(txt);
    },true);
    document.getElementById("youtube-start-search").addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        setStreamingSearch();
    },true);
    document.getElementById("youtube-serach-container").addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
    },false);
    document.getElementById("searchtype-container").addEventListener("click",function(e){
        e.stopPropagation();
    },false);
    document.getElementById('youtube-search-close').addEventListener("click",function(){
        var ytcont = document.getElementById("youtube-serach-container");
        ytcont.style.top = "-100px";
        setTimeout(function(){
            document.getElementById("youtube-search-input").blur();
            ytcont.style.display = "none";
        },300);
    },true);
    document.getElementById("save-playlist-button").addEventListener("click",createPlaylist,false);
    document.getElementById("plist-modal-inner-item").addEventListener("click",function(e){
    	loadPlaylist()
    },false);
    document.getElementsByClassName("modal-awesome-nextvideo")[0].addEventListener("click",function(e){
        var file = VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[VIDEOINDEX+1]];
        if(file){
            VIDEOINDEX++;
            var that = this;
            this.style.color = "#0000aa";
            setTimeout(function(){
	            that.style.color = "";
            },200)
            clearTimeout(CLICKNEXTVIDEOTIMERID);
            CLICKNEXTVIDEOTIMERID = setTimeout(function(){
                onchoseentry();
            },550);
        }
    },false)
    document.getElementsByClassName("modal-awesome-prevideo")[0].addEventListener("click",function(e){
        var file = VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[VIDEOINDEX-1]];
        if(file){
            VIDEOINDEX--;
            var that = this;
            this.style.color = "#0000aa";
            setTimeout(function(){
	            that.style.color = "";
            },200)
            clearTimeout(CLICKNEXTVIDEOTIMERID);
            CLICKNEXTVIDEOTIMERID = setTimeout(function(){
                onchoseentry(true);
            },550);            
        }
    },false)   
    document.getElementById("framevisible-button").addEventListener("mouseenter",function(e){
        var cfrm = document.getElementById('custom-frame');
        if(cfrm.style.display === "none")showFrameButton();
    },true); 
    document.getElementById("framevisible-button").addEventListener("click",function(e){
        resizeWindow();
        this.style.display = "none";
    },true); 
    document.getElementById("modal-awesome-extension").addEventListener("click",function(e){
        window.open("https://chrome.google.com/webstore/detail/send-url-to-mp4-flv-playe/hmjaimbpcoggfnbmcenplmcblhdcleii")
    },true); 
    document.getElementById("bookmark-add-button").addEventListener("click",function(e){
        var cont = document.getElementById('webviewb');
        if(CURRENTBROWSEURL&&CURRENTBROWSEURL.url&&CURRENTBROWSEURL.width){
            chrome.storage.local.get('_bkitem',function(obj){
                if(obj['_bkitem']){
                    obj['_bkitem'].push(CURRENTBROWSEURL);
                }else{
                    var nary = [],obj = {};
                    nary.push(CURRENTBROWSEURL);
                    obj['_bkitem'] = nary;
                }
                chrome.storage.local.set(obj);
                hideBookmarkMode();
            });
        }
    },true); 
    document.getElementById("youtube-live-search-type").addEventListener("change",function(e){
        var sval = this.options[this.selectedIndex].value;
        if(sval === "Search"){
            document.getElementById("youtube-live-search-input").disabled = false;
        }else{
            document.getElementById("youtube-live-search-input").disabled = true;
        }
    },true); 
    document.getElementById("youtube-live-ccode-type").addEventListener("change",function(e){
        var obj = {};
        obj["livecindex"] = this.selectedIndex;
        chrome.storage.local.set(obj);
    },true); 
    document.getElementById("castradioselect").addEventListener("change",function(){
        if(this.selectedIndex == 0){
            document.getElementById("radionomy-button-container").style.display = "none";
            document.getElementById("shoutcast-button-container").style.display = "inline-block";
        }else{
            document.getElementById("shoutcast-button-container").style.display = "none";
            document.getElementById("radionomy-button-container").style.display = "inline-block";
        }
        stopShoutcast(true)
    });
    document.getElementById("shoutcastmain").addEventListener("change",function(){
        ytObj(true);
    });
    document.getElementById("shoutcastsub").addEventListener("change",function(){
        ytObj();
    });
    document.getElementById("radionomymain").addEventListener("change",function(){
        ytObj(true);
    });
    document.getElementById("radionomysub").addEventListener("change",function(){
        ytObj();
    });
    document.getElementById("shoutcast-stop-button").addEventListener("click",function(){
        stopShoutcast();
    });
    document.getElementById("shoutcast-volume").addEventListener("change",function(){
        var audio = document.getElementById("audio");
        if(audio){
            audio.volume = (this.value-0)/100;
            var obj = {};
            obj["shoutcastvolume"] = this.value;
            chrome.storage.local.set(obj);
        }
    });
    document.getElementById("save-slot1-button").addEventListener("click",function(){
        showConfirm()
    });
    document.getElementById("confirm-save-button").addEventListener("click",function(){
        var modal = document.getElementById("confirmModal");
        var pobj = createPlaylist(null,true);
        if(!pobj)return;
        var plobj = JSON.parse(pobj);
        if(plobj.length < 1)return;
	    chrome.storage.local.get('_storage_area',function(slistobj){
	    	var chrmstobj = slistobj["_storage_area"];
	    	if(!chrmstobj)chrmstobj = [];
	    	var txt = document.getElementById("input-storage-name").value;
	    	if(!txt)txt = "Storage "+(chrmstobj.length+1);
	    	var obj = {};
	    	obj.name = txt;
	    	obj.list = plobj;
	    	chrmstobj.unshift(obj);
	    	var sobj = {};
	    	sobj["_storage_area"] = chrmstobj;
		    chrome.storage.local.set(sobj);
	    });
        document.getElementById("confirm-cancel-button").click();
    });
    document.getElementById("confirm-cancel-button").addEventListener("click",function(){
        var modal = document.getElementById("confirmModal");
        modal.style.opacity = 0;
        setTimeout(function(){
            modal.style.display = "none";
        },300);
    });
    document.getElementById("twitch-search-type").addEventListener("change",function(e){
        if(this.selectedIndex === 2 || this.selectedIndex === 3 || this.selectedIndex === 5)ytObj();
    },true);
    document.getElementById("restricted-mode-button").addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
        hideBrowserMode();
        document.getElementById('FileModal').style.display = "none";
        chrome.storage.local.get("_dont_show",function(obj){
            if(obj["_dont_show"]){
                playFlash(null,"open_fdialog")
            }else{
                setTimeout(function(){
                    playFlash(null,"open_llv")
                },500)
                playFlash(null,"open_llv")
            }
        });
    },true);
    document.getElementById("localstorage-modal-inner-item").addEventListener("click",function(e){
        e.preventDefault();
        e.stopPropagation();
	    document.getElementById('FileModal').style.display = "block";
        document.getElementById('localstorage-container').style.display = "block";
        setTimeout(function(){
	        document.getElementById('localstorage-container').style.opacity = 1;
        },1);
        createLocalStorageList();
    })
    document.getElementById("localstorage-close").addEventListener("click",function(e){
        document.getElementById('localstorage-container').style.opacity = 0;
        setTimeout(function(){
	        document.getElementById('localstorage-container').style.display = "none";
        },300)
    })
    document.getElementById("open-charset-input").addEventListener("click",function(){
        __openCharsetfile();
    });
    document.getElementById("char-set-select").addEventListener("click",function(e){
        e.stopPropagation();
    },true);
    document.getElementById("charseModal").addEventListener("click",function(){
        this.style.opacity = 0;
        this.style.display = "none";
    },false);   
    $("#playlist-item-container").sortable({
		delay:120,
        update: function( event, ui ) {
            var nary = [];
            var liarry = $('#playlist-item-container').sortable('toArray');
            if(liarry.length > 0){
                for (var i = 0; i < liarry.length; i++) {
                    var item = liarry[i];
                    var idx = item.split("vitem")[1];
                    nary.push(idx);
                };
                VIDEO_INDEX_ARRAY = nary;
                var item = document.body.querySelector(".playlist-select-item");
                if(item){
                    var id = item.getAttribute("id").split("vitem")[1];
                    var idx = nary.indexOf(id);
                    VIDEOINDEX = idx;
                }else{
                    VIDEOINDEX = 0;
                }
            }
        }
    }).disableSelection();
}
function adjustColor(resetflg){
    var brval = document.getElementById('brightness-range').value;
    document.getElementById('brightness-label').textContent = brval+"%";

    var cntval = document.getElementById('contrast-range').value;
    document.getElementById('contrast-label').textContent = cntval+"%";

    var satval = document.getElementById('saturate-range').value;
    document.getElementById('saturate-label').textContent = satval+"%";

    var huval = document.getElementById('hue-rotate-range').value;
    document.getElementById('hue-rotate-label').textContent = huval+"deg";

    var gryval = document.getElementById('grayscale-range').value;
    document.getElementById('grayscale-label').textContent = gryval+"";

    var sepval = document.getElementById('sepia-range').value;
    document.getElementById('sepia-label').textContent = sepval+"";

    var cssval = ""
    +"brightness("+brval+"%) "
    +"contrast("+cntval+"%) "
    +"saturate("+satval+"%) "
    +"hue-rotate("+huval+"deg) "
    +"sepia("+sepval+") "
    +"grayscale("+gryval+")";

    if(resetflg)cssval = "";
    setTimeout(function(){
        document.getElementById('webviewv').style.webkitFilter = cssval;
        document.getElementById('webviewf').style.webkitFilter = cssval;
        document.getElementById('webviewb').style.webkitFilter = cssval;
        document.getElementById('webviewv').style.filter = cssval;
        document.getElementById('webviewf').style.filter = cssval;
        document.getElementById('webviewb').style.filter = cssval;
    },1);
    if(resetflg){
        chrome.storage.local.remove("_coloradjust");
    }else{
        var robj = {
            css:cssval,
            brval:brval,
            cntval:cntval,
            satval:satval,
            huval:huval,
            sepval:sepval,
            gryval:gryval
        };
        var obj = {};
        obj['_coloradjust'] = robj;
        chrome.storage.local.set(obj);
    }
}
function resetColor(){
    document.getElementById('brightness-range').value = 100;
    document.getElementById('contrast-range').value = 100;
    document.getElementById('saturate-range').value = 100;
    document.getElementById('hue-rotate-range').value = 0;
    document.getElementById('grayscale-range').value = 0;
    document.getElementById('sepia-range').value = 0;
    adjustColor(true);
}
var vimeo_o_k_e_n = null;
var vimeo_t_o_k_e_n = null;
function getVimeoCode(keywd,flg){
	if(vimeo_t_o_k_e_n)return;
    var redirectUrl = "https://jggnklnmaecfofafepejcjcjkcohgcfb.chromiumapp.org/provider_cb";
    var clientId = "99d222d6a3e31fbe0174743a084d9f50e07e6465";
    var authUrl = "https://api.vimeo.com/oauth/authorize?" +
        "client_id=" + clientId + "&" +"response_type=code&state=5555523458927&scope=public&" +
        "redirect_uri=" + encodeURIComponent(redirectUrl);
    if(!flg){
        chrome.identity.launchWebAuthFlow({url: authUrl, interactive: false},function(responseUrl) {
            if(!responseUrl){
                getVimeoCode(keywd,true);
                return;
            }
            var accessToken = responseUrl.split("code=")[1];
            vimeo_o_k_e_n = accessToken
            getVimeoToken(keywd);
        });
    }else{
        chrome.identity.launchWebAuthFlow({url: authUrl, interactive: true},function(responseUrl) {
            if(!responseUrl){
                vimeo_o_k_e_n = null;
                return;
            }
            var accessToken = responseUrl.split("code=")[1];
            vimeo_o_k_e_n = accessToken;
            getVimeoToken(keywd);
        });
    }
}
function getVimeoToken(keywd){
    var url = "https://api.vimeo.com/oauth/access_token";
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4){
            if(xhr.status == 200) {
                var txt = xhr.responseText;
                var json = JSON.parse(txt);
                storeVimeoToken(keywd,json.access_token)
            }
        }
    };
	var hd = base64encode("99d222d6a3e31fbe0174743a084d9f50e07e6465"+':'+"CiAYeJzuQX9H/CW7Fj0fi1P8LlsPVGNkXLITvqsQ7lXt3CH/z1ZyxxsSXCBUrm5x2qK6BpRUPWDOgX9ar8hOr3aESqtFAbOcaQGT+lRyzEwc4FP6jv9BiqZcSql2Z/0K");
	xhr.setRequestHeader("Authorization", "basic "+hd);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("grant_type=authorization_code&code="+vimeo_o_k_e_n+"&redirect_uri=https://jggnklnmaecfofafepejcjcjkcohgcfb.chromiumapp.org/provider_cb");
	function base64encode(s){
		var base64list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		var t = '', p = -6, a = 0, i = 0, v = 0, c;
		while ( (i < s.length) || (p > -6) ) {
			if ( p < 0 ) {
				if ( i < s.length ) {
					c = s.charCodeAt(i++);
					v += 8;
				} else {
					c = 0;
				}
				a = ((a&255)<<8)|(c&255);
				p += 8;
			}
			t += base64list.charAt( ( v > 0 )? (a>>p)&63 : 64 )
			p -= 6;
			v -= 6;
		}
		return t;
	}
}
function storeVimeoToken(keyword,token){
    var obj = {};
    obj['_vimeoToken'] = token;
    chrome.storage.local.set(obj);
    vimeo_t_o_k_e_n = token;
    if(keyword)ytObj(keyword);
}
function setStreamingSearch(){
    $("#yt-videos-container").empty();
    var ytcont = document.getElementById("youtube-serach-container");
    ytcont.style.display = "block";

    document.getElementById("youtube-serach-header").textContent = "Video Search";
    document.getElementById("shoutcast-container").style.display = "none";
    document.getElementById("live-search-container").style.display = "none";
    document.getElementById("normal-search-container").style.display = "inline-block";
    document.getElementById("youtube-live-search-input").disabled = false;
    resetTwitchSearch();

    if(document.getElementById("rdselectstream4").checked){
        setTwitchSearch();
        setfocus();
    }else if(document.getElementById("rdselectstream5").checked){
        document.getElementById("youtube-live-search-input").style.width = "";
        var stype = document.getElementById("youtube-live-search-type");
        stype.style.display = "inline-block";
        stype.selectedIndex = 0;
        document.getElementById("normal-search-container").style.display = "none";
        document.getElementById("live-search-container").style.display = "inline-block";
        setfocus(true);
    }else if(document.getElementById("rdselectstream6").checked){
        document.getElementById("youtube-live-search-input").style.width = "150px";
        document.getElementById("youtube-live-search-type").style.display = "none";
        document.getElementById("normal-search-container").style.display = "none";
        document.getElementById("live-search-container").style.display = "inline-block";
        setfocus(true);
    }else if(document.getElementById("rdselectstream1").checked){
        document.getElementById("youtube-search-type").style.display = "inline";
        document.getElementById("youtube-search-type").options[4].textContent = "playlist";
        document.getElementById("youtube-search-type").options[5].textContent = "channel";
        setfocus();
    }else if(document.getElementById("rdselectstream7").checked){
        document.getElementById("youtube-serach-header").textContent = "Background Music";
        document.getElementById("normal-search-container").style.display = "none";
        document.getElementById("live-search-container").style.display = "none";
        document.getElementById("shoutcast-container").style.display = "inline-block";
        stopShoutcast(true)
        setfocus();
    }else if(document.getElementById("rdselectstream8").checked){
        document.getElementById("youtube-search-type").style.display = "none";
        setfocus();
    }else{
        document.getElementById("youtube-search-type").style.display = "inline";
        document.getElementById("youtube-search-type").options[4].textContent = "";
        document.getElementById("youtube-search-type").options[5].textContent = "";
        setfocus();
    }
    function setfocus(flg){
        setTimeout(function(){
            ytcont.style.top = 0;
            if(flg){
                document.getElementById("youtube-live-search-input").focus();
            }else{
                document.getElementById("youtube-search-input").focus();
            }
        },30);
    }
}
function setTwitchSearch(){
    document.getElementById("youtube-search-type").style.display = "none";
    document.getElementById("twitch-search-type").style.display = "inline";
    document.getElementById("twitch-search-type").selectedIndex = 0;
}
function resetTwitchSearch(){
    document.getElementById("twitch-search-type").style.display = "none";
    document.getElementById("youtube-search-type").style.display = "inline";
}
function createLocalStorageList(){
    chrome.storage.local.get('_slot_1',function(sobj1){
	    chrome.storage.local.get('_slot_2',function(sobj2){
		    chrome.storage.local.get('_slot_3',function(sobj3){
		    	var obj1 = null,obj2 = null,obj3 = null,saveflg = false;
		    	var storagelist = [];
		    	if(sobj1['_slot_1']){
		    		saveflg = true;
	            	obj1 = JSON.parse(sobj1['_slot_1']);
	            	storagelist.push(createobj(obj1,"Temporary storage1"));
		    	}
		    	if(sobj2['_slot_2']){
		    		saveflg = true;
	            	obj2 = JSON.parse(sobj2['_slot_2']);
	            	storagelist.push(createobj(obj2,"Temporary storage2"));
		    	}
		    	if(sobj3['_slot_3']){
		    		saveflg = true;
	            	obj3 = JSON.parse(sobj3['_slot_3']);
	            	storagelist.push(createobj(obj3,"Temporary storage3"));
		    	}		    	
			    chrome.storage.local.get('_storage_area',function(slistobj){
			    	var ary = storagelist;
			    	if(slistobj["_storage_area"]){
			    		ary = ary.concat(slistobj["_storage_area"]);
			    	}
				    showStoragelist(ary);
				    if(saveflg){
					    chrome.storage.local.remove('_slot_1');
					    chrome.storage.local.remove('_slot_2');
					    chrome.storage.local.remove('_slot_3');			
				    	var sobj = {};
				    	sobj["_storage_area"] = ary;
					    chrome.storage.local.set(sobj);
				    }
			    });
		    });  
	    });  
    });  
    function createobj(list,name){
    	var obj = {};
    	obj.list = list;
    	obj.name = name;
    	return obj;
    }
}
function showStoragelist(list){
    var cont = document.getElementById('localstorage-item-container');
    $(cont).empty();
    for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        var li = document.createElement("li");
        cont.appendChild(li);
        li.setAttribute("class","playlist-item");
        li.addEventListener("click",clickItem,false);

        var close = document.createElement("span");
        li.appendChild(close);
        close.setAttribute("class","close-playlist-item");
        close.addEventListener("click",removeItem,true);

        li.appendChild(document.createTextNode(entry.name));
        li.setAttribute("id","storageitem"+i);
    };
    function clickItem(e){
	    document.getElementById("loadingModal").style.display = "block";
        document.getElementById('FileModal').style.display = "none";
    	var id = this.getAttribute("id").split("storageitem")[1];
    	var slist = list[id].list;
    	clearVideoArray();
        checkPlaylist(null,slist);
        setTimeout(function(){
        	document.getElementById("localstorage-close").click();
        },200);
    }
    function removeItem(e){
    	e.stopPropagation();
    	e.preventDefault();
    	var nlist = [];
    	var id = this.parentNode.getAttribute("id").split("storageitem")[1];
    	list[id] = null;
    	for (var i = 0; i < list.length; i++) {
    		var item = list[i];
    		if(!item)continue;
    		nlist.push(item);
    	};
    	var sobj = {};
    	sobj["_storage_area"] = nlist;
	    chrome.storage.local.set(sobj);
    	var pnode = this.parentNode;
      	pnode.style.opacity = 0;
      	setTimeout(function(){
	    	pnode.style.display = "none";
      	},100);
    }
}
function openTempStorage(no){
    document.getElementById("loadingModal").style.display = "block";
    chrome.storage.local.get('_slot_'+no,function(obj){
        if(obj['_slot_'+no]){
            var obj = JSON.parse(obj['_slot_'+no]);
            if(obj&&obj.length > 0){
                document.getElementById('FileModal').style.display = "none";
                checkPlaylist(null,obj);
                setTimeout(function(){
                    document.getElementById('playlist-close').click();
                },200);
                return;
            }            
        }
        document.getElementById("loadingModal").style.display = "none";
    });  
}
function showConfirm(){
    var modal = document.getElementById("confirmModal");
    modal.style.display = "block";
    setTimeout(function(){
	    modal.style.opacity = 1;
    },300);
}
function stopShoutcast(flg){
    var audio = document.getElementById("audio");
    if(audio){
        if(!flg)audio.pause();
        document.getElementById("shoutcastmain").selectedIndex = 0;
        document.getElementById("shoutcastsub").selectedIndex = 0;
        document.getElementById("radionomymain").selectedIndex = 0;
        document.getElementById("radionomysub").selectedIndex = 0;
    }
}
function clickFileModal(){
	setTimeout(function(){
	    document.getElementById('FileModal').style.display = "none";
	},250);
}
chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name === "auto-stop"){
        chrome.power.releaseKeepAwake();
        setTimeout(function(){
            chrome.app.window.current().close();;
        },500);
    }
});
function createCountrycode(){
    var prntnd = document.getElementById("youtube-live-ccode-type");
    for (var i = 0; i < COUNTRY2DIGIT.length; i++) {
        var item = COUNTRY2DIGIT[i];
        var obj = document.createElement("option");
        obj.text = item.Code;
        obj.value = item.Code;
        prntnd.add(obj);
    };
    chrome.storage.local.get("livecindex",function(obj){
        if(obj)prntnd.selectedIndex = obj.livecindex-0;
    });
}
function startYoutubeLiveSearch(val){
    $("#yt-videos-container").empty();
    ytObj(val);  
}
function checkSendURL(aitem,flg){
    var url = aitem.name;
    if(/^https?:\/\/www\.youtube\.com/.test(url)){
        checkURLEntry(url,flg);
    }else if(/^https?:\/\/www\.dailymotion\.com/.test(url)){
        checkURLEntry(url,flg);
    }else if(/^https?:\/\/www\.twitch\.tv/.test(url)){
        checkURLEntry(url,flg);
    }else if(/^https?:\/\/.*soundcloud\.com/.test(url)){
        checkURLEntry(url,flg);
    }else if(/^https?:\/\/vimeo\.com/.test(url)){
        checkURLEntry(url,flg);
    }else{
        var nurl = url.split("?")[0];
        var ftype = checkFileType(nurl,true);
        if(ftype){
            checkURLEntry(url);
        }else{
            showBrowserMode(true);
            var data = {
                type:"bookmark",
                url:url,
                tag:"object,embed,video,iframe,audio",
                width:640,
                height:360,
                elemid:""
            }
            CURRENTBROWSEURL = data;            
            setBrowserURL(data);
        }
    }
    setTimeout(function(){
        document.getElementById("loadingModal").style.display = "none";
    },1200);    
}
function showBrowserMode(flg){
    var webf = document.getElementById('webviewf');
    var webv = document.getElementById('webviewv');
    var webb = document.getElementById('webviewb');
    webb.parentNode.style.zIndex = 9;
	webf.contentWindow.postMessage({msg:"stopplayerf"},"*");
    webv.contentWindow.postMessage({msg:"stopplayerv"},"*");
    if(!flg){
    	webb.setAttribute("src","videojs/video-blank.html");
		setTimeout(function(){
	        webb.setAttribute("src","videojs/video-jsb.html")
		},300);  
    }
    var brws = document.getElementById("modal-awesome-browser2");
    brws.style.display = "inline-block";
    brws.style.color = "#f54997";
    document.getElementById('FileModal').style.display = "none";
    document.getElementById("modal-awesome-browser").style.color = "#f54997";
    document.querySelector(".modal-awesome-prevideo").style.display = "none";
    document.querySelector(".modal-awesome-nextvideo").style.display = "none"; 
    document.getElementById("modal-awesome-bookmarks").style.display = "inline-block";
    document.getElementById("modal-awesome-bookmarks2").style.display = "inline-block";
}
function hideBrowserMode(flg){
    var webb = document.getElementById('webviewb');
    webb.parentNode.style.zIndex = 0;
    if(!flg){
    	webb.setAttribute("src","videojs/video-blank.html"); 
    }
    var brws = document.getElementById("modal-awesome-browser2");
    brws.style.display = "none";
    brws.style.color = "";
    document.getElementById("modal-awesome-browser").style.color = "";
    document.querySelector(".modal-awesome-prevideo").style.display = "inline-block";
    document.querySelector(".modal-awesome-nextvideo").style.display = "inline-block"; 
    document.getElementById("modal-awesome-bookmarks2").style.display = "none";
}
function showBookmarkMode(flg){
	var ary = [];
    chrome.storage.local.get('_bkitem',function(obj){
        if(obj['_bkitem']){
        	ary = obj['_bkitem'];
        	getItem()
        }
    });
    function getItem(){
	    var cont = document.getElementById('bookmark-item-container');
	    $(cont).empty();
		createElements();
        function createElements(){
            for (var i = 0; i < ary.length; i++) {
                createElement(ary[i],cont,i);
            }
        }
	}
    function createElement(entry,cont,i){
        if(entry.type === "remove")return;
        var li = document.createElement("li");
        cont.appendChild(li);
        li.setAttribute("class","playlist-item");
        li.setAttribute("data-url",entry.url);
        li.setAttribute("data-title",entry.title);
        li.addEventListener("click",clickItem,false);
        li.index = i;

        var close = document.createElement("span");
        li.appendChild(close);
        close.setAttribute("class","close-playlist-item");
        close.addEventListener("click",removeItem,true);

        li.appendChild(document.createTextNode(entry.url));
    }
    function clickItem(e){
    	var item = ary[this.index];
      	if(item){
      		hideBookmarkMode();
			var data = {
				type:"browserurl",
				url:item.url,
				tag:item.tag,
				width:item.width,
				height:item.height,
				elemid:""
			}
            data.type = "bookmark";
            CURRENTBROWSEURL = data;			
            setBrowserURL(data)
	    }
    }
    function removeItem(e){
    	e.stopPropagation();
    	e.preventDefault();
    	var pnode = this.parentNode;
    	var index = pnode.index;
    	var item = ary[index];
      	if(item){
	    	item.type = "remove";
	      	pnode.style.opacity = 0;
	      	setTimeout(function(){
		    	pnode.style.display = "none";
	      	},100);
	      	var nary = [];
	      	for (var i = 0; i < ary.length; i++) {
	      		if(ary[i].type === "remove")continue;
	      		nary.push(ary[i]);
	      	};
	      	var obj = {};
	      	obj['_bkitem'] = nary;
        	chrome.storage.local.set(obj);
      	}
    }
    document.getElementById('BookmarkModal').style.display = "block";
}
function hideBookmarkMode(){
    document.getElementById('BookmarkModal').style.display = "none";
}
function showFrameButton(){
	var frrm = document.getElementById("framevisible-button");
	frrm.style.opacity = 1;
	clearTimeout(SHOWFRAMETIMERID);
	SHOWFRAMETIMERID = setTimeout(function(){
		frrm.style.opacity = 0.00001;
	},1200);
}
function clickFrameItem(e){
	if(this.classList.contains("modal-awesome-frame")){
		document.getElementById("framevisible-button").style.display = "inline-block";
		showFrameButton();
		chrome.app.window.current().restore();
		PREVENTRESZEEVENT = true;
		setTimeout(function(){
			resizeWindow(null,true,true);
			PREVENTRESZEEVENT = false;
		},200)
	}else if(this.classList.contains("modal-awesome-bookmarks")){
        showBookmarkMode();
	}else if(this.classList.contains("modal-awesome-browser")){
		CURRENTBROWSEURL = null;
        document.getElementById('settingsModal').style.display = "none";
		showBrowserMode()
	}else if(this.classList.contains("modal-awesome-pin")){
        var crntw = chrome.app.window.current();
        if(crntw.isAlwaysOnTop()){ 	
        	this.classList.remove("alwaysontop")
            crntw.setAlwaysOnTop(false);
            chrome.storage.local.remove('_alwaysontop');
        }else{
        	this.classList.add("alwaysontop")
            crntw.setAlwaysOnTop(true);
            chrome.storage.local.set({'_alwaysontop':"on"});
        }
	}else if(this.classList.contains("modal-awesome-close")){
		chrome.app.window.current().close();
	}else if(this.classList.contains("modal-awesome-minus")){
		chrome.app.window.current().minimize();
    }else if(this.classList.contains("modal-awesome-blank")){
        if(this.classList.contains("alwaysontop")){
            this.classList.remove("alwaysontop");
            chrome.power.releaseKeepAwake();
        }else{
            this.classList.add("alwaysontop");
            chrome.power.requestKeepAwake("display");
        }
	}else if(this.classList.contains("modal-awesome-max")){
    	document.getElementById("framevisible-button").style.display = "none";
        var crntw = chrome.app.window.current();
        if(crntw.isMaximized() || crntw.isFullscreen()){
            crntw.restore();
        }else{
            crntw.maximize();
        }
    }else if(this.classList.contains("modal-awesome-full")){
        setFullScreen();
	}
}
function addFrameEvent(classname,event){
	var items = document.getElementsByClassName(classname);
	for (var i = 0; i < items.length; i++) {
		items[i].addEventListener("click",event,true);
	};
}
function resizeWindow(e,hideframe,force){
	if(!force&&PREVENTRESZEEVENT)return;
	var wh = window.innerHeight;
    var webviewv = document.getElementById('webviewv');
    var webviewf = document.getElementById('webviewf');
    var webviewb = document.getElementById('webviewb');

    var frmmdl = document.getElementById('FileModal');
    var cfrm = document.getElementById('custom-frame');
    var cfrmmf = document.getElementById('custom-modal-frame');

    webviewv.style.width = window.innerWidth+"px";
    webviewf.style.width = window.innerWidth+"px";
    webviewb.style.width = window.innerWidth+"px";

    if(hideframe){
    	webviewv.parentNode.style.top = 0;
    	webviewf.parentNode.style.top = 0;
        webviewb.parentNode.style.top = 0;

    	cfrmmf.style.display = "none";
    	cfrm.style.display = "none";

	    webviewv.style.height = wh+"px";
        webviewf.style.height = wh+"px";
        webviewb.style.height = wh+"px";

	    if(frmmdl.style.display !== "none"){
	    	var bwh = parseInt((wh-24)/4,10);
	    	document.getElementById('file-modal-item').style.height = bwh+"px";
	    	document.getElementById('dir-modal-item').style.height = bwh+"px";
	    	document.getElementById('url-modal-item').style.height = bwh+"px";
	    	document.getElementById('plist-modal-item').style.height = bwh+"px";
		    document.getElementById('localstorage-modal-item').style.height = bwh+"px";
	    	frmmdl.style.top = 0;
	    }
    }else{
    	webviewv.parentNode.style.top = "26px";
    	webviewf.parentNode.style.top = "26px";
        webviewb.parentNode.style.top = "26px";

    	cfrmmf.style.display = "block";
    	cfrm.style.display = "block";

	    webviewv.style.height = wh-26+"px";
        webviewf.style.height = wh-26+"px";
        webviewb.style.height = wh-26+"px";

	    if(frmmdl.style.display !== "none"){
	    	var bwh = parseInt((wh-58)/4,10);
	    	document.getElementById('file-modal-item').style.height = bwh+"px";
	    	document.getElementById('dir-modal-item').style.height = bwh+"px";
	    	document.getElementById('url-modal-item').style.height = bwh+"px";
	    	document.getElementById('plist-modal-item').style.height = bwh+"px";
		    document.getElementById('localstorage-modal-item').style.height = bwh+"px";
	    	frmmdl.style.top = "26px";
	    }
	}
}
function setFullScreen(){
    var crntw = chrome.app.window.current();
    if(crntw.isMaximized() || crntw.isFullscreen()){
    	document.getElementById("framevisible-button").style.display = "none";
        crntw.restore();
        setTimeout(function(){
        	PREVENTRESZEEVENT = false;
	        resizeWindow(null,false);
        },300);
	}else{
        crntw.fullscreen();
        setTimeout(function(){
        	PREVENTRESZEEVENT = false;
            resizeWindow(null,true);
        },300);
	}
}
function clearVideoArray(){
    VIDEOINDEX = -1;
    VIDEO_FILE_ENTRYS = [];
    VIDEO_INDEX_ARRAY = [];
}
function __dropLocalFile(e){
    var fentry = e.dataTransfer.items[0].webkitGetAsEntry();
    if (fentry.isFile) {
	    if(/\.(mfppl)$/i.test(fentry.name)) {
			document.getElementById("loadingModal").style.display = "block";
		    document.getElementById('FileModal').style.display = "none";
	    	clearVideoArray();
	    	checkPlaylist(fentry);
        }else{
	        var fileEntries = [];
			document.getElementById("loadingModal").style.display = "block";
		    document.getElementById('FileModal').style.display = "none";
	        fileEntries.push(fentry);
	        checkFileEntry(fileEntries);
        }
    }else{
		document.getElementById("loadingModal").style.display = "block";
	    document.getElementById('FileModal').style.display = "none";
        onInitFs(fentry);
    }
}
function __openfile(){
    chrome.fileSystem.chooseEntry({
        type:"openFile",
        accepts:[{
            mimeTypes: ["video/*","audio/*"],
            extensions: ["flv","f4v"]
        }],
        acceptsMultiple: true
    },function(fileEntries){
    	if(fileEntries&&fileEntries.length > 0){     
            document.getElementById('FileModal').style.display = "none";
			document.getElementById("loadingModal").style.display = "block";
			checkFileEntry(fileEntries);
    	}
    });
}
function __openfolder(){
    chrome.fileSystem.chooseEntry({
        type:"openDirectory"
    },function(fileEntries){
    	if(fileEntries){
	        document.getElementById('FileModal').style.display = "none";
			document.getElementById("loadingModal").style.display = "block";
	        onInitFs(fileEntries);
    	}
    });
}
function __openURL(){
	var modal = document.getElementById("URLModal");
	modal.style.display = "block";
	setTimeout(function(){
		modal.style.opacity = 1;
		document.getElementById("url-input").focus();
	},10);
}
function __openCharsetfile(){
    chrome.fileSystem.chooseEntry({
        type:"openFile",
        acceptsMultiple: false
    },function(fileEntries){
        if(fileEntries&&fileEntries.length > 0){ 
            var charset = document.getElementById("char-set-select").value;
            fileEntries[0].file(function(file){
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    var shiftjis = new TextDecoder(charset)
                    var dectxt = shiftjis.decode(this.result); 
                    if(PLAYERMODE === "html5"){
                        var webv = document.getElementById('webviewv');
                        webv.contentWindow.postMessage({msg:"sendsrttxt",txt:dectxt},"*");
                    }else{
                        var webf = document.getElementById('webviewf');
                        webf.contentWindow.postMessage({msg:"sendsrttxt",txt:dectxt},"*");
                    }
                };
                reader.readAsArrayBuffer(file);
            })
        }
    });
}
function onInitFs(fs) {
    var dirReader = fs.createReader();
    var entries = [];
    var cmp = function(a, b) {
        return a.name.localeCompare(b.name);
    };
    var readEntries = function() {
        dirReader.readEntries (function(results) {
            if (!results.length) {
				setTimeout(function(){
					document.getElementById("loadingModal").style.display = "none";
				},1000);
                listResults(entries.sort(cmp));
            } else {
                entries = entries.concat(toArray(results));
                readEntries();
            }
        });
    };
    readEntries();
    function toArray(list) {
        return Array.prototype.slice.call(list || [], 0);
    }
    function listResults(entries) {
        var list = [];
        for (var i = 0; i < entries.length; i++) {
            var item = entries[i];
            if(item.isFile){
                list.push(item);
            }
        };
        checkFileEntry(list,true);
    }
}
function checkURLEntry(url,ytflg){
	var flg = false;
    if(/^https?:\/\/www\.youtube\.com/.test(url)){
		if(checkItem(url))return;
		if(url.indexOf("://www.youtube.com/playlist?list=") > -1){
			var plid = url.split("://www.youtube.com/playlist?list=")[1].split("&")[0];
			var crntidx = 0;
			if(VIDEOINDEX > 0)crntidx = VIDEOINDEX;
			getPlaylistItem(plid,crntidx,50);
		}else if(url.indexOf("://www.youtube.com/watch?v=") > -1 && url.indexOf("&list=") > -1){
			var plid = url.split("&list=")[1].split("&")[0];
			var wid = url.split("://www.youtube.com/watch?v=")[1].split("&")[0];
			var crntidx = 0;
			if(VIDEOINDEX > 0)crntidx = VIDEOINDEX;
			getPlaylistItem(plid,crntidx,50,wid);
		}else{
	    	setItem("youtube");
		}
    }else if(/^https?:\/\/www\.dailymotion\.com/.test(url)){
    	setItem("dailymotion");
    }else if(/^https?:\/\/.*\.twitch\.tv/.test(url)){
        setItem("twitch");
    }else if(/^https?:\/\/.*soundcloud\.com/.test(url)){
    	setItem("soundcloud");
    }else if(/^https?:\/\/vimeo\.com/.test(url)){
    	setItem("vimeo");
    }else if(/^https?:\/\//.test(url) || /^rtmp:\/\//.test(url) ){
        setItem("url");
	}
	if(flg)document.getElementById('FileModal').style.display = "none"; 

	function setItem(itype){
        if(checkItem(url))return;
        var item = {};
        item.name = url;
        item.type = itype;
        VIDEO_INDEX_ARRAY.push(VIDEO_FILE_ENTRYS.length+"");
        VIDEO_FILE_ENTRYS.push(item);
        flg = true;
        if(!ytflg){
            VIDEOINDEX = VIDEO_FILE_ENTRYS.length-1;
            onchoseentry();
        }
	}
	function checkItem(url){
		var flg = false;
		for (var i = 0; i < VIDEO_FILE_ENTRYS.length; i++) {
			if(VIDEO_FILE_ENTRYS[i].name === url){
				flg = true;
			}
		};
		return flg;
	}
	function getPlaylistItem(plid,cindx,total,wid,pageToken){
		if(pageToken){
			var youtubeURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=AIzaSyB8eKqS9JnaY21419s6soH4We7IWVoHz4Y&playlistId='+plid+'&maxResults=50&pageToken='+pageToken
		}else{
			var youtubeURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=AIzaSyB8eKqS9JnaY21419s6soH4We7IWVoHz4Y&playlistId='+plid+'&maxResults=50';
		}
        var l = new XMLHttpRequest();
        l.open("GET", youtubeURL, true);
        l.onreadystatechange = function (){
            if ((l.readyState == 4) && (l.status == 200)){
                var resp = JSON.parse(l.responseText);
                if(resp){
                	var ncindx = -1;
                	for (var i = 0; i < resp.items.length; i++) {
                		var item = resp.items[i];
                		var vurl = item.snippet.resourceId.videoId;
					    var item = {};
					    if(wid == vurl)ncindx = i+total-50;
					    item.name = "https://www.youtube.com/watch?v="+vurl;
					    item.type = "youtube";
					    VIDEO_INDEX_ARRAY.push(VIDEO_FILE_ENTRYS.length+"");
					    VIDEO_FILE_ENTRYS.push(item);
                	};
                	if(resp.nextPageToken&&total < resp.pageInfo.totalResults-0){
                		total += 50;
                		setTimeout(function(){
	                		getPlaylistItem(plid,cindx,total,wid,resp.nextPageToken)
                		},300);
                	}else{
				        document.getElementById('FileModal').style.display = "none"; 
					    if(ncindx > -1){
					    	VIDEOINDEX = ncindx;
					    }else{
					    	if(VIDEOINDEX > 0){
					    		return;
					    	}else{
							    VIDEOINDEX = 0;
					    	}
					    }
				    	onchoseentry();
				    }
                }
            }
        };
        l.send(null);
	}
}
function checkFileEntry(fileEntries,strict){
	var flg = false;
    for (var i = 0; i < fileEntries.length; i++) {
        var item = fileEntries[i];
        if(item.type === "youtube" || item.type === "dailymotion" || item.type === "twitch" ||item.type === "soundcloud" || item.type === "vimeo" || item.type === "url"){
            VIDEO_INDEX_ARRAY.push(VIDEO_FILE_ENTRYS.length+"");
            VIDEO_FILE_ENTRYS.push(item);
		    flg = true;
        }else if(checkFileType(item.name,strict)){
            VIDEO_INDEX_ARRAY.push(VIDEO_FILE_ENTRYS.length+"");
            VIDEO_FILE_ENTRYS.push(item);
		    flg = true;
	    }
    };
    if(flg)VIDEOINDEX++;
	setTimeout(function(){
		document.getElementById("loadingModal").style.display = "none";
	},1000);
    onchoseentry();
}
function addClass(){
    removeSelectClass();
    var elem = document.getElementById("vitem"+VIDEO_INDEX_ARRAY[VIDEOINDEX]);
    if(elem)elem.classList.add("playlist-select-item");
}
function showPlaylist(){
    document.getElementById('PlaylistModal').style.display = "block";
    var cont = document.getElementById('playlist-item-container');
    $(cont).empty();
    for (var i = 0; i < VIDEO_FILE_ENTRYS.length; i++) {
        var entry = VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[i]];
        if(entry.type === "remove")continue;
        var li = document.createElement("li");
        cont.appendChild(li);
        li.setAttribute("class","playlist-item");
        li.addEventListener("click",clickItem,false);
        var close = document.createElement("span");
        li.appendChild(close);
        close.setAttribute("class","close-playlist-item");
        close.addEventListener("click",removeItem,true);
        li.appendChild(document.createTextNode(entry.name));
        li.setAttribute("id","vitem"+VIDEO_INDEX_ARRAY[i]);
        if(VIDEOINDEX === i)li.classList.add("playlist-select-item");
    };
    function clickItem(e){
    	var id = this.getAttribute("id").split("vitem")[1];
    	var idx = VIDEO_INDEX_ARRAY.indexOf(id);
      	if(idx > -1){
    		removeSelectClass();
    		this.classList.add("playlist-select-item");
	        VIDEOINDEX = idx;
	        onchoseentry();
	        document.getElementById('PlaylistModal').style.display = "none";
	    }
    }
    function removeItem(e){
    	e.stopPropagation();
    	e.preventDefault();
    	var pnode = this.parentNode;
    	var id = pnode.getAttribute("id").split("vitem")[1];
    	var idx = VIDEO_INDEX_ARRAY.indexOf(id);
      	if(idx > -1){
	    	var file = VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[idx]];
	    	file.type = "remove";
      	}
      	pnode.style.opacity = 0;
      	setTimeout(function(){
	    	pnode.style.display = "none";
      	},100);
    }
}
function createPlaylist(e,flg){
	var list = [];
	for (var i = 0; i < VIDEO_INDEX_ARRAY.length; i++) {
		var idx = VIDEO_INDEX_ARRAY[i];
		var item = VIDEO_FILE_ENTRYS[idx];
		if(item.type === "remove")continue;
		if(item.type === "llv")continue;
		if(item.type === "youtube" || item.type === "dailymotion" || item.type === "twitch" || item.type === "soundcloud" || item.type === "vimeo" || item.type === "url"){
			list.push(item.name);
		}else{
			var fid = chrome.fileSystem.retainEntry(item);
			list.push(fid);
		}
	};
	if(list.length < 1)return;
    var strs = JSON.stringify(list);
    if(flg){
        return strs;
    }else{
        saveSettingText(strs)
        return;
    }
}
function saveSettingText(text) {
	var blob = new Blob([text], {'type': 'text/plain'});
	chrome.fileSystem.chooseEntry({'type': 'saveFile',suggestedName:"MP4F_playlist.mfppl"}, function(fileEntry) {
		if(fileEntry){
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.onwriteend = function(e) {
                    fileWriter.onwriteend = function () {};
                    fileWriter.truncate(blob.size);
				};
				fileWriter.onerror = function(e) {};
				fileWriter.write(blob);
			});
		}
	});
}
function loadPlaylist(){
    chrome.fileSystem.chooseEntry({
        type:"openFile",
        accepts:[{
            extensions: ["mfppl"]
        }],
        acceptsMultiple: false
    },function(fileEntries){
    	if(fileEntries&&fileEntries.length > 0){
		    document.getElementById('FileModal').style.display = "none";
		    document.getElementById("loadingModal").style.display = "block";
    		checkPlaylist(fileEntries[0]);
    	}
    });
}
function checkPlaylist(fileEntrie,objflg){
    if(objflg){
        checkItem(objflg,0,[]);
        return;
    }
	fileEntrie.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
			var txt = this.result;
			if(txt){
				var ary = JSON.parse(txt);
				if(Array.isArray(ary)&&ary.length > 0)checkItem(ary,0,[]);
			}
		};
		reader.readAsText(file);
	});
	function checkItem(ary,fidx,itemlist){
		var item = ary[fidx];
		if(!item){
			setTimeout(function(){
				document.getElementById("loadingModal").style.display = "none";
			},1000);
    		clearVideoArray();  
			checkFileEntry(itemlist)
		}else{
            if(/^https?:\/\/www\.youtube\.com/.test(item)){
            	setItem("youtube");
            }else if(/^https?:\/\/www\.dailymotion\.com/.test(item)){
            	setItem("dailymotion");
            }else if(/^https?:\/\/www\.twitch\.tv/.test(item)){
            	setItem("twitch");
            }else if(/^https?:\/\/.*soundcloud\.com/.test(item)){
            	setItem("soundcloud");
            }else if(/^https?:\/\/vimeo\.com/.test(item)){
            	setItem("vimeo");
            }else if(/^https?:\/\//.test(item) || /^rtmp:\/\//.test(item)){
            	setItem("url");
			}else{
				chrome.fileSystem.restoreEntry(item, function (isRestorable){
					if(isRestorable){
						chrome.fileSystem.restoreEntry(item, function (fileEntry){
							itemlist.push(fileEntry);
							fidx++;
							checkItem(ary,fidx,itemlist)
						});
					}else{
						fidx++;
						checkItem(ary,fidx,itemlist)
					}
				});
			}
		}
		function setItem(type){
            var fitem = {};
            fitem.name = item;
            fitem.type = type;
            itemlist.push(fitem);
            fidx++;
            checkItem(ary,fidx,itemlist);
		}
	}
}
function removeSelectClass(){
	var items = document.body.querySelectorAll(".playlist-select-item");
	for (var i = 0; i < items.length; i++) {
		items[i].classList.remove("playlist-select-item");
	};
}
function gglObj(){
    var suggestindex = -1;
    var suggestitem = 0;
    var srchboxtmp = document.getElementById("youtube-search-input"),srchboxtmp2 = document.getElementById("youtube-live-search-input");
    var chkmode = function(){
	    if(document.getElementById("rdselectstream6").checked || document.getElementById("rdselectstream5").checked){
	    	return true;
	    }else{
	    	return false;
	    }
	};
    var setEvent = function (){
        srchboxtmp.addEventListener("keyup", keyAction, false);
        srchboxtmp.addEventListener("blur", hiddenSuggestBox, false);
        srchboxtmp2.addEventListener("keyup", keyAction, false);
        srchboxtmp2.addEventListener("blur", hiddenSuggestBox, false);

        var suggestdivbox = document.createElement("div");
        document.body.appendChild(suggestdivbox);
        suggestdivbox.setAttribute("id","suggestdivboxid");
        suggestdivbox.style.display = 'none';
        suggestdivbox.setAttribute("class", "fd");      
        document.getElementById("youtube-search-button").addEventListener("click", clickStartButton, false);
        document.getElementById("youtube-live-search-button").addEventListener("click", clickStartButton, false);
    };
    var clickStartButton = function(){
    	if(chkmode()){
	        srchboxtmp2.focus();
	        if (suggestindex != -1)srchboxtmp2.value = document.getElementById("sjstwd" + suggestindex).textContent;
	        startSearch(srchboxtmp2.value);
    	}else{
	        srchboxtmp.focus();
	        if (suggestindex != -1)srchboxtmp.value = document.getElementById("sjstwd" + suggestindex).textContent;
	        startSearch(srchboxtmp.value);
	    }
    };
    var getData = function (searchvalue){
        if(searchvalue){
            var googlesgst = 'https://suggestqueries.google.com/complete/search?ds=yt&client=chrome&q='+ searchvalue;
            var l = new XMLHttpRequest();
            l.open("GET", googlesgst, true);
            l.onreadystatechange = function (){
                if ((l.readyState == 4) && (l.status == 200)){
                    addItem(l.responseText,0);
                }
            };
            l.send(null);
        }else{
            hiddenSuggestBox();
        }        
    };
    var addItem = function(responselist,mode){
        var suggestdivbox = document.getElementById("suggestdivboxid");
        if(mode == 0){
            var resstrary = JSON.parse(responselist);
            var list = resstrary[1];
        }else{
            var list = responselist;
        }
        $(suggestdivbox).empty();
        suggestindex = -1;
        suggestitem = list.length;
        if (suggestitem > 10)suggestitem = 10;
        for (var i = 0; i < suggestitem; i++){
            var row = document.createElement("div");
            suggestdivbox.appendChild(row);
            row.textContent = list[i];
            row.setAttribute("id", "sjstwd" + i);
            row.setAttribute("class", "sjstwd");
            row.index = i;
            row.addEventListener("mouseover",mouseOverAction, false);
            row.addEventListener("mouseout",mouseOutAction, false);
            row.addEventListener("mousedown",mouseDownAction, false);
        }
        if (suggestitem <= 0) {
            suggestdivbox.style.display = 'none';
        }else {
            suggestdivbox.style.display = 'block';
            if(chkmode()){
	            var x = srchboxtmp2.offsetLeft;
	            var y = srchboxtmp2.offsetTop+srchboxtmp2.offsetHeight;  
	            var w = srchboxtmp2.clientWidth;
            }else{
	            var x = srchboxtmp.offsetLeft;
	            var y = srchboxtmp.offsetTop+srchboxtmp.offsetHeight;  
	            var w = srchboxtmp.clientWidth;
	        }
            suggestdivbox.style.width = w + "px";
            suggestdivbox.style.left = x + "px";
            suggestdivbox.style.top = y + "px";
        }
    };
    var mouseOverAction = function(e){
        var rrow = e.currentTarget;
        if (suggestindex != -1)document.getElementById("sjstwd" + suggestindex).setAttribute("class", "sjstwd");
        rrow.setAttribute("class", "sjstwd selected");
        suggestindex = rrow.index;
    };
    var mouseOutAction = function(e){
        if (suggestindex != -1)document.getElementById("sjstwd" + suggestindex).setAttribute("class", "sjstwd");
        suggestindex = -1;
    };
    var mouseDownAction = function(e){
        var rrow = e.currentTarget;
        if(chkmode()){
	        srchboxtmp2.value = rrow.textContent;
	        startSearch(srchboxtmp2.value);
        }else{
	        srchboxtmp.value = rrow.textContent;
	        startSearch(srchboxtmp.value);
        }
    };
    var keyAction = function (e){
        var keyCode = e.keyCode;
        if (keyCode == 13){
        	var val = "";
            if (suggestindex != -1){            	
            	val = document.getElementById("sjstwd" + suggestindex).textContent;
            	if(chkmode()){
	            	srchboxtmp2.value = val;
            	}else{
	            	srchboxtmp.value = val;
            	}
            }
            if(chkmode()){
	            startSearch(srchboxtmp2.value);
            }else{
	            startSearch(srchboxtmp.value);
            }
        }else if ((keyCode == 38) || (keyCode == 40)) {
            if (suggestitem > 0){
                if (suggestindex != -1)document.getElementById("sjstwd" + suggestindex).setAttribute("class", "sjstwd");
                if (keyCode == 38){
                    suggestindex--;
                    if (suggestindex < 0)suggestindex = suggestitem - 1;
                }else{
                    suggestindex++;
                    if (suggestindex >= suggestitem)suggestindex = 0;
                }
                document.getElementById("sjstwd" + suggestindex).setAttribute("class", "sjstwd selected");
                if(chkmode()){
	                srchboxtmp2.value = document.getElementById("sjstwd" + suggestindex).textContent;
                }else{
	                srchboxtmp.value = document.getElementById("sjstwd" + suggestindex).textContent;
                }
            }
        }else{
        	if(chkmode()){
	            getData(srchboxtmp2.value);
        	}else{
	            getData(srchboxtmp.value);
        	}
        }   
    };
    var startSearch = function (srcvalue){
        srcvalue = srcvalue.replace(/^\s+|\s+$/g, "");
        if(chkmode()){
	        startYoutubeLiveSearch(srcvalue);
        }else if (srcvalue){
            removeThumb();
            ytObj(srcvalue);
        }
    };
    var removeThumb = function (){
        $("#yt-videos-container").empty();
    };
    var hiddenSuggestBox = function (){
        var suggestdivbox = document.getElementById("suggestdivboxid");
        suggestindex = -1;
        suggestitem = 0;
        $(suggestdivbox).empty();
        suggestdivbox.style.display = 'none';
    };
    setEvent();
}
function ytObj(currentkeywd,nextflg,sval){
    var playnumber = [],playtitle = [],playthumb = [],playduration = [];
    var twitchvideoflag = false;
    var ytchannelflag = false;

    var startSearch = function (evnt,curl){
    	if(document.getElementById("rdselectstream1").checked){
            var yttyp = document.getElementById("youtube-search-type");
            var sval = yttyp.options[yttyp.selectedIndex].value;
            var ytopt = "";
            var youtubeURL='https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyB8eKqS9JnaY21419s6soH4We7IWVoHz4Y&safeSearch=none&maxResults=50';
            if(document.getElementById("youtube-search-input").value.indexOf("channel:id:") === 0){
                var crntwsplt = document.getElementById("youtube-search-input").value.split("channel:id:");
                currentkeywd = ""
                ytopt = "&channelId="+crntwsplt[1];
            }
            if(currentkeywd)ytopt+= "&q="+encodeURIComponent(currentkeywd);
            if(curl){
                youtubeURL = curl;
            }else if(sval === "playlist"){
                ytopt+="&type=playlist";
            }else if(sval === "channel"){
                ytopt+="&type=channel";
            }else{
                if(sval)ytopt += "&videoDuration="+sval;
                ytopt+="&type=video&videoEmbeddable=true";
            }
            var ytsearchkey = youtubeURL+ytopt;
            ytchannelflag = false;

	        if(nextflg&&nextpagetoken)ytsearchkey += "&pageToken="+nextpagetoken;
	        var l = new XMLHttpRequest();
	        l.open("GET", ytsearchkey, true);
	        l.onreadystatechange = function (){
	            if ((l.readyState == 4) && (l.status == 200)){
	                var resp = JSON.parse(l.responseText);
	                if(resp&&resp.items&&resp.items.length > 0){
	                    playnumber.length = 0;
	                    playtitle.length = 0;
	                    playthumb.length = 0;
	                    playduration.length = 0;
	                    nextpagetoken = resp.nextPageToken;
                        if(curl){
                            setPlayData(resp);
                        }else if(sval === "playlist"){
                            setPlayData(resp,"playlist");
                        }else if(sval === "channel"){
                            setPlayData(resp,"channel");
                        }else{
                            setPlayData(resp);
                        }
	                }
	            }
	        };
	        l.send(null);
    	}else if(document.getElementById("rdselectstream2").checked){
            var yttyp = document.getElementById("youtube-search-type");
            var sval = yttyp.options[yttyp.selectedIndex].value;
            if(sval === "playlist")sval = "";                    
            if(sval === "short"){
                sval = "&longer_than="+0+"&shorter_than="+4;
            }else if(sval === "medium"){
                sval = "&longer_than="+4+"&shorter_than="+20;
            }else if(sval === "long"){
                sval = "&longer_than="+20;
            }else{
                sval = "";                    
            }
	        var youtubeURL='https://api.dailymotion.com/videos?fields=allow_embed,description%2Ctitle%2Cduration%2Cthumbnail_60_url%2Curl%2C&search=';
	        var ytsearchkey = youtubeURL+encodeURIComponent(currentkeywd)+sval+'&sort=relevance&limit=50';
	        var l = new XMLHttpRequest();
	        l.open("GET", ytsearchkey, true);
	        l.onreadystatechange = function (){
	            if ((l.readyState == 4) && (l.status == 200)){
	                var resp = JSON.parse(l.responseText);
	                if(resp&&resp.list&&resp.list.length > 0){
	                    playnumber.length = 0;
	                    playtitle.length = 0;
	                    playthumb.length = 0;
	                    playduration.length = 0;
	                    setDailyPlayData(resp);
	                }
	            }
	        };
	        l.send(null);
        }else if(document.getElementById("rdselectstream3").checked){
            var yttyp = document.getElementById("youtube-search-type");
            var sval = yttyp.options[yttyp.selectedIndex].value;
            if(sval === "playlist")sval = "";
            var youtubeURL='https://api.soundcloud.com/tracks.json?client_id=c965dd6c8d2aa9a3db58775abf0ca835&q=';
            if(sval === "short"){
                sval = "&duration[from]="+0+"&duration[to]="+(4*1000*60);
            }else if(sval === "medium"){
                sval = "&duration[from]="+(4*1000*60)+"&duration[to]="+(20*1000*60);
            }else if(sval === "long"){
                sval = "&duration[from]="+(20*1000*60)+"&duration[to]="+(720*1000*60);
            }else{
                sval = "";
            }
            var ytsearchkey = youtubeURL+encodeURIComponent(currentkeywd)+sval+'&limit=50&embeddable_by=all';
            var l = new XMLHttpRequest();
            l.open("GET", ytsearchkey, true);
            l.onreadystatechange = function (){
                if ((l.readyState == 4) && (l.status == 200)){
                    var resp = JSON.parse(l.responseText);
                    if(resp&&resp.length > 0){
                        playnumber.length = 0;
                        playtitle.length = 0;
                        playthumb.length = 0;
                        playduration.length = 0;
                        setSoundPlayData(resp);
                    }
                }
            };
            l.send(null);
        }else if(document.getElementById("rdselectstream4").checked){
            var stype = "live";
            if(twitchvideoflag){
                twitchvideoflag = false;
                stype = "video";
                var ytsearchkey = "https://api.twitch.tv/kraken/channels/"+encodeURIComponent(currentkeywd)+"/videos?limit=100";
            }else if(document.getElementById("twitch-search-type").selectedIndex === 1){
                stype = "game";
                var ytsearchkey = "https://api.twitch.tv/kraken/search/games?q="+encodeURIComponent(currentkeywd)+'&type=suggest&limit=100';
            }else if(document.getElementById("twitch-search-type").selectedIndex === 2){
                stype = "top";
                var ytsearchkey = "https://api.twitch.tv/kraken/games/top?limit=100";
            }else if(document.getElementById("twitch-search-type").selectedIndex === 3){
                stype = "video";
                var ytsearchkey = "https://api.twitch.tv/kraken/videos/top?limit=100";
            }else if(document.getElementById("twitch-search-type").selectedIndex === 4){
                stype = "channel";
                var ytsearchkey = "https://api.twitch.tv/kraken/search/channels?q="+encodeURIComponent(currentkeywd)+'&limit=100';
            }else if(document.getElementById("twitch-search-type").selectedIndex === 5){
                stype = "featured";
                var ytsearchkey = "https://api.twitch.tv/kraken/streams/featured?limit=100";
            }else{
                var ytsearchkey = "https://api.twitch.tv/kraken/search/streams?q="+encodeURIComponent(currentkeywd)+'&limit=100';
            }
            var l = new XMLHttpRequest();
            l.open("GET", ytsearchkey, true);
            l.onreadystatechange = function (){
                if ((l.readyState == 4) && (l.status == 200)){
                    var resp = JSON.parse(l.responseText);
                    playnumber.length = 0;
                    playtitle.length = 0;
                    playthumb.length = 0;
                    playduration.length = 0;

                    if(stype === "channel"){
                        setChannelTwitchData(resp);
                    }else if(stype === "game"){
                        setGameTwitchData(resp)
                    }else if(stype === "top"){
                        setTopTwitchData(resp);
                    }else if(stype === "video"){
                        setVideoTwitchData(resp)
                    }else if(stype === "featured"){
                        setFeaturedTwitchData(resp)
                    }else if(resp&&resp.streams.length > 0){
                        setTwitchData(resp);
                    }
                }
            };
			l.setRequestHeader("Client-ID","3ki1n57fk2as0gnwfot9q6u7yospyg5");
            l.send(null);
        }else if(document.getElementById("rdselectstream5").checked){
            var yttyp = document.getElementById("youtube-live-search-type");
            var sval = yttyp.options[yttyp.selectedIndex].value;
            var rcode = "";
            if(sval === "Search"){
                sval = document.getElementById("youtube-live-search-input").value;
                if(!sval)return;
            }
            var ccode = document.getElementById("youtube-live-ccode-type").value;
            if(ccode)rcode = "&regionCode="+ccode;
            var ytsearchkey = "https://www.googleapis.com/youtube/v3/search?eventType=live&videoEmbeddable=true&part=snippet&q="+encodeURIComponent(sval)+"&videoEmbeddable=true&type=video&safeSearch=none";
            ytsearchkey += rcode+"&maxResults=50&key=AIzaSyB8eKqS9JnaY21419s6soH4We7IWVoHz4Y";
            var l = new XMLHttpRequest();
            l.open("GET", ytsearchkey, true);
            l.onreadystatechange = function (){
                if ((l.readyState == 4) && (l.status == 200)){
                    var resp = JSON.parse(l.responseText);
                    if(resp&&resp.items&&resp.items.length > 0){
                        playnumber.length = 0;
                        playtitle.length = 0;
                        playthumb.length = 0;
                        playduration.length = 0;
                        nextpagetoken = "";
                        setLiveData(resp);
                    }
                }
            };
            l.send(null);
        }else if(document.getElementById("rdselectstream6").checked){
            var sval = document.getElementById("youtube-live-search-input").value;
            var slelem = document.getElementById("youtube-live-ccode-type");
            var cc = slelem.options[slelem.selectedIndex].value;
            if(!cc)cc = "US";
            var ytsearchkey = "https://itunes.apple.com/search?term="+encodeURIComponent(sval)+"&version=2&country="+cc+"&media=podcast&limit=100&entity=podcast";
            var l = new XMLHttpRequest();
            l.open("GET", ytsearchkey, true);
            l.onreadystatechange = function (){
                if ((l.readyState == 4) && (l.status == 200)){
                    playnumber.length = 0;
                    playtitle.length = 0;
                    playthumb.length = 0;
                    playduration.length = 0;                	
                    var resp = JSON.parse(l.responseText);
                    getAPLXML(resp)
                }
            };
            l.send(null);
        }else if(document.getElementById("rdselectstream8").checked){
			if(!vimeo_t_o_k_e_n){
				getVimeoCode(currentkeywd);
				return;
			}
		    var url = "https://api.vimeo.com/videos?per_page=50&query="+currentkeywd+"&access_token="+vimeo_t_o_k_e_n;
		    var xhr = new XMLHttpRequest();
		    xhr.open('GET', url, true);
		    xhr.onreadystatechange = function() {
		        if(xhr.readyState == 4){
		            if(xhr.status == 200) {
                        playnumber.length = 0;
                        playtitle.length = 0;
                        playthumb.length = 0;
                        playduration.length = 0;
		                var txt = xhr.responseText;
		                var json = JSON.parse(txt);
		                setVimeoData(json);
		            }else if(xhr.status == 401){
		            	vimeo_t_o_k_e_n = null;
		            	chrome.storage.local.remove("_vimeoToken");
		            	getVimeoCode();
		            }
		        }
		    };
		    xhr.send();
        }else if(document.getElementById("rdselectstream7").checked){
            if(document.getElementById("castradioselect").selectedIndex === 1){
                if(currentkeywd){
                    var selval = document.getElementById("radionomymain").value
                    removeSubGenres("radionomysub"); 
                    if(document.getElementById("radionomysub").selectedIndex === 0)return;
                    setSubGenres(true);
                }else{
                    if(document.getElementById("radionomysub").selectedIndex == 0){
                        var selval = document.getElementById("radionomymain").value
                    }else if(document.getElementById("radionomysub").selectedIndex > 0){         
                        var selval = document.getElementById("radionomysub").value
                    }
                }
                var xhr = new XMLHttpRequest();
                xhr.open('GET', "http://www.radionomy.com"+selval, true);
                xhr.onreadystatechange = function() {
                    if(xhr.readyState == 4){
                        if(xhr.status == 200) {
                            var txt = xhr.responseText;
                            var parser = new DOMParser();
                            var html = parser.parseFromString(txt, "text/html");
                            var items = html.querySelectorAll(".browseRadioWrap");
                            setRadionomyList(items);
                        }
                    }
                };
                xhr.send(null);
            }else{
                if(currentkeywd){
                    var selval = document.getElementById("shoutcastmain").value.split("/Genre?name=")[1];
                    removeSubGenres("shoutcastsub"); 
                    if(document.getElementById("shoutcastsub").selectedIndex === 0)return;
                    setSubGenres();
                }else{
                    if(document.getElementById("shoutcastsub").selectedIndex == 0){
                        var selval = document.getElementById("shoutcastmain").value.split("/Genre?name=")[1];
                    }else if(document.getElementById("shoutcastsub").selectedIndex > 0){         
                        var selval = document.getElementById("shoutcastsub").value.split("/Genre?name=")[1];
                    }
                }
                if(selval === "RB and Urban")selval = encodeURIComponent("R&B and Urban");
                var xhr = new XMLHttpRequest();
                xhr.open('POST', "http://www.shoutcast.com/Home/BrowseByGenre", true);
                xhr.onreadystatechange = function() {
                    if(xhr.readyState == 4 && xhr.status == 200)setShoutcastList(JSON.parse(xhr.responseText));
                };
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                xhr.send("genrename="+selval);
            }
	    }
    };
    var setRadionomyList = function(nodelist){
        $("#yt-videos-container").empty();
        for(var i=0; i<nodelist.length; i++){
            var a = nodelist[i].querySelector("a");
            var liststr = a.getAttribute("href").split("/radio/")[1];
            var titlestr = nodelist[i].querySelector("p.radioName").textContent;
            var img = a.querySelector("img");
            if(img)img = img.src;
            playthumb[i] = img;
            playtitle[i] = titlestr;
            playduration[i] = "";
            playnumber[i] = liststr
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);       
    };
    var setShoutcastList = function(nodelist){
        $("#yt-videos-container").empty();
        for(var i=0; i<nodelist.length; i++){
            var item = nodelist[i];
            playthumb[i] = "";
            playtitle[i] = item.Name;
            playduration[i] = item.CurrentTrack;
            playnumber[i] = item.ID;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);       
    };
    var createSubGenres = function(cont,optv,optt){
        var elOptNew = document.createElement("option");
        elOptNew.text = optt;
        elOptNew.value = optv;
        cont.add(elOptNew);
    };
    var removeSubGenres = function(name){
        document.getElementById(name).length=0;
    };
    var getAPLXML = function(responsec){
        $("#yt-videos-container").empty();
        var reslen = responsec.results.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.results[i];
            playthumb[i] = item.artworkUrl30;
            playtitle[i] = item.trackName;
            playduration[i] = item.primaryGenreName;
            playnumber[i] = item.feedUrl;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setLiveData = function(responsec){
        var reslen = responsec.items.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.items[i];
            playthumb[i] = item.snippet.thumbnails.default.url;
            playtitle[i] = item.snippet.title;
            playduration[i] = item.snippet.description;
            playnumber[i] = "https://www.youtube.com/watch?v="+item.id.videoId;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setVimeoData = function(responsec){
        var reslen = responsec.data.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.data[i];
            if(item.embed&&item.embed.html){
	            if(item.pictures&&item.pictures.sizes&&item.pictures.sizes.length > 0){
		            playthumb[i] = item.pictures.sizes[0].link;
	            }else{
		            playthumb[i] = null;
	            }
	            playtitle[i] = item.name;
	            var videotime = parseInt(item.duration,10);
	            var stime = videotime % 60;
	            if (videotime > 59){
	                var mtime = (videotime -stime) / 60;
	            }else{
	                var mtime = 0;
	            }
	            if (stime < 10)stime = "0"+stime;
	            if (mtime < 10)mtime = "0"+mtime;
	            playduration[i] = mtime+":"+stime;
	            playnumber[i] = "https://vimeo.com/"+item.uri.split("/videos/")[1];
	        }
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setTwitchData = function(responsec){
        var reslen = responsec.streams.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.streams[i];
            playthumb[i] = item.preview.small;
            playtitle[i] = item.channel.display_name;
            playduration[i] = item.channel.game;
            playnumber[i] = item.channel.url+"/embed";
            if(item.channel.status)playduration[i]+=": "+item.channel.status
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setTopTwitchData = function(responsec){
        var reslen = responsec.top.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.top[i];
            playthumb[i] = item.game.box.medium;
            playtitle[i] = item.game.name;
            playduration[i] = item.viewers+" viewers";
            playnumber[i] = ">__twitch_game_name_"+item.game.name;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setGameTwitchData = function(responsec){
        var reslen = responsec.games.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.games[i];
            playthumb[i] = item.box.medium;
            playtitle[i] = item.name;
            playduration[i] = "popularity: "+item.popularity;
            playnumber[i] = ">__twitch_game_searchname_"+item.name;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setChannelTwitchData = function(responsec){
        var reslen = responsec.channels.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.channels[i];
            playthumb[i] = item.logo;
            playtitle[i] = item.name;
            playduration[i] = item.followers+" followers";
            playnumber[i] = ">__twitch_game_channel_"+item.name;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setFeaturedTwitchData = function(responsec){
        var reslen = responsec.featured.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.featured[i];
            playthumb[i] = item.image;
            playtitle[i] = item.title;
            playduration[i] = item.stream.game;
            playnumber[i] = item.stream.channel.url;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setVideoTwitchData = function(responsec){
        var reslen = responsec.videos.length;
        for(var i=0; i < reslen;i++){
            var item = responsec.videos[i];
            playthumb[i] = item.preview;
            playtitle[i] = item.title;
            playduration[i] = item.description;
            playnumber[i] = "http://player.twitch.tv/?video="+item._id;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration);
    };
    var setPlayData = function (responsec,type){
        var reslen = responsec.items.length;
        var vidary = [];
        for(var i=0; i < reslen;i++){
            var item = responsec.items[i];
            playthumb[i] = item.snippet.thumbnails.default.url;
            playtitle[i] = item.snippet.title;
            playduration[i] = item.snippet.description;
            if(type === "playlist"){
                playnumber[i] = "https://www.youtube.com/playlist?list="+item.id.playlistId;
            }else if(type === "channel"){
                playnumber[i] =item.id.channelId;
            }else{
                vidary[i] = item.id.videoId;
                playnumber[i] = "https://www.youtube.com/watch?v="+item.id.videoId;
            }
        }
        if(type === "playlist"){
            playlistObj(playnumber,playtitle,playthumb,playduration);
        }else if(type === "channel"){
            playlistObj(playnumber,playtitle,playthumb,playduration);
        }else{
            getDuration(playnumber,playtitle,playthumb,playduration,vidary);
        }
    };
    var setDailyPlayData = function (responsec){
        var reslen = responsec.list.length;
        var vidary = [];
        for(var i=0; i < reslen;i++){
            var item = responsec.list[i];
            playthumb[i] = item.thumbnail_60_url;
            playtitle[i] = item.title;
            var videotime = item.duration;
            var stime = videotime % 60;
            if (videotime > 59){
                var mtime = (videotime -stime) / 60;
            }else{
                var mtime = 0;
            }
            if (stime < 10)stime = "0"+stime;
            if (mtime < 10)mtime = "0"+mtime;
            var thdrtn = mtime+":"+stime;
            playduration[i] = thdrtn;
            vidary[i] = item.id;
            playnumber[i] = item.url;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration)
    };
    var setSoundPlayData = function (responsec){
        var reslen = responsec.length;
        var vidary = [];
        var purchases = [];
        for(var i=0; i < reslen;i++){
            var item = responsec[i];
            playthumb[i] = item.artwork_url;
            playtitle[i] = item.title;
            var videotime = parseInt(item.duration/1000,10);
            var stime = videotime % 60;
            if (videotime > 59){
                var mtime = (videotime -stime) / 60;
            }else{
                var mtime = 0;
            }
            if (stime < 10)stime = "0"+stime;
            if (mtime < 10)mtime = "0"+mtime;
            var thdrtn = mtime+":"+stime;
            playduration[i] = thdrtn;
            vidary[i] = item.id;
            playnumber[i] = item.uri;
            purchases[i] = item.purchase_url;
        }
        playlistObj(playnumber,playtitle,playthumb,playduration,purchases)
    };
    var getDuration = function(ytlistplidary,playtitle,playthumb,playduration,vidary){
        if(vidary.length > 0){
            var arystr = vidary.join(',');
            var youtubeURL='https://www.googleapis.com/youtube/v3/videos?id='+arystr+'&key=AIzaSyB8eKqS9JnaY21419s6soH4We7IWVoHz4Y&part=contentDetails';
            var l = new XMLHttpRequest();
            l.open("GET", youtubeURL, true);
            l.onreadystatechange = function (){
                if ((l.readyState == 4) && (l.status == 200)){
                    var resp = JSON.parse(l.responseText);
                    if(resp){
                        var durs = [];
                        for (var i = 0; i < resp.items.length; i++) {
                            if(resp.items[i]&&resp.items[i].contentDetails&&resp.items[i].contentDetails.duration){
                                var item = resp.items[i].contentDetails.duration;
                                item = item.toLowerCase();
                                item = item.replace("pt","");
                            }else{
                                var item = "";
                            }
                            durs.push(item);
                        };
                        playlistObj(ytlistplidary,playtitle,playthumb,durs);
                    }
                }
            };
            l.send(null);
        }
    };
    var revokeImageURL = function(){
        for (var i = 0; i < IMAGEURLS.length; i++) {
            URL.revokeObjectURL(IMAGEURLS[i]);
        };
        IMAGEURLS.length = 0;
    };
    var playlistObj = function (ytvideourlary,ytvideottlary,ytvideothumbary,ytvideodrtnary,purchases,podflg){
        var thubdivtmp = document.getElementById("yt-videos-container");
        $("#yt-videos-container").empty();
        revokeImageURL();

        for(var i=0;i < ytvideourlary.length;i++){
            var titlediv = document.createElement("div");
            thubdivtmp.appendChild(titlediv);
            titlediv.setAttribute("class", "saveplaylistnumber");
            titlediv.index = i;
            titlediv.setAttribute("data-url", ytvideourlary[i]);
            if(podflg){
	            titlediv.addEventListener("mousedown",clickPodcastItem,false);
            }else{
	            titlediv.addEventListener("mousedown",clickItem,false);
            }

            var imgtmp = document.createElement("img");
            titlediv.appendChild(imgtmp);
            loadimg(imgtmp,ytvideothumbary[i]);
            imgtmp.setAttribute("class","ytthumbimg");
            
            var inlinediv = document.createElement('div');
            titlediv.appendChild(inlinediv);
            inlinediv.style.display = "inline-block";
            inlinediv.style.paddingLeft = "8px";

            var h3 = document.createElement('h3');
            inlinediv.appendChild(h3);

            h3.appendChild(document.createTextNode(ytvideottlary[i]));
            h3.setAttribute("title",ytvideottlary[i])
            inlinediv.appendChild(document.createTextNode(ytvideodrtnary[i]));

            if(purchases&&purchases[i]){
                var purchase = document.createElement('div');
                inlinediv.appendChild(purchase);
                purchase.setAttribute("class","purchaseitem");
                purchase.appendChild(document.createTextNode(purchases[i]));
                purchase.addEventListener("mousedown",clickPurchaseItem,true);
                purchase.setAttribute("data-url",purchases[i]);
            }
        }
    };
    var clickPurchaseItem = function(e){
        e.stopPropagation();
        e.preventDefault();
        var url = this.getAttribute("data-url");
        window.open(url)
    };
    var loadimg = function(img,url){
    	if(!url)return;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            var url = window.URL.createObjectURL(this.response);
            img.src = url;
            IMAGEURLS.push(url);
        };
        xhr.send();
    };
    var clickItem = function(e){
        var that = this;
        if(document.getElementById("rdselectstream6").checked){
        	parseUserXML(this.getAttribute("data-url"));
        }else if(document.getElementById("rdselectstream7").checked){
            this.style.background = "orange";
            setTimeout(function(){
                that.style.background = "";
            },350);
            getStreamUrl(this.getAttribute("data-url"));
        }else if(document.getElementById("rdselectstream4").checked){
            var dataurl = this.getAttribute("data-url");
            if(dataurl.indexOf(">__twitch_game_name_") === 0){
                $("#yt-videos-container").empty();
                document.getElementById("twitch-search-type").selectedIndex = 0;
                currentkeywd = dataurl.split(">__twitch_game_name_")[1];
                document.getElementById("youtube-search-input").value = currentkeywd;
                startSearch();
            }else if(dataurl.indexOf(">__twitch_game_searchname_") === 0){
                $("#yt-videos-container").empty();
                document.getElementById("twitch-search-type").selectedIndex = 0;
                currentkeywd = dataurl.split(">__twitch_game_searchname_")[1];
                document.getElementById("youtube-search-input").value = currentkeywd;
                startSearch();
            }else if(dataurl.indexOf(">__twitch_game_channel_") === 0){
                twitchvideoflag = true;
                $("#yt-videos-container").empty();
                currentkeywd = dataurl.split(">__twitch_game_channel_")[1];
                startSearch();
            }else{
                this.style.background = "orange";
                if(!VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[VIDEOINDEX]]){
                    checkURLEntry(this.getAttribute("data-url"));
                }else{
                    checkURLEntry(this.getAttribute("data-url"),true);
                }
                setTimeout(function(){
                    that.style.background = "";
                },350);
            }
        }else{
            if(document.getElementById("rdselectstream1").checked&&document.getElementById("youtube-search-type").value === "channel"){
                ytchannelflag = true;
                document.getElementById("youtube-search-type").selectedIndex = 0;
                document.getElementById("youtube-search-input").value = "channel:id:"+this.getAttribute("data-url");
                startSearch();
            }else{
    	        this.style.background = "orange";
    	        if(!VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[VIDEOINDEX]]){
    		        checkURLEntry(this.getAttribute("data-url"));
    	        }else{
    		        checkURLEntry(this.getAttribute("data-url"),true);
    	        }
    	        setTimeout(function(){
    	            that.style.background = "";
    	        },350);
            }
	    }
    };
    var getStreamUrl = function(station){ 
        if(document.getElementById("castradioselect").selectedIndex === 1){
            var sid = station;
            sid = sid.split("/index")[0];
            playCastMusic("http://listen.radionomy.com/"+sid);
        }else{
            var xhr = new XMLHttpRequest();
            var rurl = "http://www.shoutcast.com/Player/GetStreamUrl";
            xhr.open('POST', rurl, true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4){
                    if(xhr.status == 200) {
                        var sid = JSON.parse(xhr.responseText);
                        playCastMusic(sid);
                    }
                }
            };
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhr.send("station="+station);
        }
    };
    var playCastMusic = function(sid){
        var audio = document.getElementById("audio");
        if(!audio){
            audio = document.createElement("audio");
            audio.setAttribute("id","audio");
            audio.volume = 0.3;
            document.body.appendChild(audio);
            chrome.storage.local.get('shoutcastvolume',function(obj){
                if(obj['shoutcastvolume'])audio.volume = (obj['shoutcastvolume']-0)/100;
            });    
        }
        audio.addEventListener('canplay', function(){
            this.play();
        }, true);
        audio.src = sid
    };
    var parseUserXML = function(url){
        var l = new XMLHttpRequest();
        l.open("GET", url, true);
        l.onreadystatechange = function (){
            if(l.readyState == 4){
		        $("#yt-videos-container").empty();
                playnumber.length = 0;
                playtitle.length = 0;
                playthumb.length = 0;
                playduration.length = 0;   	        
            	if(l.status == 200){       		
		            var xml = l.responseXML;
		            var items = xml.querySelectorAll("item");
		            var spn = document.createElement("span");
		            if(!items)return;
			        var reslen = items.length;
			        for(var i=0; i < reslen;i++){
			            var item = items[i];
			            if(!item.querySelector("enclosure"))continue;
			            var timg = item.querySelector("thumbnail");
			            if(timg){
				            playthumb[i] = timg.getAttribute("url");
			            }else{
			            	playthumb[i] = null;
			            }
			            playtitle[i] = getattr(item,"title","title");
			            spn.innerHTML = getattr(item,"description","description");
			            playduration[i] = spn.textContent;
			            playnumber[i] = item.querySelector("enclosure").getAttribute("url");
			        }
			        spn = null;
			        playlistObj(playnumber,playtitle,playthumb,playduration,null,true);
			    }
            }
        };
        l.send(null);
        function getattr(item,q1,q2){
        	var elem = item.querySelector(q1);
        	if(!elem)elem = item.querySelector(q2);
        	if(!elem)return "";
        	return elem.textContent;
        }
    };
    var clickPodcastItem = function(e){
        var that = this;
        this.style.background = "orange";
        if(!VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[VIDEOINDEX]]){
	        checkURLEntry(this.getAttribute("data-url"));
        }else{
	        checkURLEntry(this.getAttribute("data-url"),true);
        }
        setTimeout(function(){
            that.style.background = "";
        },350);
    };
    var setSubGenres = function(radionomy){
        if(radionomy){
            var cont = document.getElementById("radionomysub");
            var idx = document.getElementById("radionomymain").selectedIndex;
            createSubGenres(cont,"","");

            if(idx == 1){
            }else if(idx == 2){
                createSubGenres(cont,"/en/style/Blues/Acoustic%20Blues" ,"Acoustic Blues");
                createSubGenres(cont,"/en/style/Blues/Blues" ,"Blues");
                createSubGenres(cont,"/en/style/Blues/Boogie%20-%20Woogie" ,"Boogie - Woogie");
                createSubGenres(cont,"/en/style/Blues/Classic%20Blues" ,"Classic Blues");
                createSubGenres(cont,"/en/style/Blues/Country%20Blues" ,"Country Blues");
                createSubGenres(cont,"/en/style/Blues/Delta%20Blues" ,"Delta Blues");
                createSubGenres(cont,"/en/style/Blues/Electric%20Blues" ,"Electric Blues");
            }else if(idx == 3){
                createSubGenres(cont,"/en/style/Chill-out/Ambient" ,"Ambient");
                createSubGenres(cont,"/en/style/Chill-out/Chill-out" ,"Chill-out");
                createSubGenres(cont,"/en/style/Chill-out/Downtempo" ,"Downtempo");
                createSubGenres(cont,"/en/style/Chill-out/Easy%20Listening" ,"Easy Listening");
                createSubGenres(cont,"/en/style/Chill-out/Lounge" ,"Lounge");
                createSubGenres(cont,"/en/style/Chill-out/New%20Age" ,"New Age");
                createSubGenres(cont,"/en/style/Chill-out/Nu%20Jazz" ,"Nu Jazz");
                createSubGenres(cont,"/en/style/Chill-out/Trip-hop" ,"Trip-hop");
            }else if(idx == 4){
                createSubGenres(cont,"/en/style/Classic/Baroque" ,"Baroque");
                createSubGenres(cont,"/en/style/Classic/Chamber" ,"Chamber");
                createSubGenres(cont,"/en/style/Classic/Classic" ,"Classic");
                createSubGenres(cont,"/en/style/Classic/Opera" ,"Opera");
                createSubGenres(cont,"/en/style/Classic/Symphony" ,"Symphony");
            }else if(idx == 5){
                createSubGenres(cont,"/en/style/Country/Bluegrass" ,"Bluegrass");
                createSubGenres(cont,"/en/style/Country/Country" ,"Country");
                createSubGenres(cont,"/en/style/Country/Country%20Pop" ,"Country Pop");
                createSubGenres(cont,"/en/style/Country/Country%20Rock" ,"Country Rock");
                createSubGenres(cont,"/en/style/Country/Honky%20Tonk" ,"Honky Tonk");
                createSubGenres(cont,"/en/style/Country/Outlaw%20Country" ,"Outlaw Country");
                createSubGenres(cont,"/en/style/Country/Rockabilly" ,"Rockabilly");
            }else if(idx == 6){
                createSubGenres(cont,"/en/style/Electronic/2-step" ,"2-step");
                createSubGenres(cont,"/en/style/Electronic/Breakbeat" ,"Breakbeat");
                createSubGenres(cont,"/en/style/Electronic/Breakcore" ,"Breakcore");
                createSubGenres(cont,"/en/style/Electronic/Chip%20Tune" ,"Chip Tune");
                createSubGenres(cont,"/en/style/Electronic/Dance%20-%20Clubbing" ,"Dance - Clubbing");
                createSubGenres(cont,"/en/style/Electronic/Drone%20Music" ,"Drone Music");
                createSubGenres(cont,"/en/style/Electronic/Dubstep" ,"Dubstep");
                createSubGenres(cont,"/en/style/Electronic/Electro" ,"Electro");
                createSubGenres(cont,"/en/style/Electronic/Electronic" ,"Electronic");
                createSubGenres(cont,"/en/style/Electronic/Electronica" ,"Electronica");
                createSubGenres(cont,"/en/style/Electronic/Goa%20Trance" ,"Goa Trance");
                createSubGenres(cont,"/en/style/Electronic/Hardcore%20-%20Hard%20Dance" ,"Hardcore - Hard Dance");
                createSubGenres(cont,"/en/style/Electronic/House" ,"House");
                createSubGenres(cont,"/en/style/Electronic/Industrial" ,"Industrial");
                createSubGenres(cont,"/en/style/Electronic/Jungle%20-%20Drum'n'bass" ,"Jungle - Drum'n'bass");
                createSubGenres(cont,"/en/style/Electronic/Minimal" ,"Minimal");
                createSubGenres(cont,"/en/style/Electronic/Nu%20Rave" ,"Nu Rave");
                createSubGenres(cont,"/en/style/Electronic/Techno" ,"Techno");
                createSubGenres(cont,"/en/style/Electronic/Trance" ,"Trance");
                createSubGenres(cont,"/en/style/Electronic/UK%20Garage(UKG)" ,"UK Garage(UKG)");
            }else if(idx == 7){
                createSubGenres(cont,"/en/style/Hits/Hits" ,"Hits");
                createSubGenres(cont,"/en/style/Hits/Hits%2060's" ,"Hits 60's");
                createSubGenres(cont,"/en/style/Hits/Hits%2070's" ,"Hits 70's");
                createSubGenres(cont,"/en/style/Hits/Hits%2080's" ,"Hits 80's");
                createSubGenres(cont,"/en/style/Hits/Hits%2090's" ,"Hits 90's");
                createSubGenres(cont,"/en/style/Hits/Hits%20FR" ,"Hits FR");
                createSubGenres(cont,"/en/style/Hits/Hits%20UK" ,"Hits UK");
                createSubGenres(cont,"/en/style/Hits/Hits%20USA" ,"Hits USA");
                createSubGenres(cont,"/en/style/Hits/Oldies" ,"Oldies");
                createSubGenres(cont,"/en/style/Hits/Top%20Charts" ,"Top Charts");
            }else if(idx == 8){
                createSubGenres(cont,"/en/style/Jazz/Acid%20Jazz" ,"Acid Jazz");
                createSubGenres(cont,"/en/style/Jazz/Bebop" ,"Bebop");
                createSubGenres(cont,"/en/style/Jazz/Classic%20Jazz" ,"Classic Jazz");
                createSubGenres(cont,"/en/style/Jazz/Free%20Jazz" ,"Free Jazz");
                createSubGenres(cont,"/en/style/Jazz/Jazz" ,"Jazz");
                createSubGenres(cont,"/en/style/Jazz/Jazz%20Rock" ,"Jazz Rock");
                createSubGenres(cont,"/en/style/Jazz/Smooth%20Jazz" ,"Smooth Jazz");
                createSubGenres(cont,"/en/style/Jazz/Swing" ,"Swing");
            }else if(idx == 9){
                createSubGenres(cont,"/en/style/Latin/Flamenco" ,"Flamenco");
                createSubGenres(cont,"/en/style/Latin/Habanera" ,"Habanera");
                createSubGenres(cont,"/en/style/Latin/Kumbia" ,"Kumbia");
                createSubGenres(cont,"/en/style/Latin/Latin" ,"Latin");
                createSubGenres(cont,"/en/style/Latin/Latin%20Dance" ,"Latin Dance");
                createSubGenres(cont,"/en/style/Latin/Latin%20Jazz" ,"Latin Jazz");
                createSubGenres(cont,"/en/style/Latin/Latin%20Pop" ,"Latin Pop");
                createSubGenres(cont,"/en/style/Latin/Latin%20Rock" ,"Latin Rock");
                createSubGenres(cont,"/en/style/Latin/Mariachi" ,"Mariachi");
                createSubGenres(cont,"/en/style/Latin/Merenge" ,"Merenge");
                createSubGenres(cont,"/en/style/Latin/Reggaeton" ,"Reggaeton");
                createSubGenres(cont,"/en/style/Latin/Salsa" ,"Salsa");
                createSubGenres(cont,"/en/style/Latin/Samba" ,"Samba");
                createSubGenres(cont,"/en/style/Latin/Tango" ,"Tango");
            }else if(idx == 10){
                createSubGenres(cont,"/en/style/Metal/Black%20Metal" ,"Black Metal");
                createSubGenres(cont,"/en/style/Metal/Death%20Metal" ,"Death Metal");
                createSubGenres(cont,"/en/style/Metal/Gothic%20Metal" ,"Gothic Metal");
                createSubGenres(cont,"/en/style/Metal/Heavy%20Metal" ,"Heavy Metal");
                createSubGenres(cont,"/en/style/Metal/Industrial%20Metal" ,"Industrial Metal");
                createSubGenres(cont,"/en/style/Metal/Metal" ,"Metal");
                createSubGenres(cont,"/en/style/Metal/Metalcore" ,"Metalcore");
                createSubGenres(cont,"/en/style/Metal/Nu%20Metal" ,"Nu Metal");
                createSubGenres(cont,"/en/style/Metal/Progressive%20Metal" ,"Progressive Metal");
                createSubGenres(cont,"/en/style/Metal/Trash%20Metal" ,"Trash Metal");
            }else if(idx == 11){
                createSubGenres(cont,"/en/style/News%20-%20Talk/Arts%20-%20Entertainment" ,"Arts - Entertainment");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Business" ,"Business");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Comedy" ,"Comedy");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Health" ,"Health");
                createSubGenres(cont,"/en/style/News%20-%20Talk/News" ,"News");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Politics" ,"Politics");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Religion%20-%20Spirituality" ,"Religion - Spirituality");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Sports" ,"Sports");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Talk" ,"Talk");
                createSubGenres(cont,"/en/style/News%20-%20Talk/Weather" ,"Weather");
            }else if(idx == 12){
                createSubGenres(cont,"/en/style/Pop-Rock/Britpop" ,"Britpop");
                createSubGenres(cont,"/en/style/Pop-Rock/Celtic%20Rock" ,"Celtic Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Christian%20Rock" ,"Christian Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Classic%20Rock" ,"Classic Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Coldwave" ,"Coldwave");
                createSubGenres(cont,"/en/style/Pop-Rock/Dance%20Rock" ,"Dance Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Emo" ,"Emo");
                createSubGenres(cont,"/en/style/Pop-Rock/Experimental%20Rock" ,"Experimental Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Folk" ,"Folk");
                createSubGenres(cont,"/en/style/Pop-Rock/Folktronica" ,"Folktronica");
                createSubGenres(cont,"/en/style/Pop-Rock/Garage%20Rock" ,"Garage Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Glam%20Rock" ,"Glam Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Gothic%20Rock" ,"Gothic Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Grunge" ,"Grunge");
                createSubGenres(cont,"/en/style/Pop-Rock/Hard%20Rock" ,"Hard Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Indie" ,"Indie");
                createSubGenres(cont,"/en/style/Pop-Rock/Industrial%20Rock" ,"Industrial Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Instrumental%20Rock" ,"Instrumental Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Kraut-Rock" ,"Kraut-Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/New%20Wave" ,"New Wave");
                createSubGenres(cont,"/en/style/Pop-Rock/Noisy" ,"Noisy");
                createSubGenres(cont,"/en/style/Pop-Rock/Pop" ,"Pop");
                createSubGenres(cont,"/en/style/Pop-Rock/Pop%20Rock" ,"Pop Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Post-rock" ,"Post-rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Power%20Pop" ,"Power Pop");
                createSubGenres(cont,"/en/style/Pop-Rock/Progressive%20Rock" ,"Progressive Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Psychedelic" ,"Psychedelic");
                createSubGenres(cont,"/en/style/Pop-Rock/Psychobilly" ,"Psychobilly");
                createSubGenres(cont,"/en/style/Pop-Rock/Punk" ,"Punk");
                createSubGenres(cont,"/en/style/Pop-Rock/Rock" ,"Rock");
                createSubGenres(cont,"/en/style/Pop-Rock/Rock'n'Roll" ,"Rock'n'Roll");
                createSubGenres(cont,"/en/style/Pop-Rock/Shoegazing" ,"Shoegazing");
                createSubGenres(cont,"/en/style/Pop-Rock/Ska" ,"Ska");
                createSubGenres(cont,"/en/style/Pop-Rock/Southern%20Rock" ,"Southern Rock");
            }else if(idx == 13){
                createSubGenres(cont,"/en/style/Reggae/Dancehall" ,"Dancehall");
                createSubGenres(cont,"/en/style/Reggae/Dub" ,"Dub");
                createSubGenres(cont,"/en/style/Reggae/Pop%20-%20Reggae" ,"Pop - Reggae");
                createSubGenres(cont,"/en/style/Reggae/Ragga" ,"Ragga");
                createSubGenres(cont,"/en/style/Reggae/Reggae" ,"Reggae");
                createSubGenres(cont,"/en/style/Reggae/Roots%20Reggae" ,"Roots Reggae");
            }else if(idx == 14){
                createSubGenres(cont,"/en/style/Urban/Dirty%20South" ,"Dirty South");
                createSubGenres(cont,"/en/style/Urban/Disco" ,"Disco");
                createSubGenres(cont,"/en/style/Urban/Dub" ,"Dub");
                createSubGenres(cont,"/en/style/Urban/Freestyle" ,"Freestyle");
                createSubGenres(cont,"/en/style/Urban/Funk" ,"Funk");
                createSubGenres(cont,"/en/style/Urban/Gangsta%20Rap" ,"Gangsta Rap");
                createSubGenres(cont,"/en/style/Urban/Gospel" ,"Gospel");
                createSubGenres(cont,"/en/style/Urban/Hip-Hop" ,"Hip-Hop");
                createSubGenres(cont,"/en/style/Urban/Motown" ,"Motown");
                createSubGenres(cont,"/en/style/Urban/New%20Soul" ,"New Soul");
                createSubGenres(cont,"/en/style/Urban/R'n'B" ,"R'n'B");
                createSubGenres(cont,"/en/style/Urban/Rap" ,"Rap");
                createSubGenres(cont,"/en/style/Urban/Rythm'n'Blues" ,"Rythm'n'Blues");
                createSubGenres(cont,"/en/style/Urban/Soul" ,"Soul");
                createSubGenres(cont,"/en/style/Urban/Urban" ,"Urban");
            }else if(idx == 15){
                createSubGenres(cont,"/en/style/Various/Children's%20-%20Family" ,"Children's - Family");
                createSubGenres(cont,"/en/style/Various/Christian" ,"Christian");
                createSubGenres(cont,"/en/style/Various/Christmas" ,"Christmas");
                createSubGenres(cont,"/en/style/Various/Comedy" ,"Comedy");
                createSubGenres(cont,"/en/style/Various/Educational" ,"Educational");
                createSubGenres(cont,"/en/style/Various/Experimental" ,"Experimental");
                createSubGenres(cont,"/en/style/Various/Folkloric" ,"Folkloric");
                createSubGenres(cont,"/en/style/Various/Medieval" ,"Medieval");
                createSubGenres(cont,"/en/style/Various/Miscellaneous" ,"Miscellaneous");
                createSubGenres(cont,"/en/style/Various/Religious" ,"Religious");
                createSubGenres(cont,"/en/style/Various/Romantic" ,"Romantic");
                createSubGenres(cont,"/en/style/Various/Soundtracks" ,"Soundtracks");
                createSubGenres(cont,"/en/style/Various/Spiritual" ,"Spiritual");
            }else if(idx == 16){
                createSubGenres(cont,"/en/style/World/African" ,"African");
                createSubGenres(cont,"/en/style/World/Arabic" ,"Arabic");
                createSubGenres(cont,"/en/style/World/Asian" ,"Asian");
                createSubGenres(cont,"/en/style/World/Bossa%20Nova" ,"Bossa Nova");
                createSubGenres(cont,"/en/style/World/Brazilian" ,"Brazilian");
                createSubGenres(cont,"/en/style/World/Cajun" ,"Cajun");
                createSubGenres(cont,"/en/style/World/Celtic" ,"Celtic");
                createSubGenres(cont,"/en/style/World/Creole" ,"Creole");
                createSubGenres(cont,"/en/style/World/Ethnic%20Fusion" ,"Ethnic Fusion");
                createSubGenres(cont,"/en/style/World/Fado" ,"Fado");
                createSubGenres(cont,"/en/style/World/Hawaiian%20-%20Pacific" ,"Hawaiian - Pacific");
                createSubGenres(cont,"/en/style/World/Japanese" ,"Japanese");
                createSubGenres(cont,"/en/style/World/Jewish" ,"Jewish");
                createSubGenres(cont,"/en/style/World/Middle%20Eastern" ,"Middle Eastern");
                createSubGenres(cont,"/en/style/World/Morna" ,"Morna");
                createSubGenres(cont,"/en/style/World/Polka" ,"Polka");
                createSubGenres(cont,"/en/style/World/Tribal" ,"Tribal");
                createSubGenres(cont,"/en/style/World/World" ,"World");
                createSubGenres(cont,"/en/style/World/Worldbeat" ,"Worldbeat");
                createSubGenres(cont,"/en/style/World/Zouk" ,"Zouk");
            }
        }else{
            var cont = document.getElementById("shoutcastsub");
            var idx = document.getElementById("shoutcastmain").selectedIndex;
            createSubGenres(cont,"","");
            if(idx == 1){
                createSubGenres(cont,"/Genre?name=Adult Alternative","Adult Alternative");
                createSubGenres(cont,"/Genre?name=Britpop","Britpop");
                createSubGenres(cont,"/Genre?name=Classic Alternative","Classic Alternative");
                createSubGenres(cont,"/Genre?name=College","College");
                createSubGenres(cont,"/Genre?name=Dancepunk","Dancepunk");
                createSubGenres(cont,"/Genre?name=Dream Pop","Dream Pop");
                createSubGenres(cont,"/Genre?name=Emo","Emo");
                createSubGenres(cont,"/Genre?name=Goth","Goth");
                createSubGenres(cont,"/Genre?name=Grunge","Grunge");
                createSubGenres(cont,"/Genre?name=Hardcore","Hardcore");
                createSubGenres(cont,"/Genre?name=Indie Pop","Indie Pop");
                createSubGenres(cont,"/Genre?name=Indie Rock","Indie Rock");
                createSubGenres(cont,"/Genre?name=Industrial","Industrial");
                createSubGenres(cont,"/Genre?name=Lo Fi","Lo Fi");
                createSubGenres(cont,"/Genre?name=Modern Rock","Modern Rock");
                createSubGenres(cont,"/Genre?name=New Wave","New Wave");
                createSubGenres(cont,"/Genre?name=Noise Pop","Noise Pop");
                createSubGenres(cont,"/Genre?name=Post Punk","Post Punk");
                createSubGenres(cont,"/Genre?name=Power Pop","Power Pop");
                createSubGenres(cont,"/Genre?name=Punk","Punk");
                createSubGenres(cont,"/Genre?name=Ska","Ska");
                createSubGenres(cont,"/Genre?name=Xtreme","Xtreme");
            }else if(idx == 2){
                createSubGenres(cont,"/Genre?name=Acoustic Blues","Acoustic Blues");
                createSubGenres(cont,"/Genre?name=Cajun and Zydeco","Cajun and Zydeco");
                createSubGenres(cont,"/Genre?name=Chicago Blues","Chicago Blues");
                createSubGenres(cont,"/Genre?name=Contemporary Blues","Contemporary Blues");
                createSubGenres(cont,"/Genre?name=Country Blues","Country Blues");
                createSubGenres(cont,"/Genre?name=Delta Blues","Delta Blues");
                createSubGenres(cont,"/Genre?name=Electric Blues","Electric Blues");
            }else if(idx == 3){
                createSubGenres(cont,"/Genre?name=Baroque","Baroque");
                createSubGenres(cont,"/Genre?name=Chamber","Chamber");
                createSubGenres(cont,"/Genre?name=Choral","Choral");
                createSubGenres(cont,"/Genre?name=Classical Period","Classical Period");
                createSubGenres(cont,"/Genre?name=Early Classical","Early Classical");
                createSubGenres(cont,"/Genre?name=Impressionist","Impressionist");
                createSubGenres(cont,"/Genre?name=Modern","Modern");
                createSubGenres(cont,"/Genre?name=Opera","Opera");
                createSubGenres(cont,"/Genre?name=Piano","Piano");
                createSubGenres(cont,"/Genre?name=Romantic","Romantic");
                createSubGenres(cont,"/Genre?name=Symphony","Symphony");
            }else if(idx == 4){
                createSubGenres(cont,"/Genre?name=Alt Country","Alt Country");
                createSubGenres(cont,"/Genre?name=Americana","Americana");
                createSubGenres(cont,"/Genre?name=Bluegrass","Bluegrass");
                createSubGenres(cont,"/Genre?name=Classic Country","Classic Country");
                createSubGenres(cont,"/Genre?name=Contemporary Bluegrass","Contemporary Bluegrass");
                createSubGenres(cont,"/Genre?name=Contemporary Country","Contemporary Country");
                createSubGenres(cont,"/Genre?name=Honky Tonk","Honky Tonk");
                createSubGenres(cont,"/Genre?name=Hot Country Hits","Hot Country Hits");
                createSubGenres(cont,"/Genre?name=Western","Western");
            }else if(idx == 5){
                createSubGenres(cont,"/Genre?name=00s","00s");
                createSubGenres(cont,"/Genre?name=30s","30s");
                createSubGenres(cont,"/Genre?name=40s","40s");
                createSubGenres(cont,"/Genre?name=50s","50s");
                createSubGenres(cont,"/Genre?name=60s","60s");
                createSubGenres(cont,"/Genre?name=70s","70s");
                createSubGenres(cont,"/Genre?name=80s","80s");
                createSubGenres(cont,"/Genre?name=90s","90s");
            }else if(idx == 6){
                createSubGenres(cont,"/Genre?name=Exotica","Exotica");
                createSubGenres(cont,"/Genre?name=Light Rock","Light Rock");
                createSubGenres(cont,"/Genre?name=Lounge","Lounge");
                createSubGenres(cont,"/Genre?name=Orchestral Pop","Orchestral Pop");
                createSubGenres(cont,"/Genre?name=Polka","Polka");
                createSubGenres(cont,"/Genre?name=Space Age Pop","Space Age Pop");
            }else if(idx == 7){
                createSubGenres(cont,"/Genre?name=Acid House","Acid House");
                createSubGenres(cont,"/Genre?name=Ambient","Ambient");
                createSubGenres(cont,"/Genre?name=Big Beat","Big Beat");
                createSubGenres(cont,"/Genre?name=Breakbeat","Breakbeat");
                createSubGenres(cont,"/Genre?name=Dance","Dance");
                createSubGenres(cont,"/Genre?name=Demo","Demo");
                createSubGenres(cont,"/Genre?name=Disco","Disco");
                createSubGenres(cont,"/Genre?name=Dubstep","Dubstep");
                createSubGenres(cont,"/Genre?name=Downtempo","Downtempo");
                createSubGenres(cont,"/Genre?name=Drum and Bass","Drum and Bass");
                createSubGenres(cont,"/Genre?name=Electro","Electro");
                createSubGenres(cont,"/Genre?name=Garage","Garage");
                createSubGenres(cont,"/Genre?name=Hard House","Hard House");
                createSubGenres(cont,"/Genre?name=House","House");
                createSubGenres(cont,"/Genre?name=IDM","IDM");
                createSubGenres(cont,"/Genre?name=Jungle","Jungle");
                createSubGenres(cont,"/Genre?name=Progressive","Progressive");
                createSubGenres(cont,"/Genre?name=Techno","Techno");
                createSubGenres(cont,"/Genre?name=Trance","Trance");
                createSubGenres(cont,"/Genre?name=Tribal","Tribal");
                createSubGenres(cont,"/Genre?name=Trip Hop","Trip Hop");
            }else if(idx == 8){
                createSubGenres(cont,"/Genre?name=Alternative Folk","Alternative Folk");
                createSubGenres(cont,"/Genre?name=Contemporary Folk","Contemporary Folk");
                createSubGenres(cont,"/Genre?name=Folk Rock","Folk Rock");
                createSubGenres(cont,"/Genre?name=New Acoustic","New Acoustic");
                createSubGenres(cont,"/Genre?name=Old Time","Old Time");
                createSubGenres(cont,"/Genre?name=Traditional Folk","Traditional Folk");
                createSubGenres(cont,"/Genre?name=World Folk","World Folk");
            }else if(idx == 9){
                createSubGenres(cont,"/Genre?name=Christian","Christian");
                createSubGenres(cont,"/Genre?name=Christian Metal","Christian Metal");
                createSubGenres(cont,"/Genre?name=Christian Rap","Christian Rap");
                createSubGenres(cont,"/Genre?name=Christian Rock","Christian Rock");
                createSubGenres(cont,"/Genre?name=Classic Christian","Classic Christian");
                createSubGenres(cont,"/Genre?name=Contemporary Gospel","Contemporary Gospel");
                createSubGenres(cont,"/Genre?name=Gospel","Gospel");
                createSubGenres(cont,"/Genre?name=Praise and Worship","Praise and Worship");
                createSubGenres(cont,"/Genre?name=Sermons and Services","Sermons and Services");
                createSubGenres(cont,"/Genre?name=Southern Gospel","Southern Gospel");
                createSubGenres(cont,"/Genre?name=Traditional Gospel","Traditional Gospel");
            }else if(idx == 10){
                createSubGenres(cont,"/Genre?name=African","African");
                createSubGenres(cont,"/Genre?name=Afrikaans","Afrikaans");
                createSubGenres(cont,"/Genre?name=Arabic","Arabic");
                createSubGenres(cont,"/Genre?name=Asian","Asian");
                createSubGenres(cont,"/Genre?name=Bollywood","Bollywood");
                createSubGenres(cont,"/Genre?name=Brazilian","Brazilian");
                createSubGenres(cont,"/Genre?name=Caribbean","Caribbean");
                createSubGenres(cont,"/Genre?name=Celtic","Celtic");
                createSubGenres(cont,"/Genre?name=Chinese","Chinese");
                createSubGenres(cont,"/Genre?name=European","European");
                createSubGenres(cont,"/Genre?name=Filipino","Filipino");
                createSubGenres(cont,"/Genre?name=French","French");
                createSubGenres(cont,"/Genre?name=Greek","Greek");
                createSubGenres(cont,"/Genre?name=Hawaiian and Pacific","Hawaiian and Pacific");
                createSubGenres(cont,"/Genre?name=Hindi","Hindi");
                createSubGenres(cont,"/Genre?name=Indian","Indian");
                createSubGenres(cont,"/Genre?name=Japanese","Japanese");
                createSubGenres(cont,"/Genre?name=Jewish","Jewish");
                createSubGenres(cont,"/Genre?name=Klezmer","Klezmer");
                createSubGenres(cont,"/Genre?name=Korean","Korean");
                createSubGenres(cont,"/Genre?name=Mediterranean","Mediterranean");
                createSubGenres(cont,"/Genre?name=Middle Eastern","Middle Eastern");
                createSubGenres(cont,"/Genre?name=North American","North American");
                createSubGenres(cont,"/Genre?name=Russian","Russian");
                createSubGenres(cont,"/Genre?name=Soca","Soca");
                createSubGenres(cont,"/Genre?name=South American","South American");
                createSubGenres(cont,"/Genre?name=Tamil","Tamil");
                createSubGenres(cont,"/Genre?name=Worldbeat","Worldbeat");
                createSubGenres(cont,"/Genre?name=Zouk","Zouk");
            }else if(idx == 11){
                createSubGenres(cont,"/Genre?name=Acid Jazz","Acid Jazz");
                createSubGenres(cont,"/Genre?name=Avant Garde","Avant Garde");
                createSubGenres(cont,"/Genre?name=Big Band","Big Band");
                createSubGenres(cont,"/Genre?name=Bop","Bop");
                createSubGenres(cont,"/Genre?name=Classic Jazz","Classic Jazz");
                createSubGenres(cont,"/Genre?name=Cool Jazz","Cool Jazz");
                createSubGenres(cont,"/Genre?name=Fusion","Fusion");
                createSubGenres(cont,"/Genre?name=Hard Bop","Hard Bop");
                createSubGenres(cont,"/Genre?name=Latin Jazz","Latin Jazz");
                createSubGenres(cont,"/Genre?name=Smooth Jazz","Smooth Jazz");
                createSubGenres(cont,"/Genre?name=Swing","Swing");
                createSubGenres(cont,"/Genre?name=Vocal Jazz","Vocal Jazz");
                createSubGenres(cont,"/Genre?name=World Fusion","World Fusion");
            }else if(idx == 12){
                createSubGenres(cont,"/Genre?name=Bachata","Bachata");
                createSubGenres(cont,"/Genre?name=Banda","Banda");
                createSubGenres(cont,"/Genre?name=Bossa Nova","Bossa Nova");
                createSubGenres(cont,"/Genre?name=Cumbia","Cumbia");
                createSubGenres(cont,"/Genre?name=Flamenco","Flamenco");
                createSubGenres(cont,"/Genre?name=Latin Dance","Latin Dance");
                createSubGenres(cont,"/Genre?name=Latin Pop","Latin Pop");
                createSubGenres(cont,"/Genre?name=Latin Rap and Hip Hop","Latin Rap and Hip Hop");
                createSubGenres(cont,"/Genre?name=Latin Rock","Latin Rock");
                createSubGenres(cont,"/Genre?name=Mariachi","Mariachi");
                createSubGenres(cont,"/Genre?name=Merengue","Merengue");
                createSubGenres(cont,"/Genre?name=Ranchera","Ranchera");
                createSubGenres(cont,"/Genre?name=Reggaeton","Reggaeton");
                createSubGenres(cont,"/Genre?name=Regional Mexican","Regional Mexican");
                createSubGenres(cont,"/Genre?name=Salsa","Salsa");
                createSubGenres(cont,"/Genre?name=Samba","Samba");
                createSubGenres(cont,"/Genre?name=Tango","Tango");
                createSubGenres(cont,"/Genre?name=Tejano","Tejano");
                createSubGenres(cont,"/Genre?name=Tropicalia","Tropicalia");
            }else if(idx == 13){
                createSubGenres(cont,"/Genre?name=Black Metal","Black Metal");
                createSubGenres(cont,"/Genre?name=Classic Metal","Classic Metal");
                createSubGenres(cont,"/Genre?name=Death Metal","Death Metal");
                createSubGenres(cont,"/Genre?name=Extreme Metal","Extreme Metal");
                createSubGenres(cont,"/Genre?name=Grindcore","Grindcore");
                createSubGenres(cont,"/Genre?name=Hair Metal","Hair Metal");
                createSubGenres(cont,"/Genre?name=Heavy Metal","Heavy Metal");
                createSubGenres(cont,"/Genre?name=Metalcore","Metalcore");
                createSubGenres(cont,"/Genre?name=Power Metal","Power Metal");
                createSubGenres(cont,"/Genre?name=Progressive Metal","Progressive Metal");
                createSubGenres(cont,"/Genre?name=Rap Metal","Rap Metal");
                createSubGenres(cont,"/Genre?name=Thrash Metal","Thrash Metal");
            }else if(idx == 15){
                createSubGenres(cont,"/Genre?name=Environmental","Environmental");
                createSubGenres(cont,"/Genre?name=Ethnic Fusion","Ethnic Fusion");
                createSubGenres(cont,"/Genre?name=Healing","Healing");
                createSubGenres(cont,"/Genre?name=Meditation","Meditation");
                createSubGenres(cont,"/Genre?name=Spiritual","Spiritual");
            }else if(idx == 16){
                createSubGenres(cont,"/Genre?name=Adult Contemporary","Adult Contemporary");
                createSubGenres(cont,"/Genre?name=Barbershop","Barbershop");
                createSubGenres(cont,"/Genre?name=Bubblegum Pop","Bubblegum Pop");
                createSubGenres(cont,"/Genre?name=Dance Pop","Dance Pop");
                createSubGenres(cont,"/Genre?name=Idols","Idols");
                createSubGenres(cont,"/Genre?name=JPOP","JPOP");
                createSubGenres(cont,"/Genre?name=KPOP","KPOP");
                createSubGenres(cont,"/Genre?name=Oldies","Oldies");
                createSubGenres(cont,"/Genre?name=Soft Rock","Soft Rock");
                createSubGenres(cont,"/Genre?name=Teen Pop","Teen Pop");
                createSubGenres(cont,"/Genre?name=Top 40","Top 40");
                createSubGenres(cont,"/Genre?name=World Pop","World Pop");
            }else if(idx == 17){
                createSubGenres(cont,"/Genre?name=College","College");
                createSubGenres(cont,"/Genre?name=News","News");
                createSubGenres(cont,"/Genre?name=Sports","Sports");
                createSubGenres(cont,"/Genre?name=Talk","Talk");
                createSubGenres(cont,"/Genre?name=Weather","Weather");
            }else if(idx == 18){
                createSubGenres(cont,"/Genre?name=Classic R&B","Classic R&B");
                createSubGenres(cont,"/Genre?name=Contemporary R&B","Contemporary R&B");
                createSubGenres(cont,"/Genre?name=Doo Wop","Doo Wop");
                createSubGenres(cont,"/Genre?name=Funk","Funk");
                createSubGenres(cont,"/Genre?name=Motown","Motown");
                createSubGenres(cont,"/Genre?name=Neo Soul","Neo Soul");
                createSubGenres(cont,"/Genre?name=Quiet Storm","Quiet Storm");
                createSubGenres(cont,"/Genre?name=Soul","Soul");
                createSubGenres(cont,"/Genre?name=Urban Contemporary","Urban Contemporary");
            }else if(idx == 19){
                createSubGenres(cont,"/Genre?name=Alternative Rap","Alternative Rap");
                createSubGenres(cont,"/Genre?name=Dirty South","Dirty South");
                createSubGenres(cont,"/Genre?name=East Coast Rap","East Coast Rap");
                createSubGenres(cont,"/Genre?name=Freestyle","Freestyle");
                createSubGenres(cont,"/Genre?name=Gangsta Rap","Gangsta Rap");
                createSubGenres(cont,"/Genre?name=Hip Hop","Hip Hop");
                createSubGenres(cont,"/Genre?name=Mixtapes","Mixtapes");
                createSubGenres(cont,"/Genre?name=Old School","Old School");
                createSubGenres(cont,"/Genre?name=Turntablism","Turntablism");
                createSubGenres(cont,"/Genre?name=Underground Hip Hop","Underground Hip Hop");
                createSubGenres(cont,"/Genre?name=West Coast Rap","West Coast Rap");
            }else if(idx == 20){
                createSubGenres(cont,"/Genre?name=Contemporary Reggae","Contemporary Reggae");
                createSubGenres(cont,"/Genre?name=Dancehall","Dancehall");
                createSubGenres(cont,"/Genre?name=Dub","Dub");
                createSubGenres(cont,"/Genre?name=Pop Reggae","Pop Reggae");
                createSubGenres(cont,"/Genre?name=Ragga","Ragga");
                createSubGenres(cont,"/Genre?name=Reggae Roots","Reggae Roots");
                createSubGenres(cont,"/Genre?name=Rock Steady","Rock Steady");
            }else if(idx == 21){
                createSubGenres(cont,"/Genre?name=Adult Album Alternative","Adult Album Alternative");
                createSubGenres(cont,"/Genre?name=British Invasion","British Invasion");
                createSubGenres(cont,"/Genre?name=Celtic Rock","Celtic Rock");
                createSubGenres(cont,"/Genre?name=Classic Rock","Classic Rock");
                createSubGenres(cont,"/Genre?name=Garage Rock","Garage Rock");
                createSubGenres(cont,"/Genre?name=Glam","Glam");
                createSubGenres(cont,"/Genre?name=Hard Rock","Hard Rock");
                createSubGenres(cont,"/Genre?name=Jam Bands","Jam Bands");
                createSubGenres(cont,"/Genre?name=JROCK","JROCK");
                createSubGenres(cont,"/Genre?name=Piano Rock","Piano Rock");
                createSubGenres(cont,"/Genre?name=Prog Rock","Prog Rock");
                createSubGenres(cont,"/Genre?name=Psychedelic","Psychedelic");
                createSubGenres(cont,"/Genre?name=Rock & Roll","Rock & Roll");
                createSubGenres(cont,"/Genre?name=Rockabilly","Rockabilly");
                createSubGenres(cont,"/Genre?name=Singer and Songwriter","Singer and Songwriter");
                createSubGenres(cont,"/Genre?name=Surf","Surf");
            }else if(idx == 22){
                createSubGenres(cont,"/Genre?name=Anniversary","Anniversary");
                createSubGenres(cont,"/Genre?name=Birthday","Birthday");
                createSubGenres(cont,"/Genre?name=Christmas","Christmas");
                createSubGenres(cont,"/Genre?name=Halloween","Halloween");
                createSubGenres(cont,"/Genre?name=Hanukkah","Hanukkah");
                createSubGenres(cont,"/Genre?name=Honeymoon","Honeymoon");
                createSubGenres(cont,"/Genre?name=Kwanzaa","Kwanzaa");
                createSubGenres(cont,"/Genre?name=Valentine","Valentine");
                createSubGenres(cont,"/Genre?name=Wedding","Wedding");
                createSubGenres(cont,"/Genre?name=Winter","Winter");
            }else if(idx == 23){
                createSubGenres(cont,"/Genre?name=Anime","Anime");
                createSubGenres(cont,"/Genre?name=Kids","Kids");
                createSubGenres(cont,"/Genre?name=Original Score","Original Score");
                createSubGenres(cont,"/Genre?name=Showtunes","Showtunes");
                createSubGenres(cont,"/Genre?name=Video Game Music","Video Game Music");
            }else if(idx == 24){
                createSubGenres(cont,"/Genre?name=BlogTalk","BlogTalk");
                createSubGenres(cont,"/Genre?name=Comedy","Comedy");
                createSubGenres(cont,"/Genre?name=Community","Community");
                createSubGenres(cont,"/Genre?name=Educational","Educational");
                createSubGenres(cont,"/Genre?name=Government","Government");
                createSubGenres(cont,"/Genre?name=News","News");
                createSubGenres(cont,"/Genre?name=Old Time Radio","Old Time Radio");
                createSubGenres(cont,"/Genre?name=Other Talk","Other Talk");
                createSubGenres(cont,"/Genre?name=Political","Political");
                createSubGenres(cont,"/Genre?name=Scanner","Scanner");
                createSubGenres(cont,"/Genre?name=Spoken Word","Spoken Word");
                createSubGenres(cont,"/Genre?name=Sports","Sports");
                createSubGenres(cont,"/Genre?name=Technology","Technology");
            }else if(idx == 25){
                createSubGenres(cont,"/Genre?name=Adult","Adult");
                createSubGenres(cont,"/Genre?name=Best Of","Best Of");
                createSubGenres(cont,"/Genre?name=Chill","Chill");
                createSubGenres(cont,"/Genre?name=Eclectic","Eclectic");
                createSubGenres(cont,"/Genre?name=Experimental","Experimental");
                createSubGenres(cont,"/Genre?name=Female","Female");
                createSubGenres(cont,"/Genre?name=Heartache","Heartache");
                createSubGenres(cont,"/Genre?name=Instrumental","Instrumental");
                createSubGenres(cont,"/Genre?name=LGBT","LGBT");
                createSubGenres(cont,"/Genre?name=Love and Romance","Love and Romance");
                createSubGenres(cont,"/Genre?name=Party Mix","Party Mix");
                createSubGenres(cont,"/Genre?name=Patriotic","Patriotic");
                createSubGenres(cont,"/Genre?name=Rainy Day Mix","Rainy Day Mix");
                createSubGenres(cont,"/Genre?name=Reality","Reality");
                createSubGenres(cont,"/Genre?name=Sexy","Sexy");
                createSubGenres(cont,"/Genre?name=Shuffle","Shuffle");
                createSubGenres(cont,"/Genre?name=Travel Mix","Travel Mix");
                createSubGenres(cont,"/Genre?name=Tribute","Tribute");
                createSubGenres(cont,"/Genre?name=Trippy","Trippy");
                createSubGenres(cont,"/Genre?name=Work Mix","Work Mix");
            }
        }
    };
    startSearch();
}
function receiveMessage(evt) {
    if(evt&&evt.data){
        if(evt.data.type == 'oepndialog'){
            __openfile(true);
        }else if(evt.data.type == 'changefont'){
            document.getElementById('SrtFontModal').style.display = "block";
        }else if(evt.data.type == 'closebr'){
        	hideBrowserMode();
        }else if(evt.data.type == 'showmodal'){
            document.getElementById('FileModal').style.display = "block";
        }else if(evt.data.type == 'nextitem'){
            VIDEOINDEX++;
            onchoseentry();
        }else if(evt.data.type == 'hiddenmodal'){
            document.getElementById('FileModal').style.display = "none";
        }else if(evt.data.type == 'clickdialog'){
            __openfile();
        }else if(evt.data.type == 'clickfdialog'){
            __openfolder();
        }else if(evt.data.type == 'clickudialog'){
            __openURL();
        }else if(evt.data.type == 'finish'){
            VIDEOINDEX++;
            onchoseentry();
        }else if(evt.data.type == 'showplaylist'){
            showPlaylist();
        }else if(evt.data.type == 'llv'){
	    	var list = evt.data.list;
	    	var fidx = VIDEO_FILE_ENTRYS.length;
	    	for (var i = 0; i < list.length; i++) {
	    		var litem = list[i];
		        var llvitem = {};
		        llvitem.name = litem;
		        llvitem.type = "llv";
		        VIDEO_INDEX_ARRAY.push(VIDEO_FILE_ENTRYS.length+"");
	            VIDEO_FILE_ENTRYS.push(llvitem);
	    	};
	    	VIDEOINDEX = fidx;
            onchoseentry();
        }else if(evt.data.type == 'llv'){
            chrome.storage.local.set({"_dont_show":true});
        }else if(evt.data.type == 'volume'){
            var val = evt.data.val;
            var obj = {};
            obj.vol = val;
            chrome.storage.local.set({'_volume':obj});
        }else if(evt.data.type == 'fullscreen'){
        	setFullScreen();
        }else if(evt.data.type == 'getvolume'){
            chrome.storage.local.get('_volume',function(obj){
                if(obj['_volume']){
	                document.getElementById('webviewf').contentWindow.postMessage({msg:"setvolume",val:obj['_volume'].vol-0},"*");
	                document.getElementById('webviewv').contentWindow.postMessage({msg:"setvolume",val:obj['_volume'].vol-0},"*");
                }
            });
        }else if(evt.data.type == 'browserurl'){
            setBrowserURL(evt.data);
            evt.data.type = "bookmark";
            CURRENTBROWSEURL = evt.data;
        }else if(evt.data.type == 'opensrt'){
            var modal = document.getElementById("charseModal");
            modal.style.display = "block"
            setTimeout(function(){
                modal.style.opacity = 1;
            },50)
        }
    }
}
chrome.contextMenus.onClicked.addListener(function (info,tab){
	if(info.menuItemId.indexOf("_chrome_ctxmenu_frame") > -1){
		chrome.app.window.current().restore();
		resizeWindow(null,false);
	}else if(info.menuItemId.indexOf("_chrome_ctxmenu_close") > -1){
		chrome.app.window.current().close();
	}else if(info.menuItemId.indexOf("_chrome_ctxmenu_file") > -1){
        __openfile();
	}else if(info.menuItemId.indexOf("_chrome_ctxmenu_folder") > -1){
        __openfolder();
	}else if(info.menuItemId.indexOf("_chrome_ctxmenu_url") > -1){
        __openURL();
	}
});
chrome.runtime.onMessageExternal.addListener(function(msg,sender,sendResponse){
    var type = null,type2 = null;;
    chrome.runtime.getBackgroundPage( function(bg) {
        if(msg.indexOf("youtube>") === 0&& sender.id === bg.parmitid){
            type = "youtube";
        }else if(msg.indexOf("dailymotion>") === 0&& sender.id === bg.parmitid){
            type = "dailymotion";
        }else if(msg.indexOf("twitch>") === 0&& sender.id === bg.parmitid){
            type = "twitch";
        }else if(msg.indexOf("soundcloud>") === 0&& sender.id === bg.parmitid){
            type = "soundcloud";
        }else if(msg.indexOf("vimeo>") === 0&& sender.id === bg.parmitid){
            type = "vimeo";
        }else if(msg.indexOf("url>") === 0&& sender.id === bg.parmitid){
            type = "url";
        }else if(msg.indexOf("sendurl>") === 0&& sender.id === bg.parmitid2){
            type2 = "sendurl";
        }else if(msg.indexOf("sendlink>") === 0&& sender.id === bg.parmitid2){
            type2 = "sendlink";
        }else if(msg.indexOf("sendvideo>") === 0&& sender.id === bg.parmitid2){
            type2 = "sendvideo";
        }
        if(type){
            var url = msg.split(">")[1];
            if(!url)return;
            checkURLEntry(url);
        }else if(type2){
            var url = msg.split(">")[1];
            checkSendURL({name:url});
        }
        bg.LaunchDATA = null;
    });
    sendResponse({});
});
function checkFileType(fname,strict){
    var type = "";
    if(/\.(mp4)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(m4v)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(mkv)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(m4a)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(mp3)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(webm)$/i.test(fname)) {
        type = "webm";
    }else if(/\.(ogv)$/i.test(fname)) {
        type = "ogg";
    }else if(/\.(ogm)$/i.test(fname)) {
        type = "ogg";
    }else if(/\.(oga)$/i.test(fname)) {
        type = "ogg";
    }else if(/\.(flv)$/i.test(fname)) {
        type = "flv";
    }else if(/\.(3gp)$/i.test(fname)) {
        // type = "3gp";
    }else if(/\.(mov)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(f4v)$/i.test(fname)) {
        type = "mp4";
    }else if(/\.(m3u8)$/i.test(fname)) {
        type = "m3u8";
    }else if(/\.(mpd)$/i.test(fname)) {
        type = "mpd";
    }else{
    	if(strict){
    		type = "";
    	}else{
	    	if(fname.indexOf(".") > -1){
	    		var types = fname.split(".");
	    		type = types[types.length-1];
	    		if(!type)type = "mp4";
	    		type = type.toLowerCase();
	    	}else{
	    		type = "mp4";
	    	}
	    }
    }
    return type;
}
function onchoseentry(preflg) {
	if(VIDEOINDEX < 0)return;
	if(!ADDEVENTFLAG){
		ADDEVENTFLAG = true;
	    document.getElementById('FileModal').addEventListener("click",clickFileModal,false);
	}
	var file = VIDEO_FILE_ENTRYS[VIDEO_INDEX_ARRAY[VIDEOINDEX]];
	var flg = false;
	var liveflg = false;
	setTimeout(function(){
	    document.querySelector(".modal-awesome-prevideo").style.display = "inline-block";
	    document.querySelector(".modal-awesome-nextvideo").style.display = "inline-block"; 
	},50);
	if(!file){
	}else if(file.type === "remove"){
		if(preflg){
	        VIDEOINDEX--;
	        if(VIDEOINDEX < 0)VIDEOINDEX = 0;
		}else{
	        VIDEOINDEX++;
		}
        onchoseentry(preflg);
	}else if(file.type === "llv"){
        flg = true;
		playFlash(file,"llv");
	}else if(file.type === "youtube"){
        flg = true;
		playFlash(file,"youtube");
	}else if(file.type === "dailymotion"){
        flg = true;
		playFlash(file,"dailymotion");
    }else if(file.type === "twitch"){
        flg = true;
        var nurl = file.name.split("?")[0];
        if(/^https?:\/\/player\.twitch\.tv\//.test(nurl)){
        }else if(/^https?:\/\/.*\.twitch\.tv\//.test(nurl)){
            var nurl = file.name.split("?")[0];
            var urlsplt = nurl.split("/");
            var uname = urlsplt[3];
            var vopt = urlsplt[4];
            var itmid = urlsplt[5];
            file.name = "http://player.twitch.tv/?channel="+uname;
        }else if(nurl.indexOf("/embed") === -1){
            var nurl = file.name.split("?")[0];
            var uname = nurl.split("twitch.tv/")[1];
            if(!uname)return;
            file.name = "http://www.twitch.tv/"+uname+"/embed";
        }else{

        }
        playLiveMode(file,"twitch");
        liveflg = true;
    }else if(file.type === "soundcloud"){
        flg = true;
        playFlash(file,"soundcloud");
    }else if(file.type === "vimeo"){
        flg = true;
        playFlash(file,"vimeo");
    }else if(file.type === "url"){
        var nurl = file.name.split("?")[0];
		var type = checkFileType(nurl);
        flg = true;
    	if(/^rtmp:\/\//.test(file.name) ){
    		playFlash(file,"rtmp",file.name,"rtmp");
	    }else if(/\.(m3u8)$/i.test(nurl)) {
			var myVideo = document.createElement('video');
			if (myVideo.canPlayType('application/x-mpegURL')) {
				playVideoTag(file,type,true);
			}else{
	    		playFlash(file,"m3u8",file.name,"m3u8");
			}
			myVideo = null;
	    }else if(/\.(mpd)$/i.test(nurl)) {
			var myVideo = document.createElement('video');
			if (myVideo.canPlayType('application/dash+xml')) {
				playVideoTag(file,"bmpd",true);
			}else{
				playVideoTag(file,"mpd",true);
			}
			myVideo = null;
    	}else{
            if(type === "flv"){
                playFlash(file,null,file.name,"nflv");
            }else{
                playVideoTag(file,type,true);
            }
    	}
    }else if(file){
		var type = checkFileType(file.name);
        if(!type)type = "mp4";          
        flg = true;
    	if(type === "flv" || type === "3gp" || type === "mov"){
    		playFlash(file);
    	}else{    		
    		if(file&&type)playVideoTag(file,type,false);
    	}
    }
    if(flg){
        addClass();
        if(!liveflg)hideBrowserMode();
    }
}
function playLiveMode(file,vtype){
	var webf = document.getElementById('webviewf');
    var webv = document.getElementById('webviewv');
    var webb = document.getElementById('webviewb');
	if(vtype === "twitch"){
        if(file.name.indexOf("/embed") > -1){
            var cname = file.name.split("/")[3];
            var fval = "http://player.twitch.tv/?channel="+cname;
            var data = {
                type:"bookmark",
                url:fval,
                tag:"object,embed,video,iframe,audio",
                width:640,
                height:360,
                elemid:""
            };
            CURRENTBROWSEURL = data;  
        	webb.setAttribute("src","videojs/video-blank.html");
			setTimeout(function(){
	    	    webb.setAttribute("src",fval);
			},350);            
        }else if(file.name.indexOf("<>objecttag<>") > -1){
            var fval = file.name.replace("<>objecttag<>","?");
            fval = fval.split("&")[0];
            var data = {
                type:"bookmark",
                url:fval,
                tag:"object,embed,video,iframe,audio",
                width:640,
                height:360,
                elemid:""
            };
            CURRENTBROWSEURL = data;  
        	webb.setAttribute("src","videojs/video-blank.html");
			setTimeout(function(){
	    	    webb.setAttribute("src",fval);
			},350);            
        }else{
            var data = {
                type:"bookmark",
                url:file.name,
                tag:"object,embed,video,iframe,audio",
                width:640,
                height:360,
                elemid:""
            };
            CURRENTBROWSEURL = data;  
        	webb.setAttribute("src","videojs/video-blank.html");
			setTimeout(function(){
	    	    webb.setAttribute("src",file.name);
			},350);               
        }
        webf.parentNode.style.zIndex = 1;
        webv.parentNode.style.zIndex = 4;
        webb.parentNode.style.zIndex = 9;
        webf.contentWindow.postMessage({msg:"dispose"},"*");
        webv.contentWindow.postMessage({msg:"stopplayerv"},"*");
        setTimeout(function(){
            webv.contentWindow.postMessage({msg:"stopplayerv"},"*");
        },1500);
        document.getElementById("modal-awesome-browser2").style.display = "none";
        document.getElementById("modal-awesome-bookmarks2").style.display = "none";
	}
}
function playVideoTag(file,type,urlflg){
	var webf = document.getElementById('webviewf');
    var webv = document.getElementById('webviewv');
    var webb = document.getElementById('webviewb');

    webf.parentNode.style.zIndex = 1;
    webv.parentNode.style.zIndex = 4;
    webb.parentNode.style.zIndex = 0;

    PLAYERMODE = "html5";
    if(webv.style.display === "none")webv.style.display = "block";
    webf.contentWindow.postMessage({msg:"dispose"},"*");
    webv.contentWindow.postMessage({msg:"stopplayerv"},"*");
    webb.setAttribute("src","videojs/video-blank.html");
    setplayer();
    function setplayer(){
        if(urlflg&&type !== "twitch"){
            webv.contentWindow.postMessage({ex:"url",uex:type,url:file.name},"*");
        }else{
            file.file(function(file_handle){
                URL.revokeObjectURL(PREFILEURL)
                var url = window.URL.createObjectURL(file_handle);
                PREFILEURL = url;
                webv.contentWindow.postMessage({ex:type,url:url},"*");
            });
        }
    }
}
function playFlash(file,vtype,stream,streamtype){
	var webf = document.getElementById('webviewf');
    var webv = document.getElementById('webviewv');
    var webb = document.getElementById('webviewb');

    webf.parentNode.style.zIndex = 4;
    webv.parentNode.style.zIndex = 1;
    webb.parentNode.style.zIndex = 0;

    PLAYERMODE = "flash";
    if(webf.style.display === "none")webf.style.display = "block";
    webf.contentWindow.postMessage({msg:"stopplayerf"},"*");
    webv.contentWindow.postMessage({msg:"stopplayerv"},"*");
    webb.setAttribute("src","videojs/video-blank.html"); 
    setTimeout(function(){
        webv.contentWindow.postMessage({msg:"stopplayerv"},"*");
    },1500);
    chrome.runtime.getBackgroundPage( function(bg) {
        bg.app.stop();
        setplayer();
        function setplayer(){
            if(vtype === "open_llv"){
                setTimeout(function(){
                    webf.contentWindow.postMessage({ex:"open_llv"},"*");
                },1);
            }else if(vtype === "llv"){
                setTimeout(function(){
                    webf.contentWindow.postMessage({ex:"llv",url:file.name},"*");
                },1);
            }else if(vtype === "youtube"){
                setTimeout(function(){
                    webf.contentWindow.postMessage({ex:"youtube",url:file.name},"*");
                },1);
            }else if(vtype === "dailymotion"){
                setTimeout(function(){
                    webf.contentWindow.postMessage({ex:"dailymotion",url:file.name},"*");
                },1);
            }else if(vtype === "twitch"){


            }else if(vtype === "soundcloud"){
                setTimeout(function(){
                    webf.contentWindow.postMessage({ex:"soundcloud",url:file.name},"*");
                },1);
            }else if(vtype === "vimeo"){
                setTimeout(function(){
                    webf.contentWindow.postMessage({ex:"vimeo",url:file.name},"*");
                },1);
            }else if(stream){
                webf.contentWindow.postMessage({ex:"stream",url:stream,stype:streamtype},"*");
            }else{
                var nurl = file.name.split("?")[0];
                var type = checkFileType(nurl);
                if(!FLASHSTREAM&&type === "flv"){
		            file.file(function(file_handle){
				        var url = window.URL.createObjectURL(file_handle);
						var xhr = new XMLHttpRequest();
						xhr.open( "GET", url, true );
						xhr.responseType = "arraybuffer";
						xhr.onreadystatechange = function(){
							if((xhr.readyState === 4) && (xhr.status == 200)){
						        var arr = new Uint8Array(this.response);
			                    webf.contentWindow.postMessage({ex:type,base64:arr},"*");
                                URL.revokeObjectURL(url);
					            if(!vtype){
                                    bg.launchEntry = null;
					            }
							}
						};
						xhr.send();
		            });
                }else{
                	if(type === "3gp")type = "flv";
	                webf.contentWindow.postMessage({ex:type},"*");
		            if(!vtype){
                        bg.launchEntry = file;
		            }
                }
            }
        }
    });
}
function setBrowserURL(data){
    var tags = data.tag;
    var webviewb = document.getElementById('webviewb');
    BROWSERSCRIPT = ''
    +'var tags = "'+tags+'";'
    +'var ifrmflg = false;'
    +'if(tags.indexOf("iframe") > -1){'
    	+'ifrmflg = true;'
    	+'tags = tags.replace(",iframe","");'
   	+'}'
    +'var obps=document.querySelectorAll(tags);'
    +'if(!setStatusCheck({h:'+data.height+',w:'+data.width+'},obps)){'
    	+'if(ifrmflg){'
    		+'tags+=",iframe";'
		    +'obps=document.querySelectorAll(tags);'
    	+'}'
	    +'setStatusCheck({h:'+data.height+',w:'+data.width+'},obps,true);'
    +'}'
    +'function setStatusCheck(a,obps,clflg){'
        +'if(obps&&obps.length > 0){'
            +'document.body.style.setProperty("width","10000px","important");'
            +'document.documentElement.style.setProperty("width","10000px","important");'
        	+'var tbps = [];'
            +'for (var i = 0; i < obps.length; i++) {'
                +'var elemrect = obps[i].getBoundingClientRect();'
                +'if(!elemrect)continue;'
                +'var obj = {};'
                +'obj.ps = elemrect;'
                +'obj.elem = obps[i];'
                +'tbps.push(obj);'
            +'}'
			+'tbps.sort(function(a, b){'
			    +'var x = a.ps.top;'
			    +'var y = b.ps.top;'
			    +'if (x > y) return 1;'
			    +'if (x < y) return -1;'
			    +'return 0;'
			+'});'
	        +'var bps = [];'
        	+'for (var i = 0; i < tbps.length; i++) {'
	            +'bps.push(tbps[i].elem);'
        	+'}'
            +'var video = null,prnt = null;'
        	+'checkiframe(a.h,a.w,true);'
            +'if(!video){'
            	+'checkiframe(parseInt(a.h*0.95),parseInt(a.w*0.95),true);'
            +'}' 
            +'if(!video){'
            	+'checkiframe(parseInt(a.h*0.9),parseInt(a.w*0.9),true);'
            +'}'
            +'if(!video){'
            	+'checkiframe(parseInt(a.h*0.85),parseInt(a.w*0.85),true);'
            +'}'
        	+'checkiframe(a.h,a.w);'
            +'if(!video){'
            	+'checkiframe(parseInt(a.h*0.95),parseInt(a.w*0.95));'
            +'}' 
            +'if(!video){'
            	+'checkiframe(parseInt(a.h*0.9),parseInt(a.w*0.9));'
            +'}'
            +'if(!video){'
            	+'checkiframe(parseInt(a.h*0.85),parseInt(a.w*0.85));'
            +'}'
            +'if(!video&&!clflg){'
            	+'checkiframe(parseInt(a.h*0.8),parseInt(a.w*0.8));'
            +'}' 
            +'if(!video&&!clflg){'
            	+'checkiframe(parseInt(a.h*0.7),parseInt(a.w*0.7));'
            +'}'      
            +'if(!video&&!clflg){'
            	+'checkiframe(parseInt(a.h*0.5),parseInt(a.w*0.5));'
            +'}'                   
            +'if(!video&&!clflg){'
            	+'checkiframe(parseInt(a.h*0.4),parseInt(a.w*0.4));'
            +'}'
            +'if(!video&&!clflg){'
            	+'checkiframe(parseInt(a.h*0.3),parseInt(a.w*0.3));'
            +'}'
            +'if(!video&&!clflg){'
            	+'checkiframe(parseInt(a.h*0.2),parseInt(a.w*0.2));'
            +'}'
            +'if(video){'
            	+'stat(video,prnt);'
	            +'return true;'
            +'}else{'
	            +'return false;'
            +'}'
	        +'function checkiframe(hei,wd,vidflg){'
	            +'for (var i = 0; i < bps.length; i++) {'
	                +'var item = bps[i];'
	                +'var position=item.getBoundingClientRect();'
                    +'if(position&&position.left > -1 &&position.top > -1 && position.height > hei && position.width > wd){'
	                	+'if(vidflg){'
	                		+'if(item&&item.id&&item.id&&(/player/i.test(item.id))){'
			                    +'video = item;'
			                    +'if(video.tagName.toUpperCase() === "VIDEO"){'
				                    +'prnt = checkparent(video,position);'
			                    +'}else{'
				                    +'prnt = video;'
			                    +'}'
			                    +'break;'
	                		+'}'
	                	+'}else{'
		                    +'video = item;'
		                    +'if(video.tagName.toUpperCase() === "VIDEO"){'
			                    +'prnt = checkparent(video,position);'
		                    +'}else{'
			                    +'prnt = video;'
		                    +'}'
		                    +'break;'
		                +'}'
	                +'}'
	            +'}'
            +'}'
        +'}'
        +'function checkpelem(elem,position,video){'
            +'if(elem.parentNode.tagName.toUpperCase() === "BODY")return elem;'
            +'if(elem.tagName.toUpperCase() === "IFRAME")return elem;'
            +'var prnt = elem.parentNode;'
            +'var pposition=prnt.getBoundingClientRect();'
            +'if(video.tagName.toUpperCase() === "VIDEO" && (pposition&&pposition.width > position.width+17 || pposition.height > position.height+48)){'
                +'return elem;'
            +'}'
            +'if(video.tagName.toUpperCase() !== "VIDEO" && (pposition&&pposition.width > position.width+1 || pposition.height > position.height+1)){'
                +'return elem;'
            +'}'
            +'resize();'
            +'resize(null,10);'
            +'setTimeout(function(){resize();},100);'
            +'window.addEventListener("resize",function(e){'
            	+'resize();'
	            +'setTimeout(function(){resize();},110);'
            +'},true);'
            +'return prnt;'
            +'function resize(e,plus){'
            	+'if(!plus)plus = 0;'
                +'var wh = window.innerHeight+plus;'
                +'var ww = window.innerWidth+plus;'
                +'prnt.style.setProperty("width",ww+"px","important");'
                +'prnt.style.setProperty("height",wh+"px","important");'
                +'if(video.tagName.toUpperCase() !== "VIDEO"){'
	                +'prnt.style.setProperty("margin",0,"important");'
	                +'prnt.style.setProperty("padding",0,"important");'
                +'}'
            +'}'
        +'}'
        +'function checkparent(video,position){'
            +'var chkelem = checkpelem(video,position,video);'
            +'chkelem = checkpelem(chkelem,position,video);'
            +'chkelem = checkpelem(chkelem,position,video);'
            +'chkelem = checkpelem(chkelem,position,video);'
            +'return chkelem;'
        +'}'
        +'function stat(video,prnt){'
            +'document.body.style.setProperty("width","","important");'
            +'document.documentElement.style.setProperty("width","","important");'
        	+'var cont = document.createElement("div");'
        	+'var ccont = document.createElement("div");'
            +'var c=prnt.parentNode.removeChild(prnt);'
            // +'document.body.innerHTML="";'
	        +'var allelem =document.body.querySelectorAll("*");'
	        +'for (var i = 0; i < allelem.length; i++) {'
	            +'allelem[i].style.setProperty("display","none","important");'
	            +'allelem[i].style.setProperty("visibility","hidden","important");'
	            +'allelem[i].style.setProperty("opacity",0,"important");'
	            +'allelem[i].style.setProperty("position","absolute","important");'
	            +'allelem[i].style.setProperty("top","-10000px","important");'
	            +'allelem[i].style.setProperty("left","-10000px","important");'
	            +'allelem[i].style.setProperty("width",0,"important");'
	            +'allelem[i].style.setProperty("height",0,"important");'
	            +'allelem[i].style.setProperty("max-width",0,"important");'
	            +'allelem[i].style.setProperty("max-height",0,"important");'
	            +'allelem[i].style.setProperty("z-index",0,"important");'
	        +'}'
            +'document.body.appendChild(cont);'
            +'cont.appendChild(ccont);'
            +'ccont.appendChild(c);'
            // +'ccont.style.setProperty("position","relative","important");'
            +'document.body.style.setProperty("overflow","hidden","important");'
            +'document.body.style.setProperty("background","#000","important");'
            +'document.body.style.setProperty("margin",0,"important");'
            +'document.body.style.setProperty("padding",0,"important");'
            +'document.documentElement.style.setProperty("overflow","hidden","important");'
            +'document.documentElement.style.setProperty("background","#000","important");'
            +'document.documentElement.style.setProperty("margin",0,"important");'
            +'document.documentElement.style.setProperty("padding",0,"important");'
            +'var timerid = null;'
            // +'cont.style.setProperty("position","fixed","important");'
            +'cont.style.setProperty("top",0,"important");'
            +'cont.style.setProperty("left",0,"important");'
            +'cont.style.setProperty("z-index",2147483647,"important");'
            +'resizevideo();'
            +'resizevideo(null,10);'
            +'setTimeout(function(){resizevideo();},100);'
            +'setTimeout(function(){resizevideo(null,10);},1100);'
            +'setTimeout(resizevideo,1200);'
            +'window.addEventListener("resize",resizevideo,true);'
            +'window.open = null;'
            +'function resizevideo(e,plus){'
                +'clearTimeout(timerid);'
                +'timerid = setTimeout(function(){'
                    +'if(!plus)plus = 0;'
                    +'var wh = window.innerHeight+plus-2;'
                    +'var ww = window.innerWidth+plus;'
                    +'if(video.tagName.toUpperCase() === "VIDEO"){'
                        +'wh = wh-36;'
                    +'}'
                    +'video.setAttribute("width",ww);'
                    +'video.setAttribute("height",wh);'
                    +'video.style.setProperty("width",ww+"px","important");'
                    +'video.style.setProperty("height",wh+"px","important");'
                +'},120);'
            +'}'
        +'}'
    +'}';
    webviewb.setAttribute("src",data.url);
}
chrome.alarms.clearAll();
