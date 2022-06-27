// JavaScript Document

$(document).on('change', ':file', function() {
	var input = $(this),
		numFiles = input.get(0).files ? input.get(0).files.length : 1,
		label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [numFiles, label]);
});

var get_current_date = function() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	var hh = today.getHours();
	var ii = today.getMinutes();
	var ss = today.getSeconds();
	
	if(dd<10) {	dd = '0'+dd } 
	if(mm<10) {	mm = '0'+mm	} 
	if(hh<10) {	hh = '0'+hh	} 
	if(ii<10) {	ii = '0'+ii	} 
	if(ss<10) {	ss = '0'+ss	} 
	today =  dd + '-' + mm + '-' + yyyy + '_' + hh + ':' + ii + ':' + ss;
	return today;
}

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
		
		$('.body-content .table_content thead tr').each(function(index1, element1){
			$(element1).find('th.contain-input').each(function(index2, element2){
				$(element2).find('.add_col').attr('data-value', (index2 + 1));
				$(element2).find('.remove_col').attr('data-value', (index2 + 2));
				$(element2).find('input.input-row').attr('name', 'col_index['+ index1 +']['+ index2 +']');
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
			$(element1).html('<div class="input-value" style="display:none;">' + $(element1).text() + '</div><input type="text" value="' + $(element1).text() + '" name="col['+ rows_count +']['+ index1 +']" class="input-row" /><a class="move-col"><span class="glyphicon glyphicon-move"></span></a>');
		});
		
		row.sortable({
				animation: 150,
				scroll: true,
				handle: '.move-col',
				out: function () {
					$('.body-content .table_content .input-row').execute_refresh();
				}
			}
		);
		
		$('.body-content .table_content .input-row').execute_refresh();
	});
	
	$('body').delegate('a.remove_col', 'click', function(e){
		$value = $(this).attr('data-value');
		$('.body-content .table_content tbody tr').find('td:nth-child('+ $value +')').remove();
		$('.body-content .table_content thead tr').find('th:nth-child('+ $value +')').remove();
		
		$('select[name="column"]').html('');
		$('.body-content .table_content thead tr th').each(function(index1, element1){
			if(index1 != 0){
				var columm = index1 + 1;
				$('select[name="column"]').append('<option value="' + columm + '">Sort by Column ' + index1 + '</option>');
			}
		});
		
		$('.body-content .table_content .input-row').execute_refresh();
	});
	
	$('body').delegate('a.add_col', 'click', function(e){
		$value = $(this).attr('data-value');		
		$('.body-content .table_content tbody tr').each(function(index1, element1){
			if($value == '-1'){
				$(this).find('td:first-child').after('<td class="contain-input"></td>');
			} else if($value == '0') {
				$(this).find('td:last-child').after('<td class="contain-input"></td>');
			} else {
				$(this).find('td:nth-child('+ $value +')').after('<td class="contain-input"></td>');
			}
		});
		
		$('.body-content .table_content thead tr').each(function(index1, element1){
			if($value == '-1'){
				$(this).find('th:first-child').after('<th class="contain-input"></th>');
			} else if($value == '0') {
				$(this).find('th:last-child').after('<th class="contain-input"></th>');
			} else {
				$(this).find('th:nth-child('+ $value +')').after('<th class="contain-input"></th>');
			}
		});
		
		$('.body-content .table_content thead tr').each(function(index1, element1){
			if($value == '-1'){
				$(this).find('th:nth-child(2)').html('<div class="input-value" style="display:none;"></div><input type="text" value="" name="col_index[0][0]" class="input-row" /><a class="add_col" data-value="0"><span class="glyphicon glyphicon-plus"></span></a><a class="remove_col" data-value="0"><span class="glyphicon glyphicon-remove"></span></a>');
			} else if($value == '0') {
				$(this).find('th:last-child').html('<div class="input-value" style="display:none;"></div><input type="text" value="" name="col_index[0][0]" class="input-row" /><a class="add_col" data-value="0"><span class="glyphicon glyphicon-plus"></span></a><a class="remove_col" data-value="0"><span class="glyphicon glyphicon-remove"></span></a>');
			} else {
				$(this).find('th:nth-child('+ (parseInt($value) + 1) +')').html('<div class="input-value" style="display:none;"></div><input type="text" value="" name="col_index[0][0]" class="input-row" /><a class="add_col" data-value="0"><span class="glyphicon glyphicon-plus"></span></a><a class="remove_col" data-value="0"><span class="glyphicon glyphicon-remove"></span></a>');
			}
		});
		
		$('.body-content .table_content tbody tr').each(function(index1, element1){
			if($value == '-1'){
				$(this).find('td:nth-child(2)').html('<div class="input-value" style="display:none;"></div><input type="text" value="" name="col[0][0]" class="input-row" /><a class="move-col"><span class="glyphicon glyphicon-move"></span></a>');
			} else if($value == '0') {
				$(this).find('td:last-child').html('<div class="input-value" style="display:none;"></div><input type="text" value="" name="col[0][0]" class="input-row" /><a class="move-col"><span class="glyphicon glyphicon-move"></span></a>');
			} else {
				$(this).find('td:nth-child('+ (parseInt($value) + 1) +')').html('<div class="input-value" style="display:none;"></div><input type="text" value="" name="col[0][0]" class="input-row" /><a class="move-col"><span class="glyphicon glyphicon-move"></span></a>');
			}
		});
		
		$('select[name="column"]').html('');
		$('.body-content .table_content thead tr th').each(function(index1, element1){
			if(index1 != 0){
				var columm = index1 + 1;
				$('select[name="column"]').append('<option value="' + columm + '">Sort by Column ' + index1 + '</option>');
			}
		});
		
		$('.body-content .table_content tbody tr').sortable('refresh');
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
	
	$('body').delegate('a.go_back', 'click', function(e){
		$('form.load').find('input[type="submit"]').removeAttr('disabled');
		var file = $(this).attr('data-file');
		$('form.load').find('input[name="filename"]').val(file);
		$('form.delete_file').find('input[name="filename"]').val(file);
		$('form.convert').find('input[name="filename"]').val(file);
		if(file != 'none'){
			$('ul li.filename').html(file);
			$('ul li a.download-csv').attr('href', '/cgi-bin/' + file);
			$('ul li a.download-text').attr('href', '/cgi-bin/' + file.replace('.csv', '.txt'));
		}
		$('form.load input[type="submit"]').click();
		$('form.load').find('input[type="submit"]').attr('disabled', 'disabled');
	});
	
	$('body').delegate('form', 'submit', function(e){
		e.preventDefault();
		var form = $(this);
		var formData = new FormData($(this)[0]);
		
		if(form.hasClass('new_file')) {			
			var file = $(this).find('.file').get(0).files[0];
			form.find('.upload_filename').val(file.name);			
			var action = $(this).find('.action').val();
			var newFileName = file.name;
			var extension = newFileName.split('.').pop();
			var md5_encrypted = String(CryptoJS.MD5(newFileName));
			var date = get_current_date();
			newFileName = md5_encrypted.slice(1, 3) + '_' + date + '.' + extension;
			var formData = new FormData();
			formData.append('file', file, newFileName);
			formData.append('action', action);
		} else if (form.hasClass('save_file')) {
			var newFileName = $('form.new_file').find('.upload_filename').val();
			var extension = newFileName.split('.').pop();
			var md5_encrypted = String(CryptoJS.MD5(newFileName));
			var date = get_current_date();
			newFileName = md5_encrypted.slice(1, 3) + '_' + date + '.' + extension;
			$('form.save_file').find('input[name="file"]').val('../upload/' + newFileName);
			formData.append('file', '../upload/' + newFileName);	
		} else if (form.hasClass('sort_file_asc')){
			var elements = [];
			$('.body-content .table_content tbody tr').each(function(index1, element1){
				var content = $(element1).find('td:nth-child('+ form.find('select[name="column"]').val() +')').find('.input-value').html();
				if(!isNaN(parseInt(content, 10))){
					content = parseInt(content, 10);
				}
				elements[index1] = {sortby: content, index: index1 + 1};						
			});
			var sortbyName = elements.slice(0);
			sortbyName.sort(function(a,b) {
				if(isNaN(a.sortby) || isNaN(b.sortby)){
					var x = a.sortby.toLowerCase();
					var y = b.sortby.toLowerCase();
				} else {
					var x = a.sortby;
					var y = b.sortby;
				}
				return x < y ? -1 : x > y ? 1 : 0;
			});
			var tbody = $('<tbody></tbody>');
			for (i = 0; i < sortbyName.length; i++) {
				tbody.append('<tr>' + $('.body-content .table_content tbody tr:nth-child(' + sortbyName[i].index + ')').html() + '</tr>');
			}
			$('.body-content .table_content tbody').html(tbody.html());
			$('.body-content .table_content tbody tr').sortable({
					animation: 150,
					scroll: true,
					handle: '.move-col',
					out: function () {
						$('.body-content .table_content .input-row').execute_refresh();
					}
				}
			);
			$('.body-content .table_content .input-row').execute_refresh();
			return false;
		} else if (form.hasClass('sort_file_desc')){
			var elements = [];
			$('.body-content .table_content tbody tr').each(function(index1, element1){
				var content = $(element1).find('td:nth-child('+ form.find('select[name="column"]').val() +')').find('.input-value').html();
				elements[index1] = {sortby: content, index: index1 + 1};						
			});
			var sortbyName = elements.slice(0);
			sortbyName.sort(function(a,b) {
				var x = a.sortby.toLowerCase();
				var y = b.sortby.toLowerCase();
				return x > y ? -1 : x < y ? 1 : 0;
			});
			var tbody = $('<tbody></tbody>');
			for (i = 0; i < sortbyName.length; i++) {
				tbody.append('<tr>' + $('.body-content .table_content tbody tr:nth-child(' + sortbyName[i].index + ')').html() + '</tr>');
			}
			$('.body-content .table_content tbody').html(tbody.html());
			$('.body-content .table_content tbody tr').sortable({
					animation: 150,
					scroll: true,
					handle: '.move-col',
					out: function () {
						$('.body-content .table_content .input-row').execute_refresh();
					}
				}
			);
			$('.body-content .table_content .input-row').execute_refresh();
			return false;
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
				$('a.download-text').parent().css('display', 'none');
				if(form.hasClass('new_file')) {					
					$('form.load').find('input[type="submit"]').attr('disabled', 'disabled');
					$('form.load').find('input[name="filename"]').val(data.file);
					$('form.convert_file').find('input[name="filename"]').val(data.file);
					$('form.delete_file').find('input[name="filename"]').val(data.file);
					if(data.file != 'none'){
						$('ul li.filename').html(data.file);
						$('ul li a.download-csv').attr('href', data.file);
						var filename = data.file;
						$('.history').append('<li><a data-file="'+ data.file +'" class="go_back">' + filename.substring(filename.lastIndexOf('/')+1) + '</a></li>');
						$('form.load').find('input[type="submit"]').removeAttr('disabled');
					}
					form.trigger("reset");
				} else if (form.hasClass('convert_file')){
					$('form.load').find('input[type="submit"]').removeAttr('disabled');
					$('a.download-text').parent().css('display', 'block');
					var text_file = $('a.download-csv').attr('href');
					$('ul li a.download-text').attr('href', text_file.replace('.csv', '.txt'));
				} else if (form.hasClass('save_file')){
					$('form.load').find('input[name="filename"]').val(data.file);
					$('form.delete_file').find('input[name="filename"]').val(data.file);
					$('form.convert_file').find('input[name="filename"]').val(data.file);
					if(data.file != 'none'){
						$('ul li.filename').html(data.file);
						$('ul li a.download-csv').attr('href', data.file);
						var filename = data.file;
						$('.history').append('<li><a data-file="'+ data.file +'" class="go_back">' + filename.substring(filename.lastIndexOf('/')+1) + '</a></li>');
					}
					$('form.load').find('input[type="submit"]').removeAttr('disabled');
				} else if (form.hasClass('delete_file')){
					$('.go_back').each(function(index1, element1){
						if($('ul li.filename').text() == $(element1).attr('data-file')){
							$(element1).parent().remove();
						}
					});
					
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
					
					$('.body-content .table_content tbody tr').sortable({
							animation: 150,
							scroll: true,
							handle: '.move-col',
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
					
					$('.body-content .table_content tbody tr td:not(:first-child)').each(function(index1, element1){
						$(element1).append('<a class="move-col"><span class="glyphicon glyphicon-move"></span></a>');
					});
					$('.body-content .table_content thead tr th:not(:first-child)').each(function(index1, element1){
						$(element1).append('<a class="add_col" data-value="'+ (index1 + 1) +'"><span class="glyphicon glyphicon-plus"></span></a>');
						$(element1).append('<a class="remove_col" data-value="'+ (index1 + 2) +'"><span class="glyphicon glyphicon-remove"></span></a>');
					});
					
					$('.body-content').delegate('td:not(:nth-child(1))', 'click', function(e){
						if(e.target.className != 'move-col'){
							if($(this).find('textarea').length == 0){
								$(this).addClass('edit-time');
								$(this).prepend('<textarea class="textarea-row" name="'+ $(this).find('input').attr('name') +'">' + $(this).find('input').val() + '</textarea>');
								$(this).prepend('<div class="close">X<div>');
							}
						}
					});
					
					$('.body-content').delegate('td:not(:nth-child(1))', 'click', function(e){
						if(e.target.className == 'close'){
							$(this).removeClass('edit-time');
							$(this).find('input').attr('value', $(this).find('textarea').val());
							$(this).find('.input-value').text($(this).find('textarea').val());
							$(this).find('input').val($(this).find('textarea').val());
							$(this).find('textarea').remove();
							$(this).find('.close').remove();
						}
					});
					
					var drag_down = 0;
					var origin_name;
					var origin_value;
					
					$('.body-content').delegate('table', 'mousedown', function(e){
						if(drag_down == 0 && e.target.tagName == 'INPUT' && e.target.className == 'input-row'){
							origin_value = e.target.value;
							origin_name = e.target.name;
							drag_down = 1;
							e.target.style.border = '1px solid #ff0000';
						}
					});
					
					$('.body-content').delegate('table', 'mouseup', function(e){
						$(this).find('tbody tr td input').each(function(index1, element1){
							$(element1).css('border', 'none');
						});
						$(this).find('thead tr th input').each(function(index1, element1){
							$(element1).css('border', 'none');
						});
						drag_down = 0;
						origin_value = '';
					});
					
					$('.body-content').delegate('table', 'mousemove', function(x){
						if(drag_down == 1 && x.target.tagName == 'INPUT' && x.target.name != origin_name && x.target.className == 'input-row'){
							x.target.value = origin_value;
							$(x.target).attr('value', origin_value);
							$(x.target).parent().find('.input-value').text(origin_value);
							x.target.style.border = '1px solid #ff0000';
						}
					});
					
					$('.body-content').delegate('td:not(:nth-child(1))', 'mousedown', function(){
						$(this).addClass('optimized');
					});
					
					$('.body-content').delegate('table', 'mouseup', function(){
						$(this).find('tbody tr td:not(:nth-child(1))').each(function(index1, element1){
							$(element1).removeClass('optimized');
						});
					});
					
					$('.body-content .table_content .input-row').execute_refresh();
					
					$('select[name="column"]').html('');
					$('.body-content .table_content thead tr th').each(function(index1, element1){
						if(index1 != 0){
							var columm = index1 + 1;
							$('select[name="column"]').append('<option value="' + columm + '">Sort by Column ' + index1 + '</option>');
						}
					});
				}
			},
			error: function(request, ajaxOptions, thrownError) {
				$(".debug").prepend(request.responseText);
			}
		});
	});
});