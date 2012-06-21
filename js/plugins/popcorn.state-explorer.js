(function (Popcorn) {

    "use strict";

    var styleSheet,
        callbackCounter = 0,
        scriptsLoading = {},
        refScript = function(path, test, callback) {
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
        },
        addScript = function(path, options, callback) {
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
            if (options && options.callback) {
                cb = options.callback;
            }else{
                cb = 'stateExplorer' + Date.now() + '_' + callbackCounter;
            }
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
        ;

    Popcorn.basePlugin('stateExplorer' , function(options, base) {
        if (!base.target) {
            return;
        }

        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.setAttribute('type', 'text/css');
            styleSheet.appendChild(
                document.createTextNode(
                    '.popcorn-stateExplorer { display:none; opacity:0; width:90%; height:90%; position:absolute; left: 5%; top: 5%; background:#eee; background:rgba(255,255,255,0.8); border-radius:5px;' +
                        '-webkit-transition:all 0.25s linear; -moz-transition:all 0.25s linear; -o-transition:all 0.25s linear; transition:all 0.25s linear; }\n' +
                    '.popcorn-stateExplorer form { border:1px solid rgba(0,0,0,0.2); padding:0.25em 1em; }\n' +
                    '.popcorn-stateExplorer form h3, .popcorn-stateExplorer form select { display:inline-block; }\n' +
                    '.popcorn-stateExplorer form p { margin:0 0 0.5em; }\n' +
                    '.popcorn-stateExplorer .results { padding: 4px 1em; height:84%; }\n' +
                    '.popcorn-stateExplorer .results table { width:100%; height:100%; }\n' +
                    '.popcorn-stateExplorer .results table thead tr { display:inline-block; width:100%; }\n' +
                    '.popcorn-stateExplorer .results table th { text-align:left; display:inline-block; }\n' +
                    '.popcorn-stateExplorer .results table tbody { overflow-y:auto; height:100%; display:block; }\n' +
                    '.popcorn-stateExplorer.loading .results table { overflow:auto; opacity:0.4; }\n' +
                    '.popcorn-stateExplorer .results table td.number, .popcorn-stateExplorer .results table th.number { text-align:right; }\n' +
                    '.popcorn-stateExplorer.active { display:block; opacity:1; }\n' +
                    '.popcorn-stateExplorer .right { float:right; }\n' +
                    '.popcorn-stateExplorer .left { float:left; }\n' +
                    '.popcorn-stateExplorer .clear { clear:both; }\n'
                )
            );
            document.head.appendChild(styleSheet);
        }

        var popcorn = this,
            media = popcorn.media,
            legislatorsURL = 'http://services.sunlightlabs.com/api/legislators.getList.json',
            contributionsURL = 'http://d3j189fadzggbl.cloudfront.net/api/1.0/contributions.json?cycle=2012&for_against=for&amount=>|5000&seat=federal:senate|federal:house|federal:president|state:governor&per_page=1000',
            searchURL = 'http://influenceexplorer.com/search',
            formHTML = '<form>\
                        <h3>Explore the largest contributions in your state:</h3>\
                        <select><option value="">Presidential</option></select><a class="close right" href="#">x</a>\
                        <p>Contributions shown are greater than or equal to $5,000, and given during the 2012 election cycle.</p>\
                        <div class="clear"></div>\
                        </form>',
            resultsHTML = '<div class="results">\
                            <table>\
                            <thead><tr>\
                                <th width="25%"><a class="sortable" href="#" data-sortfunction="contributionsByName">Recipient Name</a></th>\
                                <th width="27%"><a class="sortable" href="#" data-sortfunction="contributionsByContributor">Contributor</a></th>\
                                <th width="13%">Seat</th>\
                                <th width="14%"><a class="sortable" href="#" data-sortfunction="contributionsByDate">Date</a></th>\
                                <th class="number"  width="16%"><a class="sortable current desc" href="#" data-sortfunction="contributionsByAmount">Amount</a></th>\
                            </tr></thead>\
                            <tbody></tbody>\
                            <tfoot></tfoot>\
                            </table><div class="clear"></div>\
                            </div>',
            el = base.makeContainer(),
            legislators = {},
            dataset = [],
            states = {'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'},
            races = {'federal:house': 'House', 'federal:senate': 'Senate', 'federal:president': 'Presidential', 'state:governor': 'Governor'},
            loopEndTime,
            idleStartTime,
            originalVolume,
            touched,
            // initializer function
            init = function(){
                el.innerHTML = formHTML + resultsHTML;
                var sortableHeaders = el.querySelectorAll('.results thead th a.sortable');
                for(var i=0; i<sortableHeaders.length; i++){
                    var hdr = sortableHeaders[i];
                    hdr.addEventListener('click', handleSortEvent);
                }

                var selectBox = el.querySelector('form select'),
                    opt
                    ;
                for(var state in states) {
                    opt = null;
                    opt = document.createElement('option');
                    opt.value = state;
                    opt.innerHTML = getState(state);
                    selectBox.appendChild(opt);
                }

                var closeButton = el.querySelector('form a.close');
                closeButton.addEventListener('click', function(evt){
                    evt.preventDefault();
                    base.removeClass(el, 'active');
                });
                // loadLegislators();
                try{
                    selectBox.value = window.CORP.request['location'].region_code;
                }catch(e){}
                selectBox.addEventListener('change', function(evt){
                    try{
                        var state = evt.target.value;
                        loadResultTable(state);
                        touched = Date.now();
                    }catch(e){}
                });

                //set up looping
                loopEndTime = options.end;
                loopEndTime -= Math.min(5, (options.end - options.start / 10));
            },
            // hash accessors
            getState = function(orig){
                return states[orig] || '';
            },
            getRace = function(orig){
                return races[orig] || '';
            },
            // general utils
            cycleClass = function(el, names){
                if(! (typeof names === 'object' && typeof names.push === 'function')){
                    return;
                }
                var idx = -1;
                for(var i in names){
                    if(el.className.search(new RegExp('(^|[\s]*)' + names[i] + '([\s]*|$)')) >= 0 &&
                       names[i] !== ''){
                        idx = parseInt(i, 10);
                    }
                }
                base.removeClass(el, names[idx]);
                if(names[idx + 1] !== undefined){
                    base.addClass(el, names[idx + 1]);
                    return names[idx + 1];
                }else{
                    base.addClass(el, names[0]);
                    return names[0];
                }
            },
            formatMoney = function(n, c, d, t){
                var c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
                return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
            },
            // legislator utils
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
            legislatorsByState = function(state){
                var stateLegislators = {};
                for(var crp_id in legislators){
                    if(legislators[crp_id].state == state){
                        stateLegislators[crp_id] = (legislators[crp_id]);
                    }
                }
                return stateLegislators;
            },
            // query / display helpers
            loadResultTable = function(state){
                var activeRequests = 0,
                    stateLegislators = legislatorsByState(state),
                    requestURL,
                    results = [],
                    handleResult = function(data){
                        for(var i in data){
                            results.push(data[i]);
                        }
                        activeRequests--;
                    },
                    finish = function(){
                        if(activeRequests === 0){
                            base.removeClass(el, 'loading');
                            dataset = results;
                            dataset.sort(sortFunctions.contributionsByAmountDesc);
                            var tbody = el.querySelector('.results table tbody');
                            tbody.innerHTML = '';
                            renderDataset(tbody);
                        }else{
                            setTimeout(finish, 500);
                        }
                    };
                base.addClass(el, 'loading');
                activeRequests++;
                requestURL = contributionsURL + '&recipient_state=' + state + '&apikey=' + options.apikey;
                if(state === ''){
                    requestURL = requestURL.replace('seat=federal:senate|federal:house|federal:president|state:governor', 'seat=federal:president');
                }
                addScript(requestURL, {callback: 'stateExplorer_contributions_' + state}, handleResult);
                // for(var crp_id in stateLegislators){
                //     activeRequests++;
                //     addScript(contributionsURL + '?recipient_ext_id=' + crp_id + '&cycle=2012', handleResult);
                // }
                finish();
            },
            renderDataset = function(target){
                if(target === undefined){
                    target = el.querySelector('.results table tbody');
                }
                target.innerHTML = '';
                for(var i in dataset){
                    var row = document.createElement('tr'),
                        result = dataset[i];
                    result.date = moment(result.date, 'YYYY-MM-DD');
                    row.innerHTML = '<td width="23%"><a href="' + searchURL + '?query=' + encodeURIComponent(result.recipient_name.trim()) + '">' + result.recipient_name + '</a></td>';
                    // if(result.contributor_name != result.organization_name){
                    //     row.innerHTML += '<td><a href="' + searchURL + '?query=' + encodeURIComponent(result.contributor_name) + '">' + result.contributor_name + '</a></td>';
                    // }else{
                    row.innerHTML += '<td width="25%">' + result.contributor_name + '</td>';
                    // }
                    row.innerHTML += '<td width="13%">' + getRace(result.seat) + '</td>' +
                                     '<td width="14%">' + result.date.format('MMM Do, YYYY') + '</td>' +
                                     '<td class="number" width="16%">$' + formatMoney(result.amount, 2, '.', ',') + '</td>';
                    target.appendChild(row);
                }
            },
            // Sorting
            handleSortEvent = (function(evt){
                evt.preventDefault();
                var orderby,
                    order,
                    sortables,
                    siblings,
                    cb;
                sortables = el.querySelectorAll('a.sortable');
                for(var i=0; i<sortables.length; i++){
                    base.removeClass(sortables[i], 'current');
                }
                base.addClass(evt.target, 'current');
                siblings = el.querySelectorAll('a.sortable:not(.current)');
                for(var j=0; j<siblings.length; j++){
                    base.removeClass(siblings[j], 'asc');
                    base.removeClass(siblings[j], 'desc');
                }
                order = {'asc': 'Asc', 'desc': 'Desc'}[cycleClass(evt.target, ['asc', 'desc'])];
                cb = evt.target.getAttribute('data-sortfunction') + order;
                dataset.sort(sortFunctions[cb]);
                renderDataset();

                touched = Date.now();
            }).bind(this),
            sortBy = function(property, a, b, options){
                a = a[property];
                b = b[property];
                if(!isNaN(a)){
                    a = parseFloat(a);
                }
                if(!isNaN(b)){
                    b = parseFloat(b);
                }
                var multiplier = -1;
                options && options.direction && options.direction == 'desc' || (multiplier = 1);
                if(a === b){
                    return 0;
                }else if((a > b) || (b === undefined)){
                    return 1 * multiplier;
                }else{
                    return -1 * multiplier;
                }
            },
            sortFunctions = {
                contributionsByNameAsc: function(a, b){
                    return sortBy('recipient_name', a, b);
                },
                contributionsByNameDesc: function(a, b){
                    return sortBy('recipient_name', a, b, {direction: 'desc'});
                },
                contributionsByContributorAsc: function(a, b){
                    return sortBy('contributor_name', a, b);
                },
                contributionsByContributorDesc: function(a, b){
                    return sortBy('contributor_name', a, b, {direction: 'desc'});
                },
                contributionsByAmountAsc: function(a, b){
                    return sortBy('amount', a, b);
                },
                contributionsByAmountDesc: function(a, b){
                    return sortBy('amount', a, b, {direction: 'desc'});
                },
                contributionsByDateAsc: function(a, b){
                    return sortBy('date', a, b);
                },
                contributionsByDateDesc: function(a, b){
                    return sortBy('date', a, b, {direction: 'desc'});
                },
                contributionsByRaceAsc: function(a, b){
                    return sortBy('seat', a, b);
                },
                contributionsByRaceDesc: function(a, b){
                    return sortBy('seat', a, b, {direction: 'desc'});
                }
            }
            ;


        return {
            _setup: function(event, options) {
                init();
                var state = el.querySelector('form select').value;
                loadResultTable(state);
            },
            frame: function(event, options, time) {
                if (popcorn.paused()) {
                    return;
                }
                if (touched && Date.now() - touched >= 180000 || !touched && (time - idleStartTime) > 20) {
                    popcorn.currentTime(options.end);
                } else if (time >= loopEndTime) {
                    popcorn.currentTime(options.start);
                }
            },
            start: function( event, options ) {
                base.addClass(el, 'active');

                originalVolume = popcorn.volume();
                popcorn.volume(Math.min(0.1, originalVolume));
                touched = false;
                idleStartTime = popcorn.currentTime();
            },
            end: function( event, options ) {
                base.removeClass(el, 'active');
                popcorn.volume(originalVolume);
            },
            _teardown: function( options ) {
            }
        };
    });
})( Popcorn );
