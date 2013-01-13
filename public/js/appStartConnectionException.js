function AppStartConnectionException(aMessage, aType){
	this.message = aMessage;
	this.type = (aType == undefined)? 'error' : aType;
}