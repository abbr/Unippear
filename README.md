Unippear
=================

Enforce consistent look-and-feel to multiple enterprise websites through centralized layout manager service.

## Motivation
Large organizations often own many web sites, such as vanity sites, subsidiary sites etc, in addition to home portal. Maintaining a consistent look-and-feel for branding purpose is often desirable, sometimes even mandatory. In early days when most websites were built with static HTML files, consistency is achieved through distributing a set of template files to client sites. Nowadays a lot of sites are built on a server-side scripting platform employing some sort of template engines. For this template sharing solution to work, adapting the template to a specific engine is unavoidable. However, this conversion effort not only takes time, but also prone to breaking the consistency. Besides, coordinating template upgrade could also be a challenge.

*Unippear* addresses these problems through a service oriented architecture (SOA) that takes advantage of Web 2.0 AJAX technology. The layout templates are managed in a centralized API service web app. A client site applies the layout by adding a few lines of Javascript code to invoke the service. This centralized service approach helps enforcing core look-and-feel, yet still gives site builder some degree of freedom to customize presentation through optional configurations.

## Features
* Enforcing consistent header and footer across multiple websites.
* Allowing per-site customization through optional configurations.
* Expediting Javascript downloading by auto combining all Javascript files into one download with Etag caching.
* Layout versioning: A website can choose either ties to a specific layout version or always uses the latest version.
* Theming: Multiple themes are allowed in each version.
* Security: Only pre-registered client sites can use the service. 

