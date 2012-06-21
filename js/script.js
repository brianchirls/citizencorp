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
			pacHtml: 'Americans for Prosperity was founded by billionaire brothers David and Charles Koch, owners of Koch Industries to back conservative issue like small government  and  lower taxes.  The group refuses to disclose how much it spends on outside electioneering activities in Wisconsin and elsewhere through its 501(c)(4) and its 501(c)(3) charitable arms.',
			html: 'Americans for Prosperity spent millions on television ads in Wisconsin in support of Gov. Walker in 2011-2012, according to local television ad buy reports reviewed by the Wisconsin Democracy Campaign. These expenditures are not required to be disclosed publicly.'
		});

		popcorn.influenceExplorer({
			start: 15,
			end: 21,
			orgId: '7416a2e232fa434e99b520d7603e09a9',
			orgName: 'Campaign to Defeat Barack Obama',
			pacHtml: 'The Campaign to Defeat Barack  Obama is a California-based organization formed to defeat President  Barack Obama in the 2012 presidential election.',
			html: 'The Campaign to Defeat Barack Obama  has not registered to make independent expenditures in Wisconsin elections, even though it sponsored broadcast advertising in the 2011 and 2012 recall elections.The group is closely affiliated with prominent national Tea Party activists. Joe Wierzbicki, one of the group\'s leaders explains the group\'s interest in Wisconsin: "The reason we\'ve  been so focused on Wisconsin is that the ramifications of the recall election are huge. There are ten Electoral Votes at stake here in  Wisconsin, and this will likely be one of the most important swing  states come November." (<a href="http://prospect.org/article/campaign-defeat-barack-obama-focused-largely-wisconsin">The Campaign to Defeat Barack Obama, Focused Largely in Wisconsin</a>, The American Prospect, April 25, 2012)'
		});

popcorn.influenceExplorer({
			start: 21,
			end: 24,
			orgName: 'Greater Wisconsin Political Fund',
			pacHtml: 'The Greater Wisconsin Political Fund is a independent political organization, known as a 527, which engages in activities that support public issues, public officials, and  candidates for public office. Sister organizations include the 501(c)(4) issue advocacy group Greater Wisconsin Committee, and a PAC, The Greater Wisconsin Political Action Committee. ',
			html: 'From <a href="http://www.wisdc.org/gwc12recall.php">Wisconsin Democracy Campaign:</a> "Like all phony issue ad  groups, Greater Wisconsin refuses to disclose much of its fundraising  and spending in detail, but it\'s support comes from organized labor and  Democratic ideological groups supported by wealthy business interests.   Greater Wisconsin operates four entities - a political action committee,  a corporate arm that makes independent expenditures, a phony issue ad  group and a 527 group called the Greater Wisconsin Political Fund.." <a href="http://www.wisdc.org/gwc12recall.php">Read More</a>'
		});


popcorn.influenceExplorer({
			start: '4:01',
			end: '4:17',
			orgId: '86656f0dca46422e997aade92cfd0419',
			orgName: 'Americans for Prosperity',
			pacHtml: 'Americans for Prosperity was founded by billionaire brothers David and Charles Koch, owners of Koch Industries to back conservative issue like small government  and  lower taxes.  The group refuses to disclose how much it spends on outside electioneering activities in Wisconsin and elsewhere through its 501(c)(4) and its 501(c)(3) charitable arms.',
			html: 'Americans for Prosperity spent millions on television ads in Wisconsin in support of Gov. Walker in 2011-2012, according to local television ad buy reports reviewed by the Wisconsin Democracy Campaign. These expenditures are not required to be disclosed publicly.'
});

		popcorn.influenceExplorer({
			start: '4:43',
			end: '5:09',
			orgName: 'Greater Wisconsin Political Fund',
			pacHtml: 'The Greater Wisconsin Political Fund is a independent political organization, known as a 527, which engages in activities that support public issues, public officials, and  candidates for public office. Sister organizations include the 501(c)(4) issue advocacy group Greater Wisconsin Committee, and a PAC, The Greater Wisconsin Political Action Committee. ',
			html: 'From <a href="http://www.wisdc.org/gwc12recall.php">Wisconsin Democracy Campaign:</a> "Like all phony issue ad  groups, Greater Wisconsin refuses to disclose much of its fundraising  and spending in detail, but it\'s support comes from organized labor and  Democratic ideological groups supported by wealthy business interests.   Greater Wisconsin operates four entities - a political action committee,  a corporate arm that makes independent expenditures, a phony issue ad  group and a 527 group called the Greater Wisconsin Political Fund.." <a href="http://www.wisdc.org/gwc12recall.php">Read More</a>'
		});
		
		popcorn.influenceExplorer({
			start: '4:43',
			end: '4:17',
			orgId: 'a0951518abe24d7a95cb99dac25caf90',
			orgName: 'Restore Our Future, Inc.',
			pacHtml: 'ABOUT: Restore Our Future is a Super PAC that has raised more than $60 million to help secure the Republican nomination, and the Presidency, for Mitt Romney. <a href="http://reporting.sunlightfoundation.com/outside-spending/committee/restore-our-future-inc/C00490045/">Read More</a> ',
			html: 'Houston, Texas-based home builder Bob Perry has contributed $3,000,000.00 to Restore our Future, making him the largest single contributor.<p>Perry also contributed $500,000 to Gov. Scott Walker. What does he expect in return? <a href=-"http://videos-origin.mozilla.org/serv/webmademovies/silverhacks/citizencorp/tiaciara.webm">See what Scott Walker’s spokeswoman told us:</a>'
		});

		popcorn.influenceExplorer({
			start: '5:15',
			end: '5:20',
			orgId: '39738c686ce7438abc98587f651c102f',
			orgName: 'Progressive Change Campaign Cmte',
			html: 'This Democratic Political Action Committee spent $300,000 in Wisconsin in 2011-2012.'
		});

		popcorn.influenceExplorer({
			start: '5:24',
			end: '5:29',
			orgId: 'a0951518abe24d7a95cb99dac25caf90',
			orgName: 'Restore Our Future',
			html: ''
		});


		popcorn.stateExplorer({
			start: 72.1,
			end: 102.4
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
		window.addEventListener('keyup', function(evt) {
			if (evt.keyCode === 32) {
				if (popcorn.paused()) {
					popcorn.play();
				} else {
					popcorn.pause();
				}
			}
		});
	};

}(window.CORP || (CORP = {}), window));