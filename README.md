# CSV-Reader-Tool
A CSV Reader Tool written in Python 3

<p>To install the CSV Reader Tool please follow the instruction as follow.</p>

<h4>Step - 1</h4>

<p>Connect to SSH on your server and install the dependencies required to the script to work:</p>

<p>Check if you have Python 3 first using this command</p>

<pre>python3 --version</pre>

<p>If you have Python 3 type this command to install them on a Ubuntu server</p>

<pre>sudo apt-get install python-pip
sudo pip install numpy
sudo pip install pandas</pre>

<h4>Step - 2</h4>

<p>Make sure your vhost file can run CGI scripts by making your virtual host file look like the following lines:</p>

<pre>ScriptAlias /cgi-bin/ /var/www/website/public_html/cgi-bin/
&lt;Directory "/var/www/website/public_html/cgi-bin/"&gt;
    AllowOverride All
    Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
    Require all granted
    AddHandler cgi-script .cgi .py
&lt;/Directory&gt;

&lt;Directory /var/www/website/&gt;
    Options +ExecCGI
    AllowOverride All
    Require all granted
&lt;/Directory&gt;</pre>

<h4>Step - 3</h4>

<p>Upload your files to the document root directory (public_html)</p>

<h4>Step - 4</h4>

<p>Make sure the cgi-bin folder have the correct permissions. The permission should be 0755.</p>

<h4>Step - 5</h4>

<p>Make sure the correct permission are set on the upload folder (0775). The writing permission is needed to allow Apache to write to the directory.</p>

<h4>Step - 6</h4>

<p>Test the script to make sure it works on your server and to ensure you have installed everything correctly.</p>