var host = "localhost";
var port = "8080";
var uri = "/";

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
	window.applicationCache.swapCache();
},false);

window.applicationCache.addEventListener('obsolete',logEvent,false);
window.applicationCache.addEventListener('error',logEvent,false);
jQuery(document).ready(function(){
	
	var appstart = new AppStart();
})

