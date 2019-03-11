jQuery(document).ready(function($){
	$('div.buildtable').each(function() {
		$(this).find('>div.half').wrap('<td />');
		$(this).find('>td').each(function(i) {
			if(i%2){
				$(this).prev().andSelf().css('vertical-align','middle');
				$(this).prev().css('width','250px');
				$(this).prev().andSelf().wrapAll("<tr />");
			}
		});
		$(this).find('>div.full').wrap('<tr><td colspan="2"></td></tr>');
		$(this).find('>tr').wrapAll('<table class="table table-bordered" />');
	});
});