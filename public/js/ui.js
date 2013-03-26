jQuery( document ).ready(function($) {
	$(".preferences").hide();
	$(".settings").click(function(){
		$(".preferences").toggle(150);
		return false;
	});
});