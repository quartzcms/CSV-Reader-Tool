<?php
ini_set('display_errors', 1);
$col = array_values($_POST['col']);
$col_index = $_POST['col_index'];
$new_array = array_merge($col_index, $col);

$file = $_POST['file'];
$csv = fopen($file, 'w');
foreach($new_array as $value){
	fputcsv($csv, $value);
}
fclose($csv);

echo json_encode(array('html' => 'The file was saved'));
?>