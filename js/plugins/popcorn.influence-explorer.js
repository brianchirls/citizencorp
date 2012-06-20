(function (Popcorn) {

	"use strict";

	var styleSheet, callbackCounter = 0,
		scriptsLoading = {};

	function refScript(path, test, callback) {
		var check, script, ref;

		function runCheck() {
			if (check()) {
				callback();
				return true;
			}
			setTimeout(runCheck, 10);
		}

		if (typeof test === 'function') {
			check = test;
		} else {
			check = function () {
				return !!window[test];
			};
		}

		if (check()) {
			callback();
			return true;
		}

		if (!scriptsLoading[path]) {
			script = document.createElement('script');
			script.src = path;
			ref = document.getElementsByTagName('script')[0];
			ref.parentNode.insertBefore(script, ref);
			scriptsLoading[path] = true;
		}

		setTimeout(runCheck, 10);
	}

	function addScript(path, callback) {
		var url, script, cb, ref;

		url = path.split('?');
		if (!url[1]) {
			url[1] = [];
		} else {
			url[1] = url[1].split('&');
		}

		cb = 'influenceExplorer' + Date.now() + '_' + callbackCounter;
		callbackCounter++;
		url[1].push('callback=' + cb);
		window[cb] = function(data) {
			delete window[cb];
			callback(data);
		};
		url[1] = url[1].join('&');
		url = url.join('?');

		script = document.createElement('script');
		script.src = url;
		ref = document.getElementsByTagName('script')[0];
		ref.parentNode.insertBefore(script, ref);
	}

	Popcorn.basePlugin( 'influenceExplorer' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			lightbox,
			lightboxContent,
			parties, recipients,
			click,
			close,
			e;

		if (!base.target || !options.orgId) {
			return;
		}

		if (!styleSheet) {
			styleSheet = document.createElement('style');
			styleSheet.setAttribute('type', 'text/css');
			styleSheet.appendChild(
				document.createTextNode(
					'.popcorn-influenceExplorer { display: none; position: absolute; width: 100px; height: 100px; right: 5%; bottom: 10%; border: blue solid 4px; background-color: rgba(0,0,255, 0.4); cursor: pointer; border-radius: 10px; }\n' +
					'.popcorn-influenceExplorer-lightbox { display: none; position: absolute; height: 80%; width: 80%; top: 10%; left: 10%; background-color: rgba(255,255,255,0.8); border: white solid 4px; border-radius: 10px; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif}\n' +
					'.popcorn-influenceExplorer-lightbox.active { display: block; }\n' +
					'.popcorn-influenceExplorer-lightbox > div { position: relative; width: 100%; height: 100%; padding: 20px; box-sizing: border-box; }\n' +
					'.popcorn-influenceExplorer-lightbox h2 {margin: 0 0 20px 0; border-bottom: #222 solid 1px; padding-bottom: 10px; }\n' +
					'.popcorn-influenceExplorer-lightbox .close { position: absolute; top: 0; right: 10px; margin: 10px; cursor: pointer; }\n' +
					'.popcorn-influenceExplorer-lightbox .parties { width: 240px; float: left; }\n' +
					'.popcorn-influenceExplorer-lightbox .recipients { width: 520px; float: right; }\n' +
					'.popcorn-influenceExplorer-lightbox h3 {margin: 2px 0; }\n' +
					'.popcorn-influenceExplorer-lightbox .descr {font-style: italic; color: #444; margin: 0 0 4px 0; }\n' +
					'.popcorn-influenceExplorer.active { display: block; }\n'
				)
			);
			document.head.appendChild(styleSheet);
		}

		click = base.makeContainer();
		click.addEventListener('mouseover', function () {
			media.pause();
			base.addClass(lightbox, 'active');
			base.removeClass(click, 'active');
		});

		lightbox = document.createElement('div');
		lightboxContent = document.createElement('div');
		lightbox.appendChild(lightboxContent);
		base.addClass(lightbox, 'popcorn-influenceExplorer-lightbox');
		base.target.appendChild(lightbox);

		close = document.createElement('span');
		base.addClass(close, 'close');
		close.appendChild(document.createTextNode('X')); //todo: replace with image
		lightbox.appendChild(close);
		close.addEventListener('click', function () {
			base.addClass(click, 'active');
			base.removeClass(lightbox, 'active');
		});

		e = document.createElement('h2');
		e.appendChild(document.createTextNode(options.orgName));
		lightboxContent.appendChild(e);

		parties = document.createElement('div');
		base.addClass(parties, 'parties');
		lightboxContent.appendChild(parties);
		parties.innerHTML = '<h3>Republicans vs. Democrats</h3><p class="descr">in dollars. "other" includes 3rd parties and organizations without official party affiliation.</p>';

		recipients = document.createElement('div');
		base.addClass(recipients, 'recipients');
		lightboxContent.appendChild(recipients);
		recipients.innerHTML = '<h3>Top Recipients</h3><p class="descr">includes contributions from the organization’s employees, their family members, and its political action committee.</p>';

		lightbox.style.cssText = options.style || '';

			addScript('http://transparencydata.com/api/1.0/aggregates/org/' + options.orgId + '/recipients.json?cycle=2012&apikey=' + options.apikey, function(data) {
				//var 
				refScript('http://cdnjs.cloudflare.com/ajax/libs/d3/2.8.1/d3.v2.min.js', 'd3', function() {
					var svg = d3.select(parties).append('svg:svg'),
						w = 240, h = 240,
						r = Math.min(w, h) / 2,
						arcs, donut, color, arc;
					svg.attr('width', w);
					svg.attr('height', h);
					svg.append('svg:g').attr('transform', 'translate(' + w / 2 + "," + h / 2 + ')');

					arc = d3.svg.arc().innerRadius(0).outerRadius(r - 20);
					donut = d3.layout.pie().sort(null);
					color = d3.scale.category20();

					arcs = svg.selectAll('path')
						.data(donut(data))
						.enter().append('svg:path')
						.attr('fill', function(d, i) {
							return color(i);
						})
						.attr('d', arc);
				});
			});

			addScript('http://transparencydata.com/api/1.0/aggregates/org/' + options.orgId + '/recipients/party_breakdown.json?cycle=2012&apikey=' + options.apikey, function(data) {
				refScript('http://cdnjs.cloudflare.com/ajax/libs/d3/2.8.1/d3.v2.min.js', 'd3', function() {

				});
			});

		return {
			start: function( event, options ) {
				base.addClass(click, 'active');
			},
			end: function( event, options ) {
				base.removeClass(click, 'active');
				base.removeClass(lightbox, 'active');
			},
			_teardown: function( options ) {
			}
		};
	});
})( Popcorn );
