var host = "localhost";
var port = "8080";
var uri = "/";

function logEvent(event) {
	console.log(event.type);
     // (event.type);
}
function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
window.applicationCache.addEventListener('checking',logEvent,false);
window.applicationCache.addEventListener('noupdate',logEvent,false);
window.applicationCache.addEventListener('downloading',logEvent,false);
window.applicationCache.addEventListener('cached',logEvent,false);
window.applicationCache.addEventListener('updateready',logEvent,false);
window.applicationCache.addEventListener('updateready',function(){
	window.applicationCache.swapCache();
},false);

window.applicationCache.addEventListener('obsolete',logEvent,false);
window.applicationCache.addEventListener('error',logEvent,false);
jQuery(document).ready(function(){
	var appstart = new AppStart();
	function message(e, type){
		var container = $("#messages");
		var message = document.createElement('div');
		$(message).addClass('alert');
		if(type !== undefined){
			$(message).addClass(type);
		}
		$(message).html('<button type="button" class="close" data-dismiss="alert">&times;</button><p>'+e+'</p>');
		$(container).append(message)
		/*<div class="alert">
		  <button type="button" class="close" data-dismiss="alert">&times;</button>
		  <strong>Warning!</strong> Best check yo self, you're not looking too good.
		</div>*/
		
	}
	
	function log(e){
		var span = document.createElement("span");
		$(span).addClass('label label-info');
		$(span).html(e);
		$("#log").append(span);
	}
	var startApp = function(e){
		sendStartAppToServer($(this).attr('data-app'));
		console.log($(this).attr('data-app'));
		return false;
	}
	
	var conn = new WebSocket('ws://'+host+':'+port+uri);
	var theData = jQuery.parseJSON(localStorage['apps']);
	if(theData != null){
		printApps();
	}
	
	function connect(){
		conn = new WebSocket('ws://'+host+':'+port+uri);
	}
	
	var connectClick = function(){
		log('trying to connect...');
		connect();
		return false;
	}
	
	function sendStartAppToServer(name){
		var command = {
			app: name,
			cmd: "start",
		}
		console.log(command);
		conn.send(JSON.stringify(command));
	}
	
	conn.onopen = function(e) {
		message('connection established...', 'alert-success');		
	};
	error = function(e){
		message('Sorry, can\'t connect to server...', 'alert-error');
		console.log(e);
	}
	conn.onclose = error;
	conn.onerror = error;
	conn.onmessage = function(e) {
		//localStorage.setItem('apps', e.data);
		parseJSON(e.data);
	};
	
	function parseJSON(data){
		data = jQuery.parseJSON(data);
		hash = localStorage['hash'];
		if(hash == data.hash){
			console.log('nothing to update');
			printApps(jQuery.parseJSON(localStorage['apps']));
		}else{
			console.log("Uh Oh...something is new...yaiks!");
			localStorage.setItem('hash', data.hash);
			localStorage.setItem('apps', JSON.stringify(data.apps));
			printApps(data.apps);
		}
		
	}
	
	function printApps(data){
		if(data == null || data === undefined){
			return;
		}
		var container = $("#apps");
		if(container.children().length > 0){
			container.empty();
		}
		for(var i = 0; i<data.length; i++){
			var div = makeAppContainer(data[i].name, data[i].icon);
			$(container).append(div);
		}
	}
	
	function makeAppContainer(name, icon){
		var div = document.createElement('div');
		$(div).addClass('span2');
		var a = document.createElement('a');
		$(a).attr('href', '#');
		$(a).attr('data-app', name);
		$(a).click(startApp);
		var img = document.createElement('img');
		$(img).attr('src', "data:image/png;base64,"+icon);
		if(!icon || icon == undefined){
			$(img).attr('src', './img/default-app.png');
		}
		$(a).append(img);
		$(div).append(a);
		var p = document.createElement('p');
		$(p).css('text-align', 'center');
		$(p).text(name);
		$(div).append(p)
		return div;
	}

	$("#refresh").click(function(){
		var command = {
			cmd: "refresh"
		}
		log("refresh...");
		console.log(command);
		conn.send(JSON.stringify(command));
		return false;
	});
	$("#retry").click(function(){
		connectClick();
		return false;
	});
	$("#start-app").click(function(){
		var command = {
			app: "xbmc",
			cmd: "start",
		}
		console.log(command);
		conn.send(JSON.stringify(command));
		return false;
	});
	$(".control").click(function(){
		var command = {
			cmd: 'mediacontrol',
			key: $(this).attr('id')
		}
		console.log(command);
		conn.send(JSON.stringify(command));
		return false;
	});
	$("#sleep").click(function(){
		var c = confirm('Are you sure to send your Mac to sleep?');
		if(c){
			var command = {
				cmd: 'sleep',
			}
			
			conn.send(JSON.stringify(command));
		}
		return false;
	})
})

