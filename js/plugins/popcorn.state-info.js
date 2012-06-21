(function (Popcorn) {

	"use strict";

	var styleSheet,
		states = {'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'};

	Popcorn.basePlugin( 'stateInfo' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			lightbox,
			lightboxContent,
			lightboxContainer,
			select,
			close,
			e, i,
			loopEndTime,
			idleStartTime,
			originalVolume,
			touched,
			keyEvent;

		function closeLightbox() {
			popcorn.currentTime(Popcorn.util.toSeconds(options.end));
			media.play();
			//base.removeClass(lightbox, 'active');
		}

		function updateText() {
			var state = select.value;
			lightboxContent.childNodes[0].nodeValue = states[state] + ': ' + options[state] || '';
			touched = Date.now();
		}

		if (!base.target) {
			return;
		}

		if (!styleSheet) {
			styleSheet = document.createElement('style');
			styleSheet.setAttribute('type', 'text/css');
			styleSheet.appendChild(
				document.createTextNode(
					'.popcorn-stateInfo { display: none; position: absolute; height: 80%; width: 80%; top: 10%; left: 10%; background-color: rgba(255,255,255,0.85); border: white solid 4px; border-radius: 10px; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; min-width: 800px;}\n' +
					'.popcorn-stateInfo.active { display: block; }\n' +
					'.popcorn-stateInfo p { margin: 1em 0; }\n' +
					'.popcorn-stateInfo .comment { font-style: italic; }\n' +
					'.popcorn-stateInfo .content { font-size: 1.4em; }\n' +
					'.popcorn-stateInfo > div { position: relative; width: 100%; height: 100%; padding: 62px 20px 20px 20px; box-sizing: border-box; padding: 20px; }\n' +
					'.popcorn-stateInfo h2 { display: inline; margin-bottom: 0; }\n' +
					'.popcorn-stateInfo select { margin: 10px 20px; vertical-align: middle; font-size: 1.1em; }\n' +
					'.popcorn-stateInfo select + * { padding-top: 20px; border-top: #222 solid 1px; }\n' +
					'.popcorn-stateInfo .close { position: absolute; top: 0; right: 10px; margin: 10px; cursor: pointer; }\n' +
					'.popcorn-stateInfo.active { display: block; }\n'
				)
			);
			document.head.appendChild(styleSheet);
		}

		lightbox = base.makeContainer();

		lightboxContainer = document.createElement('div');
		lightbox.appendChild(lightboxContainer);

		close = document.createElement('span');
		base.addClass(close, 'close');
		close.appendChild(document.createTextNode('X')); //todo: replace with image
		lightbox.appendChild(close);
		close.addEventListener('click', closeLightbox, false);

		if (options.title) {
			e = document.createElement('h2');
			e.appendChild(document.createTextNode(options.title));
			lightboxContainer.appendChild(e);
		}

		select = document.createElement('select');
		for (i in options) {
			if (states[i]) {
				e = document.createElement('option');
				e.value = i;
				e.appendChild(document.createTextNode(states[i]));
				select.appendChild(e);
				if (i === options.state) {
					e.setAttribute('selected', '');
				}
			}
		}
		lightboxContainer.appendChild(select);
		select.addEventListener('change', updateText, false);

		if (options.html) {
			e = document.createElement('div');
			base.addClass(e, 'comment');
			e.innerHTML = options.html;
			lightboxContainer.appendChild(e);
		}

		lightboxContent = document.createElement('div');
		base.addClass(lightboxContent, 'content');
		lightboxContent.appendChild(document.createTextNode(states[options.state] + ': ' + options[options.state] || ''));
		lightboxContainer.appendChild(lightboxContent);

		loopEndTime = Popcorn.util.toSeconds(options.end);
		loopEndTime -= Math.min(5, (loopEndTime - Popcorn.util.toSeconds(options.start) / 10));

		keyEvent = function(evt) {
			if (evt.keyCode === 27) {
				closeLightbox();
			}
		};

		return {
			start: function( event, options ) {
				base.addClass(lightbox, 'active');
				window.addEventListener('keydown', keyEvent, true);
				originalVolume = popcorn.volume();
				popcorn.volume(Math.min(0.6, originalVolume));
				touched = false;
				idleStartTime = popcorn.currentTime();
			},
			frame: function(event, options, time) {
				if (popcorn.paused()) {
					return;
				}
				if (touched && Date.now() - touched >= 180000 || !touched && (time - idleStartTime) > 20) {
					popcorn.currentTime(Popcorn.util.toSeconds(options.end));
				} else if (time >= loopEndTime) {
					popcorn.currentTime(Popcorn.util.toSeconds(options.start) + 1);
				}
			},
			end: function( event, options ) {
				base.removeClass(lightbox, 'active');
				popcorn.volume(originalVolume);
				window.removeEventListener('keydown', keyEvent, true);
			},
			_teardown: function( options ) {
			}
		};
	});
})( Popcorn );
