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
window.addEventListener("message",checkType,true);
document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById("url-okbutton").addEventListener("click",function(){
    	_sendmsg__();
    },true);
    document.getElementById("url-input").addEventListener("keypress",function(e){
    	if(e.keyCode === 13)_sendmsg__();
    },true);
    document.getElementById("sample-button").addEventListener("click",clickSample,false);
    document.getElementById("closebutton").addEventListener("click",cliseClose,false);
},false);

function cliseClose(){
	var data = {
		type:"closebr"
	};
	if(window.embedder)window.embedder.postMessage(data, embedderOrigin);
}
function clickSample(){
	document.getElementById("url-input").value = "http://www.ustream.tv/nasahdtv";
}
function checkType(evt){
	if(evt.data){
	    if(evt.data.msg == 'loadb'){
	        window.embedder = evt.source;
	        window.embedderOrigin = evt.origin;
	    }else if(evt.data.msg == 'sndburl'){
	    	document.getElementById("url-input").value = evt.data.url;
	    }
	}
}
function _sendmsg__() {
	var url = document.getElementById("url-input").value.replace(/^\s+|\s+$/g, "");
	var target = document.getElementById("target-input").value.replace(/^\s+|\s+$/g, "");
	var width = document.getElementById("width-input").value;
	var height = document.getElementById("height-input").value;

	if(!target){
		target = "object,embed,video,iframe,audio";
		document.getElementById("target-input").value = target;
	}

	if(width > 150){
		document.getElementById("width-input").value = 640;
	}
	if(height > 120){
		document.getElementById("height-input").value = 360;
	}

	if(!url || url.indexOf("://") === -1)return;
	var data = {
		type:"browserurl",
		url:url,
		tag:target,
		width:width,
		height:height,
		elemid:""
	}
	if(window.embedder)window.embedder.postMessage(data, embedderOrigin);
}
