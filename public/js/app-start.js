function AppStart(options){
	var self = this;
	this.host = 'localhost';
	this.port = '8080';
	this.messages = $("#messages");
	this.conn 
	var cache = localStorage;
	var methods = {
		init : function(options){
			var defaults = {
				'host': window.location.hostname,
				'port': '8080',
			}
			options = $.extend(defaults,options);
			cache['port'] = (cache['port'] == undefined || cache['port'] == "")? options.port : cache['port'];
			cache['host'] = (cache['host'] == undefined || cache['host'] == "")? options.host : cache['host'];
			var user_host = $("#host").val(cache['host']);
			var user_port = $("#port").val(cache['port']);
			self.host = options.host
			self.port = options.host
			self.conn = new AppStartConnection(self.host, self.port);
		},
		error_codes : function(code){
			codes = {
				'not_connected' : 'Sorry, can\'t connect to server...',
				'already_connected' : 'Connection is up and running...',
				'connected' : 'Connection established...',
			};
			var m = codes[code];
			return(m == undefined)? code : m;
		},
		sendCommand : function(command, key, data){
			var cmd = {}
			cmd['cmd'] = command;
			cmd[key] = data;
			try{
				self.conn.sendMessage(cmd);
			}catch(e){
				self.message(methods.error_codes(e.message), e.type)
			}
		},
		paintApp : function(name, icon){
			var div = document.createElement('div');
			$(div).addClass('span2');
			var a = document.createElement('a');
			$(a).attr('href', '#');
			$(a).attr('data-app', name);
			$(a).click(methods.startApp);
			
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
		},		
		paintAppList : function(data, container){
			if(data == null 
				|| data === undefined 
				|| container == undefined 
				|| container == null){
				return;
			}
			if(container.children().length > 0){
				container.empty();
			}
			for(var i = 0; i<data.length; i++){
				if(i%4 == 0){
					var row = document.createElement('div');
					row.className = "row-fluid num"+i;	
					container.append(row);				
				}
				var div = methods.paintApp(data[i].name, data[i].icon);
				$(row).append(div);
				
			}
		},
		paintAppListInit : function(){
			if(cache['hash'] != null
			&& cache['apps'] != null){
				methods.paintAppList(JSON.parse(cache['apps']), $("#apps"));
			}
		},
		startApp : function(){
			var name = $(this).attr('data-app');
			methods.sendCommand('start', 'app', name);
			return false;
		},
		sendMediaKey : function(){
			methods.sendCommand('mediacontrol', 'key', $(this).attr('data-action'));
			return false;
		},
		sleepMac : function(){
			if(confirm('Are you sure to send your Mac to sleep?')){
				methods.sendCommand('sleep', null, null);
			}
			return false;
		},
		sendRefreshRequest : function(){
			methods.sendCommand('refresh');
			return false;
		},
		retryConnect : function(){
			if(self.conn.isConnected()){
				self.message(methods.error_codes('already_connected'), 'success');
			}else{
				self.connect();
			}
			return false;
		},
		updateConnectionDetails : function(e){
			var val = $(this).val();
			var id = $(this).attr('id');
			var old_val = cache[id];
			if(old_val != val){
				cache[id] = val;
				if(id == "host"){
					self.host = val;
				}
				if(id == "port"){
					self.port = val;
				}
			}
			console.log(self);
			methods.retryConnect();
		},
		keypressEvent : function(e){
			console.log(e);
			if (e.keycode == 13) {
			   methods.updateConnectionDetails(e);
			   return false;    //<---- Add this line
			}
		}
	}
	this.addCallbacks = function(){
		//onOpenMessage
		this.conn.onOpenCallback = this.onopen;
		//onCloseMessage
		this.conn.onCloseCallback = this.onclose;
		this.conn.onErrorCallback = this.onclose;
		//refresh Apps
		this.conn.onMessageCallback('apps', this.refreshApps);
		//Media Keys
		$("#refresh").click(methods.sendRefreshRequest)
		$('.control').click(methods.sendMediaKey);
		$('#sleep').click(methods.sleepMac);
		$("#retry").click(methods.retryConnect);
		$("#host").blur(methods.updateConnectionDetails);
		$("#host").keypress(methods.keypressEvent);
		$("#port").blur(methods.updateConnectionDetails);
		$("#port").keypress(methods.keypressEvent);
		
	}
	
	this.message = function(e, type){
		var container = this.messages;
		var child = $('.alert', container);
		if(child.length > 1){
			child.fadeOut(1000, function(){
				child.remove();
			})
		}
		var message = document.createElement('div');
		$(message).addClass('alert');
		if(type !== undefined){
			$(message).addClass('alert-'+type);
		}
		$(message).html('<button type="button" class="close" data-dismiss="alert">&times;</button><p>'+e+'</p>');
		$(container).prepend(message);
	}
	
	this.onopen = function(){
		self.message(methods.error_codes('connected'), 'success');
	}
	
	this.onclose = function(){
		self.message(methods.error_codes('not_connected') , 'error');
	}
	
	this.refreshApps = function(data, click){
		console.log("refresh apps");
		var hash = cache['hash'];
		if(hash != data.hash){ 
			cache['hash'] = data.hash;
			cache['apps'] = JSON.stringify(data.apps);
			methods.paintAppList(data.apps, $("#apps"));
			self.message('Update successfull', 'alert-success');
		}else if(click) {
			self.message('Nothing to update', 'alert');
		}
	}
	this.connect = function(){
		this.conn.host = self.host;
		this.conn.port = self.port;
		this.conn.connect();
		console.log(this.conn);
	}
	
	methods.init(options)
	methods.paintAppListInit();
	//set Up the connection
	this.addCallbacks();
	this.conn.connect();
	
}