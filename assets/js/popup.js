(function( $ ){
	$.fn.popup = function(type) {
		$(this).click(function(e){
			var window_height = $(window).height();
			var wrapper = $('<div class="wrapper-popup" style="background-color: rgba(0,0,0,0.6); height: ' + window_height + 'px; width: 100%; position: fixed; top:0px; z-index: 999999;"></div>');
			var content = $('<div class="wrapper-content" style="text-align:center; margin: 0 auto; width: 100%; height: ' + window_height + 'px;"></div>');
			wrapper.append(content);
			$('body').append(wrapper);
			
			$('.wrapper-popup').click(function(e){
				if(e.target.className != 'item'){
					$('.wrapper-popup').remove();
				}
			});
			
			e.preventDefault();
			return false;
		});
		
		if(type == 'image') {			
			$(this).click(function(e){
				var filename = $(this).attr('href');
				var item = $('<img class="item" id="item" style="height: auto; width: auto; max-height: 80%; max-width: 100%;" src="' + filename + '" />');
				$('.wrapper-popup .wrapper-content').append(item);
				adjust();
			});
		}
		
		if(type == 'video') {
			$(this).click(function(e){
				var filename = getfilename($(this).attr('href'));
				var item = $('<video class="item" id="item" style="height: 500px; width: auto; max-width: 80%; max-width: 100%;" controls><source src="' + filename + '.mp4" type="video/mp4"><source src="' + filename + '.ogg" type="video/ogg"></video>');
				$('.wrapper-popup .wrapper-content').append(item);
				adjust();
			});
		}
		
		if(type == 'music') {
			$(this).click(function(e){
				var filename = getfilename($(this).attr('href'));
				var item = $('<audio class="item" id="item" style="height: 50px; width: auto; max-width: 80%; max-width: 100%;" controls><source src="' + filename + '.ogg" type="audio/ogg"><source src="' + filename + '.mp3" type="audio/mpeg"></audio>');
				$('.wrapper-popup .wrapper-content').append(item);
				adjust();
			});
		}
		
		$(window).resize(adjust);
	};
	
	var getfilename = function(url){
		if (url){
			return url.substring(0, url.lastIndexOf("/") + 1) + url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
		}
		
		return "";
	};
	
	var getImageSize = function(img, callback){
		img = $(img);
	
		var wait = setInterval(function(){        
			var w = img.width(),
				h = img.height();
	
			if(w && h){
				done(w, h);
			}
		}, 0);
	
		var onLoad;
		img.on('load', onLoad = function(){
			done(img.width(), img.height());
		});
	
	
		var isDone = false;
		function done(){
			if(isDone){
				return;
			}
			isDone = true;
	
			clearInterval(wait);
			img.off('load', onLoad);
	
			callback.apply(this, arguments);
		}
	}
	
	var adjust = function() {
		getImageSize($('.wrapper-popup .wrapper-content .item'), function(width, height){
			var item_height = height;
			var window_height = $(window).height();
			var window_half = window_height / 2;
			var item_half = item_height / 2;
			$('.wrapper-popup .wrapper-content .item').css('margin-top', (window_half - item_half) + 'px');
			$('.wrapper-popup').css('height', window_height + 'px');
			$('.wrapper-popup .wrapper-content').css('height', window_height + 'px');
		});
	};
})(jQuery);