videojs.plugin('dialogbutton', function(options) {
	var player = this;
	var topButton = vjs.Button.extend({
		init: function(player, options) {
			vjs.Button.call(this, player, options);
		}
	});
	topButton.prototype.buttonText = 'Playlist';
	topButton.prototype.buildCSSClass = function() {
		return 'vjs-top-button vjs-menu-button';
	};
	topButton.prototype.onClick = function(e){
		_sendmsg__({type:"showplaylist"});
	};
	player.ready(function(){
		var button = new topButton(player);
		player.controlBar.addChild(button);
	});
});
