(function (CORP, window, undefined) {
	"use strict";

	var Popcorn = window.Popcorn,
		document = window.document,
		init,
		popcorn,
		sunlightAPIKey = '6017dead92a04c288d268d6e1d50a293';

	CORP.request = {};
	// Get geolocation
	CORP.setLocation = function(data) {
		CORP.request['location'] = data;
		init();
	};

	init = function(){
		var loc = CORP.request['location'];

		popcorn = new Popcorn('#video', {
			frameAnimation: true
		});

		popcorn.defaults('influenceExplorer', {
			apikey: sunlightAPIKey
		});

		popcorn.defaults('stateExplorer', {
			apikey: sunlightAPIKey,
			state: loc && loc.country_code === 'US' && loc.region_code
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