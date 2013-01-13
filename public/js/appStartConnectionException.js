function AppStartConnectionException(aMessage, aType){
	this.message = aMessage;
	this.type = (aType == undefined)? 'alert-error' : aType;
}