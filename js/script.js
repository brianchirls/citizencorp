(function (CORP, window, undefined) {
	"use strict";

	var Popcorn = window.Popcorn,
		document = window.document,
		init,
		popcorn;

	CORP.request = {};
	// Get geolocation
	Popcorn.getJSONP('http://citcorpip.nodejitsu.com', function(data) {
		CORP.request['location'] = data;
		init();
	});

	init = function(){
		popcorn = new Popcorn('#video', {
			frameAnimation: true
		});

		/*
			popcorn.defaults.influenceExplorer = {
				state: 'MD'
			};

			popcorn.influenceExplorer({
				start: 1,
				end: 2
				//state: 'MD'
			});
		*/
	};
	
}(window.CORP || (CORP = {}), window));