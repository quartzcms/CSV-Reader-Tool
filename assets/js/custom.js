// JavaScript Document

$(document).on('change', ':file', function() {
	var input = $(this),
		numFiles = input.get(0).files ? input.get(0).files.length : 1,
		label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [numFiles, label]);
});

$(document).ready( function() {
	$(':file').on('fileselect', function(event, numFiles, label) {
		console.log(numFiles);
		console.log(label);
	});
	
	$.fn.execute_refresh = function() {
		$(this).each(function(index, element) {
			$(element).off();
			$(element).on('change', function(e){
				$this = $(this);
				$this.parent().find('.input-value').html($this.val());
			});
		});
		
		$('.body-content .table_content tbody tr').each(function(index1, element1){
			$(element1).find('td.contain-input').each(function(index2, element2){
				$(element2).find('input.input-row').attr('name', 'col['+ (index1 + 1) +']['+ index2 +']');
			});
		});
		
		/* Add key column */
		var i = 0;
		$('.body-content .table_content tbody tr').each(function(index1, element1){
			var new_index = $(element1).find('td:nth-child(1)');
			new_index.html('');
			new_index.append('<label class="label label-success">' + i + '</label>');
			new_index.append('<a class="clone_row" data-value="'+ i + '"><span class="glyphicon glyphicon-duplicate"></span></a>');
			new_index.append('<a class="delete_row" data-value="'+ i + '"><span class="glyphicon glyphicon-remove"></span></a>');
			new_index.append('<a class="move"><span class="glyphicon glyphicon-move"></span></a>');
			i = i + 1;
		});
	}
	
	$('body').delegate('a.clone_row', 'click', function(e){
		$value = $(this).attr('data-value');
		var row = $('.body-content .table_content tbody tr:eq(' + $value + ')').clone();
		row.appendTo('.body-content .table_content');
		
		rows_count = $('.body-content .table_content tbody tr').length;
		$('.body-content .table_content tbody tr:nth-child(' + rows_count +')').find('td.contain-input').each(function(index1, element1){
			$(element1).html('<div class="input-value" style="display:none;">' + $(element1).text() + '</div><input type="text" value="' + $(element1).text() + '" name="col['+ rows_count +']['+ index1 +']" class="input-row" />');
		});
		
		$('.body-content .table_content .input-row').execute_refresh();
	});
	
	$('body').delegate('a.delete_row', 'click', function(e){
		$value = $(this).attr('data-value');
		var row = $('.body-content .table_content tbody tr:eq(' + $value + ')').remove();
		
		$('.body-content .table_content .input-row').execute_refresh();
	});
	
	$('.save').on('click', function(e){
		$('.body-content .save_file input[type="submit"]').click();
	});
	
	$('body').delegate('form', 'submit', function(e){
		e.preventDefault();
		var form = $(this);
		var formData = new FormData($(this)[0]);
		
		if(form.hasClass('new_file')) {
			var file = $(this).find('.file').get(0).files[0];
			var action = $(this).find('.action').val();
			var newFileName = file.name;
			var extension = newFileName.split('.').pop();
			var md5_encrypted = String(CryptoJS.MD5(newFileName));
			newFileName = md5_encrypted.slice(1, 7) + '.' + extension;
			var formData = new FormData();
			formData.append('file', file, newFileName);
			formData.append('action', action);
		}
		$.ajax({
			type: "POST",
			enctype: 'multipart/form-data',
			url: $(this).attr('action'),
			data: formData,
			processData: false,
  			contentType: false,
			dataType: "json",
			success: function (data) {
				$('.body-content').html('');
				if(data.html) {
					$('.body-content').prepend('<div>' + data.html + '</div>');
				}
				if(form.hasClass('new_file')) {
					$('form.load').find('input[type="submit"]').attr('disabled', 'disabled');
					$('form.load').find('input[name="filename"]').val(data.file);
					$('form.delete_file').find('input[name="filename"]').val(data.file);
					if(data.file != 'none'){
						$('ul li.filename').html(data.file);
						$('ul li a.download').attr('href', '/cgi-bin/' + data.file);
						$('form.load').find('input[type="submit"]').removeAttr('disabled');
					}
					form.trigger("reset");
				} else if (form.hasClass('save_file')){ 
					$('form.load').find('input[type="submit"]').removeAttr('disabled');
				} else if (form.hasClass('delete_file')){
					$('ul li.filename').html(''); 
					$('form.load').find('input[type="submit"]').attr('disabled', 'disabled');
				} else if (form.hasClass('load')){
					$('form.load').find('input[type="submit"]').attr('disabled', 'disabled');
					var filename = $('form.load').find('input[name="filename"]').val();
					$('.body-content').prepend('<form class="save_file" action="functions/save.php" method="post"><table class="table table_content"></table><input type="submit" class="btn-primary btn" value="Save" /><input type="hidden" value="' + filename +'" name="file" /></form>');
					$('.body-content .table_content').htmlson({
						data: JSON.parse(data.table)
					});
					
					$('.body-content .table_content tbody').sortable({
							animation: 150,
							scroll: true,
							handle: '.move',
							out: function () {
								$('.body-content .table_content .input-row').execute_refresh();
							}
						}
					);
					
					$('.body-content .table_content td, .body-content .table_content th').addClass('contain-input');
					
					$('.body-content .table_content thead tr').each(function(index1, element1){
						$(element1).find('th.contain-input').each(function(index2, element2){
							$(element2).html('<div class="input-value" style="display:none;">' + $(element2).text() + '</div><input type="text" value="' + $(element2).text() + '" name="col_index['+ index1 +']['+ index2 +']" class="input-row" />');
						});
					});
					
					$('.body-content .table_content tbody tr').each(function(index1, element1){
						$(element1).find('td.contain-input').each(function(index2, element2){
							$(element2).html('<div class="input-value" style="display:none;">' + $(element2).text() + '</div><input type="text" value="' + $(element2).text() + '" name="col['+ (index1 + 1) +']['+ index2 +']" class="input-row" />');
						});
					});
					
					/* Add key column */
					$('.body-content .table_content thead tr').each(function(index1, element1){
						$(element1).prepend('<th></th>');
						var new_index = $(element1).find('th:nth-child(1)');
						new_index.append('<label class="label label-success">rows</label>');
					});
					
					$('.body-content .table_content tbody tr').each(function(index1, element1){
						$(element1).prepend('<td></td>');
						var new_index = $(element1).find('td:nth-child(1)');
						new_index.append('<label class="label label-success">' + index1 + '</label>');
						new_index.append('<a class="clone_row" data-value="'+ index1 + '"><span class="glyphicon glyphicon-duplicate"></span></a>');
						new_index.append('<a class="delete_row" data-value="'+ index1 + '"><span class="glyphicon glyphicon-remove"></span></a>');
						new_index.append('<a class="move"><span class="glyphicon glyphicon-move"></span></a>');
					});
					
					$('.body-content .table_content .input-row').execute_refresh();
				}
			},
			error: function(request, ajaxOptions, thrownError) {
				$(".debug").prepend(request.responseText);
			}
		});
	});
});