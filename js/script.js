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
			apikey: sunlightAPIKey,
			target: 'video-container'
		});

		popcorn.defaults('stateExplorer', {
			apikey: sunlightAPIKey,
			target: 'video-container',
			state: loc && loc.country_code === 'US' && loc.region_code
		});

		popcorn.influenceExplorer({
			start: 2,
			end: 6,
			orgId: '86656f0dca46422e997aade92cfd0419',
			orgName: 'Americans for Prosperity',
			html: 'Americans for Prosperity spent millions on television ads in Wisconsin in support of Gov. Walker in 2011-2012, according to local television ad buy reports reviewed by the Wisconsin Democracy Campaign. These expenditures are not required to be disclosed publicly.'
		});

		popcorn.influenceExplorer({
			start: 15,
			end: 21,
			orgId: '7416a2e232fa434e99b520d7603e09a9',
			orgName: 'Campaign to Defeat Barack Obama',
			pacHtml: 'The Campaign to Defeat Barack  Obama is a California-based organization formed to defeat President  Barack Obama in the 2012 presidential election.',
			html: 'The Campaign to Defeat Barack Obama is a California-based organization formed to defeat President Barack Obama in the 2012 presidential election. It has not registered to make independent expenditures in Wisconsin elections, even though it sponsored broadcast advertising in the 2011 and 2012 recall elections.'
		});

		popcorn.influenceExplorer({
			start: '5:14',
			end: '5:20',
			orgId: '39738c686ce7438abc98587f651c102f',
			orgName: 'Progressive Change Campaign Cmte',
			html: ''
		});

		popcorn.influenceExplorer({
			start: '5:24',
			end: '5:29',
			orgId: 'a0951518abe24d7a95cb99dac25caf90',
			orgName: 'Restore Our Future',
			html: ''
		});


		popcorn.stateExplorer({
			start: 80,
			end: 120
		});

		/*
			popcorn.defaults.stateExplorer = {
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