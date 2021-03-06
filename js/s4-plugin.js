var _s4View = null;
var _s4Params = null;

function s4_init (params){
    if (_s4View == null) {
    	Septima.Log.trace({
            eventCategory: 's4',
            eventAction: 's4_init',
            eventLabel: cbInfo.getParam("s4.version") + "@" + cbInfo.getParam("spatialmap.version")
        });
    			
       		_s4Params = params;
       		//Fix some defaults
       		if (typeof _s4Params.view.forcedblurOnSelect === 'undefined'){
       			_s4Params.view.forcedblurOnSelect = false;
       		}
    	
       		if (typeof _s4Params.view.zoomBuffer === 'undefined'){
       			_s4Params.view.zoomBuffer = '100';
       		}
       		
       		if (typeof _s4Params.view.marginToBottom === 'undefined'){
       			_s4Params.view.marginToBottom = 100;
       		}
       		
        	//Get localized strings
        	var inputPlaceHolder = cbInfo.getString('s4.input.placeholder');
        	var matchPhrase = cbInfo.getString('s4.list.matchphrase');
        	var detailsbuttonCaption = cbInfo.getString('s4.detailsbutton.caption');

        	var searchIndexToken = null;
        	
        	if ((_s4Params.plansearcher && _s4Params.plansearcher.enabled) || (_s4Params.cvrsearcher && _s4Params.cvrsearcher.enabled)){
            	var searchIndexTokenParamName = 's4.searchchindex.token';
            	searchIndexToken = cbInfo.getParam(searchIndexTokenParamName);
            	if (searchIndexToken === searchIndexTokenParamName){
            		//getParam returns paramName if param isn't defined
            		searchIndexToken = null;
            	}
        	}
        	
        	var sessionId = cbKort.sessionId;

            //Set up search input box
            var inputContainer = jQuery('<div type="text" id="s4box" name="s4box" class="inputcontainer"/>');
                if (jQuery("#panel-brand div.right").length > 0){
                	if (jQuery("li[id^=s4-plugin]") && typeof params.panel !== 'undefined' && params.panel === 'tool' ){
                    	var menuItem = jQuery("li[id^=s4-plugin]");
                    	menuItem.empty();
                    	menuItem.addClass("inpucontainer-spacer");
                    	jQuery("body").append(inputContainer);
                	}else{
                        var panel = 'panel-brand';
                        if (jQuery("#panel-brand").is(":visible") === false || jQuery("#panel-brand").height()<30) {
                            panel = 'panel-middle';
                        }
                        if (typeof params.panel !== 'undefined' && params.panel !== 'default') {
                            panel = params.panel;
                        }

                    	if (jQuery("li[id^=s4-plugin]")){
                        	var menuItem = jQuery("li[id^=s4-plugin]");
                        	menuItem.remove();
                    	}
                        inputContainer.addClass('in-'+panel);
                        
                        if (panel === 'panel-brand'){
                            //Add spacer
                            jQuery("#panel-brand div.right").append('<div class="inpucontainer-spacer"></div>');
                            jQuery("#panel-brand div.right").append(inputContainer);
                        } else if (panel === 'panel-middle'){
                            //Add spacer
                            jQuery('#panel-middle > .inner.right > .midnav').append('<li class="inpucontainer-spacer"></li>');
                            jQuery('#panel-middle > .inner.right').append(inputContainer);
                            
                            if (cbKort.themeSelector && cbKort.themeSelector.panels) {
                                var panel = cbKort.themeSelector.panels["panel-themes-headerleft"];
                                if (panel) {
                                    var button = panel.getButton('theme_store_setting');
                                    button.element.click(function () {
                                        if (cbKort.themeSelector.editMode) {
                                            jQuery('#s4box').hide();
                                        } else {
                                            jQuery('#s4box').show();
                                        }
                                    });
                                }
                            }                        
                        } else if (panel === 'panel-top'){
                            jQuery('#panel-top > .inner.right > .topnav').append('<li class="inpucontainer-spacer"></li>');
                            jQuery('#panel-top > .inner.right').append(inputContainer);
                        } else if (panel === 'menu'){
                            jQuery('#panel-middle > .inner.left > .midnav').append('<li class="inpucontainer-spacer"></li>');
                            jQuery('#panel-middle > .inner.left').append(inputContainer);
                        }else {
                        	if (panel.indexOf('panel-middle') > -1){
                                jQuery(panel).append('<li class="inpucontainer-spacer"></li>');
                        	}else{
                                jQuery(panel).append('<div class="inpucontainer-spacer"></div>');
                        	}
                        	jQuery(panel).append(inputContainer);
                        }
                	}
                    

                    //Place inputcontainer according to the spacer
                    inputContainer.offset(jQuery('.inpucontainer-spacer').offset());
                    //Compensate for a delay in Chrome
                    setTimeout(function () {
                        jQuery('#s4box').offset(jQuery('.inpucontainer-spacer').offset());
                    },500);

                    //onResize: Place inputcontainer according to the spacer
                    jQuery(window).resize(function () {
                        setTimeout(function () {
                            jQuery('#s4box').offset(jQuery('.inpucontainer-spacer').offset());
                        },100);
                    });

                }else{
                    jQuery("body").append(inputContainer);
                    inputContainer.addClass("v263");
                }

            //Create controller
        	var blankBehavior = "search";
        	if (_s4Params.view.blankbehavior && _s4Params.view.blankbehavior == "none"){
        		blankBehavior = "none";
        	}
        	var controllerOptions = {blankBehavior: blankBehavior};
        	var controller = new Septima.Search.Controller([], controllerOptions);
        	
        	//Set up the API
			//Create array of "OnSelect" listeners if not already created
			window["_s4OnSelect"] = window["_s4OnSelect"] || [];
			window["_s4Searchers"] = window["_s4Searchers"] || [];
			//Example:
			//window["_s4CustomButtons"].push({"buttonText":"xxxxx", "buttonImage": "url","callBack": function, "searcher": ["geosearcher"|"cvrsearcher"|"plansearcher"|"indexsearcher"|"themesearcher"|"profilesearcher"|"favoritesearcher"|"workspacesearcher"][, "target": ""]});
			window["_s4CustomButtons"] = window["_s4CustomButtons"] || [];

			
            if (_s4Params.dawasearcher && _s4Params.dawasearcher.enabled){
            	var dawaSearcherOptions = {onSelect: s4DawaHit, matchesPhrase: matchPhrase};
            	if (_s4Params.municipality != "*"){
            		var municipalities = _s4Params.municipality.split(' ');
            		dawaSearcherOptions.kommunekode = municipalities.join('|');
            	}
            	if (_s4Params.dawasearcher.minimumShowCount){
            		dawaSearcherOptions.minimumShowCount = _s4Params.dawasearcher.minimumShowCount;
            	}
            	var dawaSearcher = new Septima.Search.DawaSearcher(dawaSearcherOptions);
            	controller.addSearcher({"title": "Adresser", "searcher" : dawaSearcher});
                _s4Params.dawasearcher.searcher = dawaSearcher;
                
                _s4Params.adressSearcher = dawaSearcher;
            }
			
            if (_s4Params.indexsearcher && _s4Params.indexsearcher.enabled){
            	var s4IndexSearcherOptions = {onSelect: s4Hit, datasources: _s4Params.indexsearcher.datasources, matchesPhrase: matchPhrase, allowDetails: _s4Params.indexsearcher.allowDetails};
                if (_s4Params.indexsearcher.blankbehavior){
                	s4IndexSearcherOptions.blankBehavior = _s4Params.indexsearcher.blankbehavior;
                }
            	var s4IndexSearcher = new Septima.Search.S4IndexSearcher(s4IndexSearcherOptions);
            	controller.addSearcher({title: "", searcher: s4IndexSearcher});
                _s4Params.indexsearcher.searcher = s4IndexSearcher;
            }
        	
            if (_s4Params.geosearcher && _s4Params.geosearcher.enabled){
            	var gstAuthParams= s4_getGstAuthParams();
            	if (gstAuthParams != null){
                	var geoSearchOptions = {
                			targets: _s4Params.geosearcher.targets,
                			authParams: gstAuthParams,
                		    onSelect: s4GeoHit, matchesPhrase: matchPhrase
                	};
                	if (_s4Params.geosearcher.geometrybehavior && _s4Params.geosearcher.geometrybehavior == 'centroid'){
                		geoSearchOptions.returnCentroid = true;
                	}
                	if (_s4Params.municipality != "*"){
                		var municipalities = _s4Params.municipality.split(' ');
                		for (var i=0;i<municipalities.length;i++){
                			municipalities[i] = "muncode0" + municipalities[i]; 
                		}
                		geoSearchOptions.area = municipalities.join();
                	}
                	var geoSearcher = new Septima.Search.GeoSearch(geoSearchOptions);
                	controller.addSearcher({"title": "", "searcher" : geoSearcher});
                    _s4Params.geosearcher.searcher = geoSearcher;
            	}
            }

            //Collect searchers that have been pushed until now
			var _s4Searchers = window["_s4Searchers"];
			for (var i = 0;i<_s4Searchers.length;i++){
				var searcherReg = _s4Searchers[i];
				controller.addSearcher(searcherReg);
			}
			//Prepare for future pushes
			window["_s4Searchers"] = {
					controller: controller,
					push: function (searcherReg) {
						this.controller.addSearcher(searcherReg);
					}
			};
            
            if (_s4Params.plansearcher && _s4Params.plansearcher.enabled && searchIndexToken !== null){
            	var planSearchOptions = {onSelect: s4Hit, matchesPhrase: matchPhrase, searchindexToken: searchIndexToken};
            	if (_s4Params.municipality != "*"){
            		var municipalities = _s4Params.municipality.split(' ');
            		planSearchOptions.filter = { 'komnr' : municipalities };
            	}
            	var planSearcher = new Septima.Search.PlanSearcher(planSearchOptions);
            	controller.addSearcher({"title": "Lokalplaner", "searcher" : planSearcher});
                _s4Params.plansearcher.searcher = planSearcher;
            }
        	
            if (_s4Params.cvrsearcher && _s4Params.cvrsearcher.enabled && searchIndexToken !== null){
            	var cvr_enhedSearchOptions = {onSelect: s4Hit, matchesPhrase: matchPhrase, searchindexToken: searchIndexToken};
            	if (_s4Params.municipality != "*"){
            		var municipalities = _s4Params.municipality.split(' ');
            		cvr_enhedSearchOptions.filter = { 'beliggenhedsadresse_kommune_kode' : municipalities };
            	}
            	var se = new Septima.Search.CVR_enhedSearcher(cvr_enhedSearchOptions);
            	controller.addSearcher({"title": "Virksomheder", "searcher" : se});
                _s4Params.cvrsearcher.searcher = se;
            }
        	
            if ((_s4Params.themesearcher && _s4Params.themesearcher.enabled) || (_s4Params.clientsearcher && _s4Params.clientsearcher.enabled)){
	            var themeSearcher = new Septima.Search.ThemeSearcher({onSelect: themeHit, matchesPhrase: matchPhrase});
	            controller.addSearcher({"title": cbInfo.getString('s4.themesearcher.themes'), "searcher" : themeSearcher});
                _s4Params.themesearcher.searcher = themeSearcher;
            }

            if (_s4Params.workspacesearcher && _s4Params.workspacesearcher.enabled && typeof workspace_init !== 'undefined'){
            	var workspaceSearcher = new Septima.Search.workspaceSearcher({
        			host: "",
        			onSelect: workspaceHit,
            		singular: cbInfo.getString('s4.workspacesearcher.workspace'),
            		plural: cbInfo.getString('s4.workspacesearcher.workspaces'),
            		sessionId: sessionId,
            		matchesPhrase: matchPhrase
        		});
            	controller.addSearcher({title: cbInfo.getString('s4.workspacesearcher.workspaces'), searcher: workspaceSearcher});
                _s4Params.workspacesearcher.searcher = workspaceSearcher;
            }

            if (typeof(ProfileSelector) != 'undefined' && _s4Params.profilesearcher && _s4Params.profilesearcher.enabled){
            	var profileSearcher = new Septima.Search.ProfileSearcher({
        			host: "",
        			onSelect: profileHit,
            		singular: cbInfo.getString('s4.profilesearcher.profile'),
            		plural: cbInfo.getString('s4.profilesearcher.profiles'),
            		sessionId: sessionId,
            		matchesPhrase: matchPhrase
        		});
            	controller.addSearcher({title: cbInfo.getString('s4.profilesearcher.profiles'), searcher: profileSearcher});
                _s4Params.profilesearcher.searcher = profileSearcher;
            }
            
            if (typeof(Favorites) != 'undefined' && _s4Params.favoritesearcher && _s4Params.favoritesearcher.enabled){
            	var favoriteSearcher = new Septima.Search.FavoriteSearcher({
        			host: "",
        			onSelect: favoriteHit,
            		singular: cbInfo.getString('s4.favoritesearcher.favorite'),
            		plural: cbInfo.getString('s4.favoritesearcher.favorites'),
            		sessionId: sessionId,
            		matchesPhrase: matchPhrase
        		});
        		controller.addSearcher({title: cbInfo.getString('s4.favoritesearcher.favorites'), searcher: favoriteSearcher});
                _s4Params.favoritesearcher.searcher = favoriteSearcher;
            }

            //Collect custom buttons that have been pushed until now
			var _s4CustomButtons = window["_s4CustomButtons"];
			for (var i = 0;i<_s4CustomButtons.length;i++){
				var customButton = _s4CustomButtons[i];
				if (customButton.searcher && _s4Params[customButton.searcher] && _s4Params[customButton.searcher].searcher){
					_s4Params[customButton.searcher].searcher.addCustomButtonDef(customButton);
				}
			}
			//Prepare for future pushes
			window["_s4CustomButtons"] = {
					push: function (customButton) {
						if (customButton.searcher && _s4Params[customButton.searcher] && _s4Params[customButton.searcher].searcher){
							_s4Params[customButton.searcher].searcher.addCustomButtonDef(customButton);
						}
					}
			};
        	
            //Create view 
        	_s4View = new Septima.Search.DefaultView({
        		input:"s4box",
        		placeholder:inputPlaceHolder,
        		limit: _s4Params.view.limit,
        		detailsButtonCaption: detailsbuttonCaption,
        		controller: controller});
        	
        	s4SetMaxHeight();
        	
        	jQuery(window).resize(function() {
        		s4SetMaxHeight();
        	});
        	
			cbKort.mapObj.map.events.register("mousedown",cbKort.mapObj.map,function(e){
				_s4View.blur(_s4Params.view.forcedblurOnSelect);
			}, true);
			
        	if (_s4Params.view.autofocus){
                setTimeout(Septima.bind(function (_s4View) {
            	_s4View.focus();
                }, this, _s4View),500);
        	}
    }
}

