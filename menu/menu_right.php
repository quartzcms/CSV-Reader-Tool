<div class="panel panel-warning">
    <div class="panel-heading">
        <h3 class="panel-title" align="center">Reload or Load</h3>
    </div>
    <div class="panel-body">
        <ul class="nav nav-pills nav-stacked">
            <li>
            	<form action="cgi-bin/excel.cgi" class="load" method="post">
                	<div class="file"></div>
                    <input type="hidden" value="load" name="action" />
                    <input type="hidden" value="" name="filename" />
                    <input type="submit" name="submit" class="btn btn-success" disabled="disabled" value="Load file" />
                </form>
            </li>
            <li>You can load or reload a file you've uploaded</li>
            <li><a href="#" class="download"><span class="glyphicon glyphicon-download-alt"></span>Download</a></li>
        </ul>
    </div>
</div>

<div class="panel panel-info">
    <div class="panel-heading">
        <h3 class="panel-title" align="center">History</h3>
    </div>
    <div class="panel-body">
    	<ul class="nav nav-pills nav-stacked">
            <li>Click on the version to load it</li>
        </ul>
        <ul class="nav nav-pills nav-stacked history">
            <li class="init"></li>
        </ul>
    </div>
</div>

<div class="panel panel-info">
    <div class="panel-heading">
        <h3 class="panel-title" align="center">Options</h3>
    </div>
    <div class="panel-body">
        <ul class="nav nav-pills nav-stacked">
            <li><span class="glyphicon glyphicon-move"></span>Drag the row with the arrows icon</li>
            <li><span class="glyphicon glyphicon-remove"></span>Delete the row with the X icon</li>
            <li><span class="glyphicon glyphicon-duplicate"></span>Duplicate the row with the double file icon</li>
        </ul>
    </div>
</div>