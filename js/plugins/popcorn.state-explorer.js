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

    function addScript(path, options, callback) {
        if (typeof options === 'function'){
            callback = options;
        }

        var url, script, cb, ref;

        url = path.split('?');
        if (!url[1]) {
            url[1] = [];
        } else {
            url[1] = url[1].split('&');
        }

        cb = 'stateExplorer' + Date.now() + '_' + callbackCounter;
        callbackCounter++;
        if (options && options.callbackParameter) {
            url[1].push(options.callbackParameter + '=' + cb);
        }else{
            url[1].push('callback=' + cb);
        }
        window[cb] = function(data) {
            delete window[cb];
            var scriptTag = document.querySelector('#' + cb);
            scriptTag.parentNode.removeChild(scriptTag);
            callback(data);
        };
        url[1] = url[1].join('&');
        url = url.join('?');

        script = document.createElement('script');
        script.src = url;
        script.id = cb;
        ref = document.getElementsByTagName('script')[0];
        ref.parentNode.insertBefore(script, ref);
    }

    Popcorn.basePlugin('stateExplorer' , function(options, base) {
        if (!base.target) {
            return;
        }

        var popcorn = this,
            media = popcorn.media,
            legislatorsURL = 'http://services.sunlightlabs.com/api/legislators.getList.json',
            idCrosswalkURL = 'http://transparencydata.com/api/1.0/entities/id_lookup.json',
            contributionsURL = 'http://transparencydata.com/data/contributions/',
            formHTML = '<form><h3>Explore contributions in your state:</h3> <select><option value="">All States</option></select><a class="right" href="#">x</a><div class="clear"></div></form>',
            resultsHTML = '<div class="results"><table><thead></thead><tbody></tbody><tfoot></tfoot></table><div class="clear"></div></div>',
            el = base.makeContainer(),
            legislators = {},
            states = {'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'}
            ;

        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.setAttribute('type', 'text/css');
            styleSheet.appendChild(
                document.createTextNode(
                    '.popcorn-stateExplorer { display:none; width:90%; height:90%; position:absolute; left: 5%; top: 5%; background:#eee; background:rgba(255,255,255,0.6); border-radius:5px; }\n' +
                    '.popcorn-stateExplorer form { border:1px solid rgba(0,0,0,0.2); padding:0.25em 1em; }\n' +
                    '.popcorn-stateExplorer form * { display:inline-block; }\n' +
                    '.popcorn-stateExplorer.active { display: block; }\n' +
                    '.popcorn-stateExplorer .right { float:right; }\n' +
                    '.popcorn-stateExplorer .left { float:left; }\n' +
                    '.popcorn-stateExplorer .clear { clear:both; }\n'
                )
            );
            document.head.appendChild(styleSheet);
        }

        var init = function(){
            el.innerHTML = formHTML + resultsHTML;
            var selectBox = el.querySelector('form select'),
                    opt
                    ;
                for(var state in states) {
                    opt = null;
                    opt = document.createElement('option');
                    opt.value = state;
                    opt.innerHTML = states[state];
                    selectBox.appendChild(opt);
                }
                loadLegislators();
        },
        loadLegislators = function(){
            addScript(legislatorsURL + '?apikey=' + options.apikey, {callbackParameter: 'jsonp'}, function(data){
                if (! (data && data.response && data.response.legislators)) {
                    return;
                }
                data = data.response.legislators;
                for(var i in data){
                    legislators[data[i]['legislator']['crp_id']] = data[i]['legislator'];
                }
            });
            return;
        },
        loadResultTable = function(state){

        },
        sortContributionsByName = function(a, b){

        },
        sortContributionsByAmount = function(a, b){
            
        }
        ;


        return {
            _setup: function(event, options) {
                init();
            },
            start: function( event, options ) {
                base.addClass(el, 'active');
            },
            end: function( event, options ) {
                base.removeClass(el, 'active');
            },
            _teardown: function( options ) {
            }
        };
    });
})( Popcorn );