function s4SetMaxHeight(){
	if (_s4View != null && _s4View.top() !=null){
		_s4View.setMaxHeight(jQuery(window).height() - _s4View.top() - _s4Params.view.marginToBottom);
	}
}

function s4GeoHit(result){
	if (result.data.type != 'streetNameType' || (result.data.type == 'streetNameType' && _s4Params.streetNameHit)){
    	if (_s4Params.geosearcher.geometrybehavior && _s4Params.geosearcher.geometrybehavior == 'zoom' && (result.data.type == "kommune" || result.data.type == "opstillingskreds" || result.data.type == "politikreds" || result.data.type == "postdistrikt" || result.data.type == "region" || result.data.type == "retskreds" || result.data.type == "stednavn")){
    		s4Hit(result, "zoom");
    	}else{
    		s4Hit(result);
    	}
	}
}

function s4DawaHit(result){
	if (result.data.type != 'vej' || (result.data.type == 'vej' && _s4Params.streetNameHit)){
    	if (_s4Params.geosearcher.geometrybehavior && _s4Params.geosearcher.geometrybehavior == 'zoom' && (result.data.type == "kommune" || result.data.type == "opstillingskreds" || result.data.type == "politikreds" || result.data.type == "postdistrikt" || result.data.type == "region" || result.data.type == "retskreds" || result.data.type == "stednavn")){
    		s4Hit(result, "zoom");
    	}else{
    		s4Hit(result);
    	}
	}
	
}