## Live Demo
Take a look at [live demo](https://unippear.herokuapp.com/test.html) hosted on Heroku.

## Description
### Structure
*Unippear* runs on [Express](http://expressjs.com). Important folders and files  *Unippear* consists of are:
```
/                           	<--- app root
|-- bin                                   
|    +-- www                	<--- app startup script
|-- public                  	<--- Express view folder
|    |-- api                
|    |    |-- index.ejs     	<--- loader
|    |    |-- jquery.ejs    	<--- jquery to be imbeded into index.ejs used by loader only
|    |-- assets             	<--- assets folder
|         |-- <version>/<theme> <--- optional version/theme levels
|              |-- css          <--- css folder
|              |-- js           <--- js folder
|              |-- footer.html  <--- footer HTML fragment
|              |-- header.html  <--- header HTML fragment
|-- routes                                
|    +-- index.js           	<--- Express routers
|-- app.js                  	<--- Express app config
|-- client-whitelist.json   	<--- a list of RegEx patterns of allowed clients
|-- package.json            	<--- Node package descriptor
```
### Loader
*Unippear*'s core component is a loader that controls what assets (HTML, CSS, JS, IMG etc) get injected asynchronously to the client document and the order of loading. All assets should be stored in */public/assets*. The loader loads following assets by performing respective operations:

1. All *assets/&lt;version/theme&gt;/css* files sorted alphabetically, nested folders are allowed and sorted after file peers. A CSS file is loaded by appending a stylesheet *&lt;link&gt;* HTML element to the document *&lt;head&gt;*.
2. All *assets/&lt;version/theme&gt;/js* files  sorted alphabetically, nested folders are allowed and sorted after file peers. A JS file is downloaded and evaluated by calling [jQuery.getScript()](http://api.jquery.com/jquery.getscript/). Caching is set to true prior to calling the method.
3. *assets/&lt;version/theme&gt;/header.html* containing header HTML fragment loaded by calling [jQuery.get()](http://api.jquery.com/jquery.get/). By default header is prepended to document *&lt;body&gt;*. The container element can be changed by setting *headerContainer* option when client site invoking the loader. See [Customization](#customization) for details.
4. *assets/&lt;version/theme&gt;/footer.html*  containing footer HTML fragment loaded and inserted same way as *assets/&lt;version/theme&gt;/header.html* except that footer is appended to the container set by *footerContainer* option.

To improve performance, all JS files are combined into one download by default. If individual download is desirable, say for debugging purpose, it can be enabled by toggling `routes.combineJs` to `false` in */app.js*.

The order of loading and parsing the assets is important. A good strategy needs to take performance and Javascript event processing model into account. CSS and JS files should be named in their desired parsing order by, for example, prefixing file names with 0-left-padded digits such as 01_file1.js, 02_file2.js etc. CSS files are loaded in parallel. To ensure event handler is defined before event is triggered, the loader postpones loading header and footer only after all JS files have been loaded and evaluated. If JS files are not combined, then each JS file is loaded and evaluated in serial. Either combined JS or the first individual JS file is loaded in parallel with CSS files. Header and footer are also loaded in parallel.

### Versioning and Theming (Optional)
Versioning and theming provide ways to partition and group assets under */public/assets*. However, *Unippear* doesn't recognize those concepts. Instead, it only recognizes folders. Versioning and theming are nothing but interpretations we gave to folder levels under *assets*. For example, in an implementation where multiple themes are provided under a version, the folder structure may look like:

```
/public/assets
 |-- v1
 |    |-- theme1
 |    |    |-- css
 |    |    |-- img
 |    |    |-- js
 |    |    |-- footer.html
 |    |    |-- header.html
 |    +-- theme2
 |         |-- ...
 |-- v2
 |    |-- theme1
 |    |    |-- ...
 |    +-- theme2
 |         |-- ...
 +-- latest  <--- symbolic link pointing to /public/assets/v2

```
Note a *latest* symbolic folder can be manually provided  pointing to latest version (v2 in this case) to support auto-upgrade.

The version and theme a client website uses is determined by URL path of the loader in client HTML document, as shown in [Serving](#serving) below.

### Templating
*Unippear* uses [EJS](https://github.com/tj/ejs) template engine. EJS view folder is set to */public*. Any file in */public* can be converted to EJS template by appending file extension *.ejs* to the file name. An EJS template performs context substitution. In particular, *Unippear* supplies two context variables: 

1. `unippearHost` set to  *&lt;protocol&gt;:// &lt;host_name&gt;:&lt;port&gt;* of *Unippear* service web app to allow emitting fully qualified URL. 
2. `thisFileUrlPath` set to the URL path portion (excluding file name) of the template file to allow emitting relative URL. This variable is useful to support versioning and theming because the variable contains their names.

The URL of an asset rendered by EJS template should not include the *.ejs* extension.

As an example, suppose we imported a CSS asset from an existing website to file */public/assets/v1/theme1/css/header.css*, which maps to URL *//&lt;my-unippearHost&gt;/v1/theme1/css/header.css*. The file contains
```
#logo {
	background: url(/img/logo.png) no-repeat;
}
```
When this CSS is served to a client website, */img/logo.png* will be relative to the host  of client website, not *Unippear*. To let *Unippear* take control of the logo file, first copy the logo to */public/assets/v1/theme1/img/logo.png*, then rename file *header.css* to *header.css.ext*, lastly change CSS to generate fully qualified logo URL:
```
#logo {
	background: url(<%=unippearHost%><%=thisFileUrlPath%>/../img/logo.png) no-repeat;
}
```
The URL of *header.css* remains to be *//&lt;my-unippearHost&gt;/v1/theme1/css/header.css*.

*thisFileUrlPath* is set to */v1/theme1/css* in this context. Later on a new version, say *v2*, can be created by duplicating folder *v1* without changing the css because *thisFileUrlPath* will be */v2/theme1/css* in that context.

### Access Control
Without access control, your branding can be easily spoofed. *Unippear* prevents unauthorized access by validating the incoming request against a whitelist in file */client-whitelist.json*. If *Referer* and/or *Origin* (used by CORS) request headers are supplied, they must match at least one RegEx patterns of the whitelist.

### Implementation
After you have checked out live demo and familiarized with the topics described above, you can build your site layout service by:

1. [installing](#installation) *Unippear*
2. replacing files in */public/assets* with your own assets. Devise a versioning and/or theming directory structure as you see fit.
3. updating /client-whitelist.json with a list of authorized client URL patterns. Updates made at runtime take effect immediately without restarting Node.
4. launching *Unippear* by running `bin/www`. By default, the process listens on port 3000. To change port, either modify */bin/www* or set env PORT before launching node. Running *Node* as a service or setting up a front-end reverse proxy are beyond the scope of this document. It's easy to google a solution.

### Serving
*Unippear* layout is served by adding following Javascript to an authorized client website page:
```
<script type="text/javascript" src="//<your-unippearHost>/<version/theme>/"></script>
<script type="text/javascript">
    unippear();
</script>
```
You need to convey *&lt;your-unippearHost&gt;*, allowable *&lt;version&gt;* and *&lt;theme&gt;*, if applicable, to intended clients.

### Customization
The call to `unippear()` can take an option parameter. Out of the box *Unippear* only supports two options - *headerContainer* and *footerContainer* to specify which DOM element should header and footer be inserted into respectively. When omitted, header and footer are inserted into *&lt;body&gt;*. If, for instance, a client site HTML page has following DOM:
```
<!doctype html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    <div id='root'>...</div>
  </body>
</html>
```
and it is desirable to insert header and footer into root *&lt;div&gt;*, then call `unippear()` with:
```
unippear({
   "headerContainer": "#root",
   "footerContainer": "#root"
});
```
The value of *headerContainer* and *footerContainer* follows jQuery [selector](http://api.jquery.com/category/selectors/) syntax. If multiple elements match the selector, the first element is chosen.

Other options allowed is implementation specific. For example, if in your implementation, header contains an optional search box and it's up to a client site to decide whether or not to show the searchBox, then you can support an option called *showSearchBox*. A client site that wants to hide search box can call *unippear* this way:
```
unippear({
   "showSearchBox": false
});
```

To implement *showSearchBox*, you can add code somewhat like following to one of your JS assets if you use jQuery:
```
$(document).on('headerLoaded', function() {
    if(unippear.showSearchBox === false){
        $('#searchBox').hide();
    }
});
```
Note that options set by client is accessible from global variable *unippear*. Also note the code is in the handler of custom event *headerLoaded* rather than the built-in *ready* event of document. More on this topic in [Best Practice](#best-practice) below.

## Best Practice
It is assumed that the layout to be implemented as a service will be imported from an existing website since nearly all organizations already have a web presence. In simplest implementation the import task involves no more than copy & paste files and HTML code fragments. Complexity arises when client-side Javascript needs to be executed to render header and footer. Following guidelines are drawn from converting an a real production web site:
* It is recommended to add a version of jQuery to JS asset folder and order it on top. Other library or means to manipulate DOM is acceptable but you need to implement your own custom event trigger in the loader.
* HTML fragments and assets loaded by AJAX follow a different DOM parsing order. Events that works before may not get triggered at desired time. For  instance, jQuery `$(function(){})` block is executed when DOM is ready. But if header and footer are injected to the DOM by AJAX, then DOM *ready* event will be triggered prior to header and footer are available. To get the desired behavior, if jQuery is added to assets or if directly referenced by the document, *Unippear* will trigger a document level custom event *headerLoaded* and *footerLoaded* when headers and footers are loaded respectively. Javascript that depends on the readiness of header, for example, should then be enclosed in `$(document).on('headerLoaded')` instead.
* When a HTML fragment is injected into DOM by AJAX, some browsers skip evaluating inline Javascript in the fragment. Therefore header and footer HTML fragment should be free of inline Javascript.
* If total size of JS files is large, consider using [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition). If so, only put AMD engine such as RequireJS and the bootstrap code in */public/assets/&lt;version/theme&gt;/js*. Save AMD modules in another folder under */public/assets/&lt;version/theme&gt;*, say */public/assets/&lt;version/theme&gt;/modules*.
* If a client site is composed of multiple pages and no templating engine is used to help eliminate code duplication, the call to `unippear()` should be factored out to a client-side JS file rather than  defined inline to facilitate changing option parameter in the future. 
* A client site usually needs some regression test before upgrading to a new layout version. The *latest* symbolic link should be advertised precautiously unless you can guarantee backward compatibility.

## Installation
If you have [Node](http://nodejs.org/) installed, simply run
```npm install unippear```

##License

The MIT License (MIT)

Copyright (c) 2014 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
