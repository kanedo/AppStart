function AppStartConnection(host, port, uri){
	var self = this;
	this.host = (host === undefined)?'localhost':host;
	this.port = '8080';
	this.uri = '/';
	
	this.conn = null;
	
	this.callbacks = [];
	this.onOpenCallback = null;
	this.onCloseCallback = null;
	this.onErrorCallback = null;
	
	this.onopen = function(e){
		console.log('connected');
		if(self.onOpenCallback != null){
			self.onOpenCallback();
		}
	}
	this.onclose = function(e){
		console.log('connection closed');
		if(self.onCloseCallback != null){
			self.onCloseCallback();
		}
	}
	this.onerror = function(e){
		console.log('something went terribly wrong');
		if(self.onErrorCallback != null){
			self.onErrorCallback();
		}
	}
	
	this.close = function(){
		this.conn.close();
	}
	
	this.onmessage = function(e){
		console.log('Uh Oh yikes');
		var data = self.parseMessage(e.data);
		for(var i = 0; i< self.callbacks.length; i++){
			if(self.callbacks[i].trigger == data.cmd){
				self.callbacks[i].method(data);
			}
		}
	}
	
	this.connect = function(){
		this.conn = new WebSocket('ws://'+this.host+':'+this.port+this.uri);
		this.conn.onopen = this.onopen;
		this.conn.onclose = this.onclose;
		this.conn.onerror = this.onerror;
		this.conn.onmessage = this.onmessage;
	}
	
	this.parseMessage = function(data){
		return jQuery.parseJSON(data);
	}
	
	this.onMessageCallback = function(trigger, method){
		this.callbacks.push({
			'trigger': trigger,
			'method' : method
		});
	}
	
	this.sendMessage = function(message){
		return this.conn.send(JSON.stringify(message));
	}
}