function s4Hit(result, geometryBehavior){
	//geometryBehavior: ['zoom']
	cbKort.events.fireEvent('S4', {type: 's4Hit', result: result});
    for (var i = 0; i < _s4OnSelect.length;i++){
		if (!_s4OnSelect[i](result)){
			return;
		}
	}
	if (result.geometry){
	    if (geometryBehavior !== 'undefined' && geometryBehavior == 'zoom'){
	        zoomToResultInMap(result);
	    }else{
	        showResultInMap(result);
	    }
	}
}

function zoomToResultInMap(result){
	if (result.geometry){
		var geojson = new OpenLayers.Format.GeoJSON();
	    var olGeom = geojson.read(result.geometry, 'Geometry');

	    cbKort.dynamicLayers.removeAll();
	    
	    var bounds = olGeom.getBounds();
	    var extent = 
        {  x1: bounds.left,
           y1: bounds.top,
           x2: bounds.right,
           y2: bounds.bottom
        };   
		
		cbKort.mapObj.zoomToExtent(extent, 100);
	}
    _s4View.blur(_s4Params.view.forcedblurOnSelect);
}

function showResultInMap(result){
	if (result.geometry){
		var geojson = new OpenLayers.Format.GeoJSON();
	    var olGeom = geojson.read(result.geometry, 'Geometry');
		var wkt = olGeom.toString();

	    cbKort.dynamicLayers.addWKT ({name: _s4Params.view.dynamiclayer, wkt:wkt, clear:true});
	    cbKort.dynamicLayers.zoomTo (_s4Params.view.dynamiclayer, _s4Params.view.zoomBuffer);
	}
    _s4View.blur(_s4Params.view.forcedblurOnSelect);
}

