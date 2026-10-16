(function ($) {
	'use strict';

	var selectors = {
		body: '.body-content',
		table: '.body-content .table_content',
		input: '.body-content .table_content .input-row',
		sortColumn: 'select[name="column"]'
	};
	var columnDrag = {
		index: -1
	};
	var fillDrag = {
		active: false,
		name: '',
		value: ''
	};

	function init() {
		bindFileSelection();
		bindTableActions();
		bindFormActions();
		bindEditorInteractions();
	}

	function bindFileSelection() {
		$(document).on('change', ':file', function () {
			var input = $(this);
			var files = input.get(0).files;
			var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
			input.trigger('fileselect', [files ? files.length : 1, label]);
		});
	}

	function bindTableActions() {
		$(document)
			.on('click', 'a.clone_row', function () {
				cloneRow($(this).attr('data-value'));
			})
			.on('click', 'a.remove_col', function () {
				removeColumn($(this).attr('data-value'));
			})
			.on('click', 'a.add_col', function () {
				addColumn($(this).attr('data-value'));
			})
			.on('click', 'a.delete_row', function () {
				deleteRow($(this).attr('data-value'));
			})
			.on('click', 'a.go_back', function () {
				loadHistoryFile($(this).attr('data-file'));
			})
			.on('click', '.save', function () {
				$('.body-content .save_file input[type="submit"]').click();
			});
	}

	function bindFormActions() {
		$(document).on('submit', 'form', function (event) {
			event.preventDefault();
			var form = $(this);

			if (form.hasClass('sort_file_asc')) {
				sortRows(form, false);
				return;
			}
			if (form.hasClass('sort_file_desc')) {
				sortRows(form, true);
				return;
			}

			submitForm(form);
		});
	}

	function bindEditorInteractions() {
		$(selectors.body)
			.on('click', 'td:not(:first-child)', beginCellEdit)
			.on('click', '.close', finishCellEdit)
			.on('mousedown', 'table', beginFillDrag)
			.on('mousemove', 'table', continueFillDrag)
			.on('mouseup', 'table', endFillDrag)
			.on('mousedown', 'a.move_column', beginColumnDrag)
			.on('mousedown', 'td:not(:first-child)', function () {
				$(this).addClass('optimized');
			});
	}

	function refreshTableInputs() {
		$(selectors.input).off('change.csvReader').on('change.csvReader', function () {
			$(this).parent().find('.input-value').html($(this).val());
		});

		$(selectors.table + ' tbody tr').each(function (rowIndex) {
			$(this).find('td.contain-input input.input-row').each(function (columnIndex) {
				$(this).attr('name', 'col[' + (rowIndex + 1) + '][' + columnIndex + ']');
			});
			refreshRowControls($(this), rowIndex);
		});

		$(selectors.table + ' thead tr').each(function (rowIndex) {
			$(this).find('th.contain-input').each(function (columnIndex) {
				$(this).find('.add_col').attr('data-value', columnIndex + 1);
				$(this).find('.remove_col').attr('data-value', columnIndex + 2);
				$(this).find('input.input-row').attr(
					'name',
					'col_index[' + rowIndex + '][' + columnIndex + ']'
				);
			});
		});
	}

	function refreshRowControls(row, rowIndex) {
		var keyCell = row.find('td:first-child').empty();
		keyCell.append($('<label>', {
			'class': 'label label-success',
			text: rowIndex
		}));
		keyCell.append(createActionLink('clone_row', rowIndex, 'glyphicon-duplicate'));
		keyCell.append(createActionLink('delete_row', rowIndex, 'glyphicon-remove'));
		keyCell.append($('<a>', {
			'class': 'move',
			html: '<span class="glyphicon glyphicon-move"></span>'
		}));
	}

	function createActionLink(className, value, iconClass) {
		return $('<a>', {
			'class': className,
			'data-value': value,
			html: $('<span>', { 'class': 'glyphicon ' + iconClass })
		});
	}

	function cloneRow(rowIndex) {
		var rows = $(selectors.table + ' tbody tr');
		var row = rows.eq(Number(rowIndex)).clone();
		if (!row.length) {
			return;
		}

		row.appendTo(selectors.table + ' tbody');
		row.find('td.contain-input').each(function (columnIndex) {
			var cell = $(this);
			var value = cell.find('.input-value').text() || cell.text();
			setEditableCell(cell, value, 'col[0][' + columnIndex + ']', true);
		});

		enableRowSorting(row);
		refreshTableInputs();
	}

	function removeColumn(position) {
		$(selectors.table + ' tbody tr').find('td:nth-child(' + position + ')').remove();
		$(selectors.table + ' thead tr').find('th:nth-child(' + position + ')').remove();
		updateSortOptions();
		refreshTableInputs();
	}

	function addColumn(position) {
		$(selectors.table + ' tbody tr').each(function () {
			insertColumnCell($(this), 'td', position);
		});
		$(selectors.table + ' thead tr').each(function () {
			insertColumnCell($(this), 'th', position);
		});

		setNewColumnInputs(position);
		updateSortOptions();
		$(selectors.table + ' tbody tr').sortable('refresh');
		refreshTableInputs();
	}

	function insertColumnCell(row, cellName, position) {
		var cell = $('<' + cellName + '>', { 'class': 'contain-input' });
		if (position === '-1') {
			row.find(cellName + ':first-child').after(cell);
		} else if (position === '0') {
			row.find(cellName + ':last-child').after(cell);
		} else {
			row.find(cellName + ':nth-child(' + position + ')').after(cell);
		}
	}

	function setNewColumnInputs(position) {
		var headerSelector;
		var cellSelector;
		if (position === '-1') {
			headerSelector = 'th:nth-child(2)';
			cellSelector = 'td:nth-child(2)';
		} else if (position === '0') {
			headerSelector = 'th:last-child';
			cellSelector = 'td:last-child';
		} else {
			headerSelector = 'th:nth-child(' + (parseInt(position, 10) + 1) + ')';
			cellSelector = 'td:nth-child(' + (parseInt(position, 10) + 1) + ')';
		}

		$(selectors.table + ' thead tr ' + headerSelector).each(function () {
			var cell = $(this).empty();
			setEditableCell(cell, '', 'col_index[0][0]', false);
			cell.append(createActionLink('add_col', 0, 'glyphicon-plus'));
			cell.append(createActionLink('remove_col', 0, 'glyphicon-remove'));
			cell.append(createColumnMoveHandle());
		});
		$(selectors.table + ' tbody tr ' + cellSelector).each(function () {
			setEditableCell($(this), '', 'col[0][0]', true);
		});
	}

	function deleteRow(rowIndex) {
		$(selectors.table + ' tbody tr').eq(Number(rowIndex)).remove();
		refreshTableInputs();
	}

	function loadHistoryFile(file) {
		var loadForm = $('form.load');
		loadForm.find('input[type="submit"]').removeAttr('disabled');
		loadForm.find('input[name="filename"]').val(file);
		$('form.delete_file input[name="filename"]').val(file);
		$('form.convert_file input[name="filename"]').val(file);

		if (file !== 'none') {
			$('ul li.filename').text(file);
			$('ul li a.download-csv').attr('href', file);
			$('ul li a.download-text').attr('href', file.replace('.csv', '.txt'));
		}
		loadForm.find('input[type="submit"]').click().attr('disabled', 'disabled');
	}

	function sortRows(form, descending) {
		var column = parseInt(form.find(selectors.sortColumn).val(), 10);
		var rows = $(selectors.table + ' tbody tr').get();
		rows.sort(function (left, right) {
			var leftValue = $(left).find('td:nth-child(' + column + ') .input-value').text();
			var rightValue = $(right).find('td:nth-child(' + column + ') .input-value').text();
			var leftNumber = parseInt(leftValue, 10);
			var rightNumber = parseInt(rightValue, 10);
			var comparison;

			if (!isNaN(leftNumber) && !isNaN(rightNumber)) {
				comparison = leftNumber - rightNumber;
			} else {
				leftValue = leftValue.toLowerCase();
				rightValue = rightValue.toLowerCase();
				comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
			}
			return descending ? -comparison : comparison;
		});

		$(selectors.table + ' tbody').append(rows);
		enableTableSorting();
		refreshTableInputs();
	}

	function submitForm(form) {
		var formData = new FormData(form.get(0));
		if (form.hasClass('new_file')) {
			formData = prepareUpload(form);
			if (!formData) {
				return;
			}
		}

		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: form.attr('action'),
			data: formData,
			processData: false,
			contentType: false,
			dataType: 'json'
		}).done(function (data) {
			handleActionResponse(form, data);
		}).fail(function (request) {
			$('.debug').prepend(request.responseText);
			if (form.hasClass('load')) {
				$('form.load input[type="submit"]').removeAttr('disabled');
			}
		});
	}

	function prepareUpload(form) {
		var file = form.find('.file').get(0).files[0];
		if (!file) {
			showMessage('Please select a CSV file.');
			return null;
		}

		form.find('.upload_filename').val(file.name);
		var formData = new FormData();
		formData.append('file', file, file.name);
		formData.append('action', form.find('.action').val());
		return formData;
	}

	function handleActionResponse(form, data) {
		if (data.error) {
			showMessage(data.html);
			if (form.hasClass('load')) {
				$('form.load input[type="submit"]').removeAttr('disabled');
			}
			return;
		}

		$(selectors.body).empty();
		if (data.html) {
			showMessage(data.html);
		}
		$('a.download-text').parent().hide();

		if (form.hasClass('new_file')) {
			handleUploadResponse(form, data);
		} else if (form.hasClass('convert_file')) {
			handleConvertResponse();
		} else if (form.hasClass('save_file')) {
			handleSaveResponse(data);
		} else if (form.hasClass('delete_file')) {
			handleDeleteResponse();
		} else if (form.hasClass('load')) {
			renderLoadedTable(data);
		}
	}

	function showMessage(message) {
		$(selectors.body).prepend($('<div>').text(message));
	}

	function handleUploadResponse(form, data) {
		var loadSubmit = $('form.load input[type="submit"]');
		loadSubmit.attr('disabled', 'disabled');
		updateCurrentFile(data.file);
		if (data.file && data.file !== 'none') {
			addHistoryEntry(data.file);
			loadSubmit.removeAttr('disabled');
		}
		form.trigger('reset');
	}

	function handleConvertResponse() {
		$('form.load input[type="submit"]').removeAttr('disabled');
		$('a.download-text').parent().show();
		var csvFile = $('a.download-csv').attr('href');
		$('a.download-text').attr('href', csvFile.replace('.csv', '.txt'));
	}

	function handleSaveResponse(data) {
		updateCurrentFile(data.file);
		if (data.file && data.file !== 'none') {
			addHistoryEntry(data.file);
		}
		$('form.load input[type="submit"]').removeAttr('disabled');
	}

	function handleDeleteResponse() {
		var currentFile = $('ul li.filename').text();
		$('.history a.go_back').filter(function () {
			return $(this).attr('data-file') === currentFile;
		}).parent().remove();
		$('ul li.filename').empty();
		$('form.load input[type="submit"]').attr('disabled', 'disabled');
	}

	function updateCurrentFile(file) {
		$('form.load input[name="filename"]').val(file);
		$('form.delete_file input[name="filename"]').val(file);
		$('form.convert_file input[name="filename"]').val(file);
		if (file && file !== 'none') {
			$('ul li.filename').text(file);
			$('ul li a.download-csv').attr('href', file);
			$('ul li a.download-text').attr('href', file.replace('.csv', '.txt'));
		}
	}

	function addHistoryEntry(file) {
		var name = file.substring(file.lastIndexOf('/') + 1);
		var link = $('<a>', {
			'class': 'go_back',
			'data-file': file,
			text: name
		});
		$('.history').append($('<li>').append(link));
	}

	function renderLoadedTable(data) {
		var filename = $('form.load input[name="filename"]').val();
		$('form.load input[type="submit"]').attr('disabled', 'disabled');
		$(selectors.body).prepend(
			'<form class="save_file" action="cgi-bin/excel.cgi" method="post">' +
			'<table class="table table_content"></table>' +
			'<input type="submit" class="btn-primary btn" value="Save" />' +
			'<input type="hidden" value="save" name="action" />' +
			'<input type="hidden" name="file" />' +
			'</form>'
		);
		$(selectors.body + ' .save_file input[name="file"]').val(filename);
		$(selectors.table).htmlson({ data: JSON.parse(data.table) });
		prepareEditableTable();
	}

	function prepareEditableTable() {
		var table = $(selectors.table);
		table.find('td, th').addClass('contain-input');

		table.find('thead tr').each(function (rowIndex) {
			$(this).find('th.contain-input').each(function (columnIndex) {
				var cell = $(this);
				setEditableCell(
					cell,
					cell.text(),
					'col_index[' + rowIndex + '][' + columnIndex + ']',
					false
				);
			});
		});
		table.find('tbody tr').each(function (rowIndex) {
			$(this).find('td.contain-input').each(function (columnIndex) {
				var cell = $(this);
				setEditableCell(
					cell,
					cell.text(),
					'col[' + (rowIndex + 1) + '][' + columnIndex + ']',
					true
				);
			});
		});

		addRowHeader();
		addColumnActions();
		enableTableSorting();
		refreshTableInputs();
		updateSortOptions();
	}

	function setEditableCell(cell, value, name, movable) {
		cell.empty();
		cell.append($('<div>', {
			'class': 'input-value',
			text: value
		}).hide());
		cell.append($('<input>', {
			type: 'text',
			value: value,
			name: name,
			'class': 'input-row'
		}));
		if (movable) {
			cell.append('<a class="move-col"><span class="glyphicon glyphicon-move"></span></a>');
		}
	}

	function addRowHeader() {
		$(selectors.table + ' thead tr').prepend(
			'<th><label class="label label-success">rows</label></th>'
		);
		$(selectors.table + ' tbody tr').each(function (rowIndex) {
			var cell = $('<td>');
			cell.append($('<label>', {
				'class': 'label label-success',
				text: rowIndex
			}));
			cell.append(createActionLink('clone_row', rowIndex, 'glyphicon-duplicate'));
			cell.append(createActionLink('delete_row', rowIndex, 'glyphicon-remove'));
			cell.append('<a class="move"><span class="glyphicon glyphicon-move"></span></a>');
			$(this).prepend(cell);
		});
	}

	function addColumnActions() {
		$(selectors.table + ' thead tr th:not(:first-child)').each(function (columnIndex) {
			$(this).append(createActionLink('add_col', columnIndex + 1, 'glyphicon-plus'));
			$(this).append(createActionLink('remove_col', columnIndex + 2, 'glyphicon-remove'));
			$(this).append(createColumnMoveHandle());
		});
	}

	function createColumnMoveHandle() {
		return $('<a class="move_column"><span class="glyphicon glyphicon-move"></span></a>');
	}

	function beginColumnDrag(event) {
		event.preventDefault();
		columnDrag.index = $(this).closest('th').index();
		$(selectors.table).addClass('column-dragging');
		$(document)
			.on('mousemove.columnDrag', continueColumnDrag)
			.on('mouseup.columnDrag', endColumnDrag);
	}

	function continueColumnDrag(event) {
		var target = $(document.elementFromPoint(event.clientX, event.clientY));
		var header = target.closest(selectors.table + ' thead th');
		var targetIndex = header.index();
		if (!header.length || targetIndex < 1 || targetIndex === columnDrag.index) {
			return;
		}

		moveColumn(columnDrag.index, targetIndex);
		columnDrag.index = targetIndex;
	}

	function endColumnDrag() {
		$(document).off('.columnDrag');
		$(selectors.table).removeClass('column-dragging');
		columnDrag.index = -1;
		refreshTableInputs();
		updateSortOptions();
	}

	function moveColumn(fromIndex, toIndex) {
		$(selectors.table + ' tr').each(function () {
			var cells = $(this).children();
			var moving = cells.eq(fromIndex);
			var anchor = cells.eq(toIndex);
			if (!moving.length || !anchor.length) {
				return;
			}
			if (fromIndex < toIndex) {
				anchor.after(moving);
			} else {
				anchor.before(moving);
			}
		});
	}

	function enableTableSorting() {
		$(selectors.table + ' tbody').sortable({
			animation: 150,
			scroll: true,
			handle: '.move',
			out: refreshTableInputs
		});
		$(selectors.table + ' tbody tr').each(function () {
			enableRowSorting($(this));
		});
	}

	function enableRowSorting(row) {
		row.sortable({
			animation: 150,
			scroll: true,
			handle: '.move-col',
			out: refreshTableInputs
		});
	}

	function updateSortOptions() {
		var select = $(selectors.sortColumn).empty();
		$(selectors.table + ' thead tr th').each(function (columnIndex) {
			if (columnIndex > 0) {
				select.append($('<option>', {
					value: columnIndex + 1,
					text: 'Sort by Column ' + columnIndex
				}));
			}
		});
	}

	function beginCellEdit(event) {
		var cell = $(this);
		if ($(event.target).hasClass('move-col') || cell.find('textarea').length) {
			return;
		}

		cell.addClass('edit-time');
		cell.prepend($('<textarea>', {
			'class': 'textarea-row',
			name: cell.find('input').attr('name'),
			text: cell.find('input').val()
		}));
		cell.prepend('<div class="close">X</div>');
	}

	function finishCellEdit() {
		var cell = $(this).closest('td');
		var textarea = cell.find('textarea');
		var value = textarea.val();
		cell.removeClass('edit-time');
		cell.find('input').val(value).attr('value', value);
		cell.find('.input-value').text(value);
		textarea.remove();
		$(this).remove();
	}

	function beginFillDrag(event) {
		var target = event.target;
		if (!fillDrag.active && target.tagName === 'INPUT' && target.className === 'input-row') {
			fillDrag.value = target.value;
			fillDrag.name = target.name;
			fillDrag.active = true;
			target.style.border = '1px solid #ff0000';
		}
	}

	function continueFillDrag(event) {
		var target = event.target;
		if (fillDrag.active && target.tagName === 'INPUT' &&
				target.name !== fillDrag.name && target.className === 'input-row') {
			target.value = fillDrag.value;
			$(target).attr('value', fillDrag.value);
			$(target).parent().find('.input-value').text(fillDrag.value);
			target.style.border = '1px solid #ff0000';
		}
	}

	function endFillDrag() {
		$(this).find('tbody tr td input, thead tr th input').css('border', 'none');
		$(this).find('tbody tr td:not(:first-child)').removeClass('optimized');
		fillDrag.active = false;
		fillDrag.name = '';
		fillDrag.value = '';
	}

	$(init);
})(jQuery);
