<div class="panel panel-warning">
    <div class="panel-heading">
        <h3 class="panel-title" align="center">Upload a CSV</h3>
    </div>
    <div class="panel-body">
        <ul class="nav nav-pills nav-stacked">
            <li>
            	<form action="cgi-bin/excel.cgi" accept-charset="UTF-8" class="new_file" method="post" enctype="multipart/form-data">
                    <label class="btn btn-primary btn-file">
                        Browse <input type="file" name="file" class="file" style="display: none;">
                    </label>
                    <input type="hidden" value="" class="upload_filename" name="action" />
                    <input type="hidden" value="upload" class="action" name="action" />
                    <input type="submit" name="submit" class="btn btn-success" value="Upload" />
                </form>
            </li>
            <li>
            	Start by browsing your CSV file and uploading it.
            </li>
            <li class="text-success well filename">-Load a file-</li>
            <li>
            	<form action="cgi-bin/excel.cgi" class="delete_file" method="post" enctype="multipart/form-data">
                	<input type="hidden" value="" name="filename" />
                    <input type="hidden" value="delete" name="action" />
                    <input type="submit" name="submit" class="form-control btn btn-danger" value="Delete" />
                </form>
            </li>
            <li><a class="save"><span class="glyphicon glyphicon-ok"></span>Save</a></li>
            <li>
            	Save the progress of the file when you see the editing table
            </li>
        </ul>
    </div>
</div>

<div class="panel panel-info">
    <div class="panel-heading">
        <h3 class="panel-title" align="center">Options</h3>
    </div>
    <div class="panel-body">
        <ul class="nav nav-pills nav-stacked">
        	<li>
            	A few option available on the editing table view
            </li>
			<li><a class="add_col" data-value='0'><span class="glyphicon glyphicon-plus"></span>Append column</a></li>
			<li><a class="add_col" data-value='-1'><span class="glyphicon glyphicon-plus"></span>Prepend column</a></li>
            <li><a class="clone_row" data-value='0'><span class="glyphicon glyphicon-duplicate"></span>Clone first row</a></li>
            <li><a class="clone_row" data-value='-1'><span class="glyphicon glyphicon-duplicate"></span>Clone last row</a></li>
            <li class="order-asc">
                <form class="sort_file_asc" enctype="multipart/form-data">
                    <select name="column" class="form-control">
                		<option value="0">Select a column</option>
                    </select>
                    <input type="submit" name="submit" class="form-control btn btn-danger" value="Sort Ascending" />
            	</form>
            </li>
            <li class="order-desc">
                <form class="sort_file_desc" enctype="multipart/form-data">
                    <select name="column" class="form-control">
                		<option value="0">Select a column</option>
                    </select>
                    <input type="submit" name="submit" class="form-control btn btn-danger" value="Sort Descending" />
            	</form>
            </li>
        </ul>
    </div>
</div>