function themeHit(result){
    _s4View.blur(_s4Params.view.forcedblurOnSelect);
    if (!result.data.theme.visible){
        result.searcher.toggleTheme(result);
    	cbKort.events.fireEvent('S4', {type: 'themeHit', theme: result.data});
    }
}

function favoriteHit(hit){
    _s4View.blur(_s4Params.view.forcedblurOnSelect);
	if (Favorites){
		Favorites.load(hit.data);
	}
	cbKort.events.fireEvent('S4', {type: 'favoriteHit', favorite: hit.data});
}

function profileHit(hit){
    _s4View.blur(_s4Params.view.forcedblurOnSelect);
	if (ProfileSelector){
		ProfileSelector.setProfile(hit.data);
	}
	cbKort.events.fireEvent('S4', {type: 'profileHit', profile: hit.data});
}

function workspaceHit(result){
    _s4View.blur(_s4Params.view.forcedblurOnSelect);
	result.searcher.showWorkSpace(result);
	cbKort.events.fireEvent('S4', {type: 'workspaceHit', workspace: result.data});
}

function s4DoInfo(result){
    showResultInMap(result);
    searchlast2.showDialog(result.title);
	cbKort.events.fireEvent('S4', {type: 's4DoInfo', result: result});
}

function s4DoPrint(result){
	if(typeof printObject !== 'undefined'){
		printObject.closeHandler();
	}
    showResultInMap(result);
	
	print_getConfig(_s4Params.view.printconfig);
	var freetext_print_input = jQuery('#' + _s4Params.view.printconfig + '_freetext_print_input');
	if (freetext_print_input.length == 1){
		freetext_print_input.val(result.title);
	}else{
		setTimeout(function(){jQuery('#' + _s4Params.view.printconfig + '_freetext_print_input').val(result.title);}, 500);
	}
	cbKort.events.fireEvent('S4', {type: 's4DoPrint', result: result});
}

