<!DOCTYPE html>
<html>
	<head>
        <link rel="apple-touch-icon" sizes="180x180" href="assets/favicon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png">
        <link rel="manifest" href="assets/favicon/site.webmanifest">
        <link rel="mask-icon" href="assets/favicon/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="msapplication-TileColor" content="#da532c">
        <meta name="theme-color" content="#ffffff">
    	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="content-type" content="utf-8" />
		<title>Excel</title>
        <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.css">
        <link rel="stylesheet" type="text/css" href="assets/css/screen.css">
		<link rel="stylesheet" type="text/css" href="assets/css/custom.css">
        <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
 		<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
        <script src="assets/js/crypto-core-min.js"></script>
        <script src="assets/js/md5-min.js"></script>
        <script type="text/javascript" src="assets/widgets/htmlson/src/htmlson.js"></script>
		<script type="text/javascript" src="assets/bootstrap/js/bootstrap.js"></script>
		<script type="text/javascript" src="assets/js/buildtable.js"></script>
		<script type="text/javascript" src="assets/js/popup.js"></script>
        <script type="text/javascript" src="assets/js/custom.js"></script>
	</head>
	<body>
		<div class="container-fluid">
			<div class="row">
				<div class="col-md-12">
					<?php include('menu/menu_top.php') ?>
				</div>
			</div>
			<div class="row">
				<div class="col-md-2">
					<?php include('menu/menu_left.php') ?>
				</div>
				<div class="col-md-8">
					<div class="panel panel-info">
						<div class="panel-heading">
							<h3 class="panel-title" align="right">
								<script type="text/javascript">
									var dDate = new Date();
									var Jours = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
									var Mois = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
									document.write(Jours[dDate.getDay()] + " " + dDate.getDate() + " " + Mois[dDate.getMonth()] + " " + dDate.getFullYear());
								</script>
							</h3>
						</div>
						<div class="panel-body body-content">
						</div>
					</div>
                    <div class="panel panel-danger">
						<div class="panel-heading">
							<h3 class="panel-title" align="right">
								Errors
							</h3>
						</div>
						<div class="panel-body debug">
						</div>
					</div>
				</div>
                <div class="col-md-2">
					<?php include('menu/menu_right.php') ?>
				</div>
			</div>
		</div>
	</body>
</html>