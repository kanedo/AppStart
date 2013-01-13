function AppStart(){
	var self = this;
	this.host = 'localhost';
	this.port = '8080';
	this.messages = $("#messages");
	this.conn = new AppStartConnection(this.host);
	
	this.addCallbacks = function(){
		//onOpenMessage
		this.conn.onOpenCallback = this.onopen;
		//onCloseMessage
		this.conn.onCloseCallback = this.onclose;
		this.conn.onErrorCallback = this.onclose;
		//refresh Apps
		this.conn.onMessageCallback('apps', this.refreshApps);
	}
	
	this.message = function(e, type){
		var container = this.messages;
		var message = document.createElement('div');
		$(message).addClass('alert');
		if(type !== undefined){
			$(message).addClass(type);
		}
		$(message).html('<button type="button" class="close" data-dismiss="alert">&times;</button><p>'+e+'</p>');
		$(container).prepend(message);
	}
	
	this.onopen = function(){
		self.message('connected', 'alert-success');
	}
	
	this.onclose = function(){
		self.message('disconnected' , 'alert-error');
	}
	
	this.refreshApps = function(data){
		
	}
	
	//set Up the connection
	this.addCallbacks();
	this.conn.connect();
}