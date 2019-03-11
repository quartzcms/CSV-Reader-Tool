var link='./exampleData.json';

$.ajax({
		url: link,
		type: 'GET',
		dataType: 'json',
	})
	.done(function(resp) {

		testTable = $('.testTable').htmlson({//the magic
			data: resp,
			headers: {
				1: 'FIRST NAME',
				4: 'CUSTOM HEADER'
			},
			debug: true
		});

	})
	.fail(function() {
		console.log("error");
	})

	function addRow() {
		testTable.addRow({
		  "id": 14,
		  "first_name": "Loydie",
		  "last_name": "Letrange",
		  "email": "lletranged@homestead.com",
		  "gender": "Male",
		  "ip_address": "47.198.162.223"
		});
	}

	function removeFirstRow() {
		testTable.removeRow(0);
	}
  function convertToJson(){
    var obj = testTable.toJson();
    console.log(obj);
    $('.echoJson').html(JSON.stringify(obj));
  }