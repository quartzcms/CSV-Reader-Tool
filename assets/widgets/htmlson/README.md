<p><img src="http://i.imgur.com/s6beA4q.png" alt="N|Solid"></p>
<h1>Features</h1>
<ul>
<li>Convert JSON array of objects into to HTML table!</li>
<li>Convert HTML table into JSON object!</li>
</ul>
<p>Available configurations:</p>
<ul>
    <li>data: array(array of objects)</li>
    <li>headers: object(key-value pair index by the number of row and the custom name of the value)</li>
    <li>debug: boolean(we know what debug means :) )</li>
</ul>
<a href="https://codepen.io/adalenv/pen/mXZjaR/">Demo</a>
<h3><a id="Usage_14"></a>Installation</h3>
<p>Using NPM:</p>
<pre><code class="language-js">
npm install htmlson.js
</code></pre>
<p>Include:</p>
<pre>&lt;<span class="pl-ent">script</span> <span class="pl-e">src</span>=<span class="pl-s"><span class="pl-pds">"</span>node_modules/htmlson.js/dist/htmlson.min.js<span class="pl-pds">"</span></span>&gt;&lt;/<span class="pl-ent">script</span>&gt;
 </pre>
<h3><a id="Usage_14"></a>Usage</h3>
<p>htmlson.js requires a min version 1.9.1 of <a href="https://jquery.com/download/">jQuery</a> to run.</p>
<p>Initialize:</p>
<pre><code class="language-js">var htmlson = $(<span class="hljs-string">'.testTable'</span>).htmlson({
    data: data,
    headers: {
        1: 'custom header name'
    },
    debug: true
}); 
</code></pre>
<p>Convert html table to JSON object:</p>
<pre><code class="language-js">var obj = htmlson.toJson();
</code></pre>
<p>Add row:</p>
<pre><code class="language-js">htmlson.addRow({
   "name": "New Kitty",
   "species" : "cat",
   "foods": {
       "likes": ["old food"],
       "dislikes": ["new food"]
   }
});
</code></pre>

<p>Remove row by index:</p>
<pre><code class="language-js">htmlson.removeRow(1);
</code></pre>
<ul>
TODO:
<li>Write HTML table based on json object depth</li>
</ul>
<p>Authors:</p>
<ul>
    <li><a href="https://github.com/adalenv">Adalen Vladi</a></li>
    <li><a href="https://github.com/redjanym">Redjan Ymeraj</a></li>
</ul>
