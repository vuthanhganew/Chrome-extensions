var LaunchDATA = null;
var parmitid = "ndnijgilgcbhfnklfeookcddkgcecofk";
var parmitid2 = "hmjaimbpcoggfnbmcenplmcblhdcleii";
chrome.runtime.getBackgroundPage( function(bg) {
    window.bg = bg
})
chrome.runtime.onMessageExternal.addListener(function(msg,sender,sendResponse){
    var type = null;
    if(msg.indexOf("youtube>") === 0&& sender.id === parmitid){
        type = "youtube";
    }else if(msg.indexOf("dailymotion>") === 0&& sender.id === parmitid){
        type = "dailymotion";
    }else if(msg.indexOf("soundcloud>") === 0&& sender.id === parmitid){
        type = "soundcloud";
    }else if(msg.indexOf("url>") === 0&& sender.id === parmitid){
        type = "url";
    }else if(msg === "test"){
    	sendResponse("ok");
    }else if(msg.indexOf("sendurl>") === 0&& sender.id === parmitid2){
        type = "sendurl";
    }else if(msg.indexOf("sendlink>") === 0&& sender.id === parmitid2){
        type = "sendlink";
    }else if(msg.indexOf("sendvideo>") === 0&& sender.id === parmitid2){
        type = "sendvideo";
    }
    if(type){
        var url = msg.split(">")[1];
        if(!url)return;
        var item = {
            type:type,
            name:url
        }

        var wnds = chrome.app.window.getAll();
        if(wnds.length > 0){
            LaunchDATA = null;
            return
        }
        LaunchDATA = {items:[]}
        LaunchDATA.items[0] = {entry:""};
        LaunchDATA.items[0].entry = item;
        launchAPP();
    }
    sendResponse({});
});
chrome.app.runtime.onLaunched.addListener(function(launchData) {
    launchAPP(launchData)
});
function launchAPP(launchData){
    if(launchData)LaunchDATA = launchData;
    function FileEntryHandler(request) {
        DirectoryEntryHandler.prototype.constructor.call(this, request)
    }
    _.extend(FileEntryHandler.prototype, 
             DirectoryEntryHandler.prototype, 
             BaseHandler.prototype, {
        get: function() {
            this.setHeader('accept-ranges','bytes')
            this.setHeader('connection','keep-alive')
            this.onEntry(window.bg.launchEntry)
        }
    })
    chrome.runtime.getPackageDirectoryEntry( function(entry) {
        window.fs = new FileSystem(entry)
        var handlers = [
            ['/LAUNCHENTRY', FileEntryHandler],
            ['.*', DirectoryEntryHandler]
        ]
        var app = new chrome.WebApplication({handlers:handlers, host:'127.0.0.1', port:48716});
        app.start()
        window.app = app;
        var opts = {id:'index',frame:"none"};
        setTimeout(function(){
            chrome.app.window.create('index.html',opts,function(mainWindow) {
                window.mainWindow = mainWindow;
                mainWindow.onClosed.addListener(function(evt) {
    		        chrome.alarms.clearAll();
                    chrome.power.releaseKeepAwake();
                })
            });
            createContextMenu();
        },250);
    })
}
function createContextMenu(){
	chrome.contextMenus.removeAll(function(){
	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu_close",
	        "contexts": ["all"],
	        "title": "Close",
	        "type": "normal"
	    });
	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu1",
	        "contexts": ["all"],
	        "type": "separator"
	    });

	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu_file",
	        "contexts": ["all"],
	        "title": "Open File",
	        "type": "normal"
	    });
	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu_folder",
	        "contexts": ["all"],
	        "title": "Open Folder",
	        "type": "normal"
	    });
	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu_url",
	        "contexts": ["all"],
	        "title": "Open URL",
	        "type": "normal"
	    });

	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu5",
	        "contexts": ["all"],
	        "type": "separator"
	    });

	    chrome.contextMenus.create({
	        "id": "_chrome_ctxmenu_frame",
	        "contexts": ["all"],
	        "title": "Show Frame",
	        "type": "normal"
	    });
	});
}
