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
			dataContainer,
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
					'.popcorn-influenceExplorer-lightbox { display: none; position: absolute; height: 80%; width: 80%; top: 10%; left: 10%; background-color: rgba(255,255,255,0.9); border: white solid 4px; border-radius: 10px; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; min-width: 800px;}\n' +
					'.popcorn-influenceExplorer-lightbox.active { display: block; }\n' +
					'.popcorn-influenceExplorer-lightbox > div { position: relative; width: 100%; height: 100%; padding: 20px; box-sizing: border-box; }\n' +
					'.popcorn-influenceExplorer-lightbox h2 {margin: 0 0 20px 0; border-bottom: #222 solid 1px; padding-bottom: 10px; }\n' +
					'.popcorn-influenceExplorer-lightbox .close { position: absolute; top: 0; right: 10px; margin: 10px; cursor: pointer; }\n' +
					'.popcorn-influenceExplorer-lightbox .parties { width: 240px; float: left; }\n' +
					'.popcorn-influenceExplorer-lightbox .recipients { width: 520px; float: right; }\n' +
					'.popcorn-influenceExplorer-lightbox h3 {margin: 2px 0; }\n' +
					'.popcorn-influenceExplorer-lightbox section + * {clear: both; }\n' +
					'.popcorn-influenceExplorer-lightbox .descr {font-style: italic; color: #444; margin: 0 0 4px 0; }\n' +
					'.popcorn-influenceExplorer-lightbox .recipients .bar { width: 220px; }\n' +
					'.popcorn-influenceExplorer-lightbox .recipients .bar > span { display: inline-block; background-color: #CA5703; height: 100%; }\n' +
					'.popcorn-influenceExplorer-lightbox .comment { clear: both; }\n' +
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
			media.play();
			base.addClass(click, 'active');
			base.removeClass(lightbox, 'active');
		});

	
		e = document.createElement('h2');
		e.appendChild(document.createTextNode(options.orgName));
		lightboxContent.appendChild(e);

		if (options.pacHtml) {
			e = document.createElement('div');
			e.innerHTML = options.pacHtml;
			lightboxContent.appendChild(e);
		}


		lightbox.style.cssText = options.style || '';

		dataContainer = document.createElement('section');
		lightboxContent.appendChild(dataContainer);

		addScript('http://transparencydata.com/api/1.0/aggregates/org/' + options.orgId + '/recipients/party_breakdown.json?cycle=2012&apikey=' + options.apikey, function(data) {
			var pieData = [], i, partiesData = [];

			for (i in data) {
				pieData.push(data[i][1]);
				partiesData.push({
					party: i,
					qty: data[i][0],
					amount: data[i][1]
				});
			}

			if (partiesData.length) {
				parties = document.createElement('div');
				base.addClass(parties, 'parties');
				dataContainer.appendChild(parties);
				parties.innerHTML = '<h3>Disclosed Political Contributions</h3><p class="descr">in dollars. "other" includes 3rd parties and organizations without official party affiliation.</p>';

				refScript('http://cdnjs.cloudflare.com/ajax/libs/d3/2.8.1/d3.v2.min.js', 'd3', function() {
					var svg,
						w = 240, h = 240,
						r = Math.min(w, h) / 2,
						arcs, donut, lines, arc,
						colors = {
							'Democrats': '#0200e6',
							'Republicans': '#e60002'
						};

					svg = d3.select(parties).append('svg:svg')
						.attr('width', w)
						.attr('height', h)
						.append('svg:g')
						.attr('transform', 'translate(' + w / 2 + "," + h / 2 + ')');

					arc = d3.svg.arc().innerRadius(r - 100).outerRadius(r - 20);
					donut = d3.layout.pie().sort(null);

					arc.startAngle(function(d) {
						return d.startAngle;
					});

					arcs = svg.selectAll('path')
						.data(donut(pieData))
						.enter().append('svg:path')
						.attr('fill', function(d, i) {
							//return color(i);
							return colors[partiesData[i].party] || '#000';
						})
						.attr('d', arc);
						//.exit().remove();
					/*
					lines = svg.selectAll('line').data(partiesData);
					lines.enter().append('svg:line')
						.attr('x1', 0)
						.attr('x2', 0)
						.attr('y1', -r - 3)
						.attr('y2', -r - 8)
						.attr('stroke', 'black')
						.attr('transform', function(d) {
							return 'rotate(' + ((d.startAngle + d.endAngle) / 2 * 180/Math.PI) + ')';
						});
					lines.exit();
					*/
				});
			}
		});

		addScript('http://transparencydata.com/api/1.0/aggregates/org/' + options.orgId + '/recipients.json?cycle=2012&apikey=' + options.apikey, function(data) {
			var row, cell, table, i, rec, e, max = 0;

			function renderTable(data, wordField, amountField) {
				var w = [], a = [];
				for (i = 0; i < data.length; i++) {

					if (typeof wordField === 'function') {
						w[i] = wordField(data[i]);
					} else {
						w[i] = data[i][wordField];
					}

					if (typeof amountField === 'function') {
						a[i] = amountField(data[i]);
					} else {
						a[i] = data[i][amountField];
					}

					max = Math.max(max, a[i]);
				}

				table = document.createElement('table');
				recipients.appendChild(table);
				for (i = 0; i < data.length; i++) {
					rec = data[i];
					row = document.createElement('tr');
					table.appendChild(row);
					cell = document.createElement('td');
					cell.appendChild(document.createTextNode(w[i]));
					row.appendChild(cell);

					cell = document.createElement('td');
					cell.appendChild(document.createTextNode('$' + a[i]));
					row.appendChild(cell);

					if (max) {
						cell = document.createElement('td');
						base.addClass(cell, 'bar');
						e = document.createElement('span');
						e.innerHTML = '&nbsp;';
						e.style.width = 100 * a[i] / max + '%';
						cell.appendChild(e);
						row.appendChild(cell);
					}
				}
			}

			if (data && data.length) {
				recipients = document.createElement('div');
				base.addClass(recipients, 'recipients');
				dataContainer.appendChild(recipients);
				recipients.innerHTML = '<h3>Top Recipients</h3><p class="descr">includes contributions from the organization’s employees, their family members, and its political action committee.</p>';
				renderTable(data, function(rec) {
					return rec.name + ((rec.party && rec.state) ? ' ' + rec.party + '-' + rec.state : '');
				}, 'total_amount');

			} else {
				addScript('http://transparencydata.com/api/1.0/aggregates/org/' + options.orgId + '/fec_top_contribs.json?cycle=2012&apikey=' + options.apikey, function(data) {
					recipients = document.createElement('div');
					base.addClass(recipients, 'recipients');
					dataContainer.appendChild(recipients);
					recipients.innerHTML = '<h3>Top Contributors</h3><p class="descr">top donors giving over $100,000</p>';
					renderTable(data, 'contributor_name', 'amount');
				});
			}
		});

		e = document.createElement('div');
		e.innerHTML = '<h3>Dig Deeper</h3>';
		lightboxContent.appendChild(e);

		if (options.html) {
			e = document.createElement('div');
			base.addClass(e, 'comment');
			e.innerHTML = options.html;
			lightboxContent.appendChild(e);
		}

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