function s4_getGstAuthParams(){
	var login = cbInfo.getParam('s4.gst.login');
	var password = cbInfo.getParam('s4.gst.password');
	return {login: login, password: password};
}

function Searchlast2()
{
    this.dialog;
    this.resultpage = 'spatialquery-getresult-html';
    this.defaultText = null;
    this.searchText = null;
}
Searchlast2.prototype.createDialog = function()
{
    if(!this.dialog)
    {
    	this.defaultText = cbInfo.getString('spatialquery.lastdisplayed.hint');
        this.dialog = new Dialog(cbInfo.getString('spatialquery.lastdisplayed.dialogtitle'));
        var h = '<table class="divtable" style="width:100%">' +
                '    <tr align="left">' +
                '        <td colspan="2" id="Searchlast2_searchtext">'+this.defaultText+'</td>' +
                '    </tr>' +
                '    <tr> ' +
                '      <td colspan="2"><span id="Searchlast2_options"></td>' +
                '    </tr>' +
                '    <tr style="height:5px"><td></td></tr>' +
                '    <tr align="right">' +
                '        <td colspan="2">' +
                '            <button class="menubutton" onclick="searchlast2.search();">'+cbInfo.getString('standard.button.ok')+'</button>' +
                '        </td>' +
                '    </tr>' +
                '</table>';
        this.dialog.addContentHTML(h);
    }
    getElement('Searchlast2_options').innerHTML = spatialqueryoptions.getOptionDialogContent();
}
Searchlast2.prototype.showDialog = function(searchtext)
{
    this.createDialog();
    
	if (searchtext) {
		this.searchText = searchtext;
	    getElement('Searchlast2_searchtext').innerHTML = cbInfo.getString('spatialquery.show_info_about')+' '+this.searchText;
	} else {
		this.searchText = null;
	    getElement('Searchlast2_searchtext').innerHTML = this.defaultText;
	}
        
    this.dialog.showDialog();
}
Searchlast2.prototype.closeDialog = function()
{
    if (this.dialog) {
        this.dialog.hideDialog();
    }
}
Searchlast2.prototype.search = function()
{
    showWaitingBox(cbInfo.getString('standard.message.getting_data'));
    
    this.closeDialog();
    
    var params = {
	    page: this.resultpage,
	    profilequery: 'userdatasource',
	    currentscale:cbKort.getCurrentScale(),
	    layers: cbKort.getLayers()
    };
    params = spatialqueryoptions.getOptionParams(params);
    
    for(var i=0;i < spatialquery_paramHandlers.length;i++)
    {
        var p = spatialquery_paramHandlers[i]();
        params[p.name] = p.value;
    }
    var url = cbKort.getUrl (params);
    
    var searchtext = (this.searchText || cbInfo.getString('spatialquery.lastdisplayed.searchtext'));
    spatialquery_doQuery("userdatasource", url, searchtext, null);
    
    hideWaitingBox();
}
var searchlast2 = new Searchlast2();

