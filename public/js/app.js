function logEvent(event) {
	console.log(event.type);
    // alert(event.type);
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
	console.log("swap cache");
	window.applicationCache.swapCache();
},false);

window.applicationCache.addEventListener('obsolete',logEvent,false);
window.applicationCache.addEventListener('error',logEvent,false);
jQuery(document).ready(function(){
	$.getJSON('config.json', function(config) {
		var appstart = new AppStart({
					'host': window.location.hostname,
					'port': config.server.port,
		});
	});
})

