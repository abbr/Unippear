Unippear
=================

Enforce consistent look-and-feel to multiple enterprise websites through centralized layout manager service.

## Motivation
Large organizations often own many web sites, such as vanity sites, subsidiary sites etc, in addition to home portal. Maintaining a consistent look-and-feel for branding purpose is often desirable, sometimes even mandatory. In early days when most websites were built with static HTML files, consistency is achieved through distributing a set of template files to member sites. Nowadays a lot of sites are built on a server-side scripting platform employing some sort of template engines. For this template sharing solution to work, adapting the template to a specific engine is unavoidable. However, this conversion effort not only takes time, but also prone to breaking the consistency. Besides, coordinating template upgrade could also be a challenge.

*Unippear* addresses these problems through a service oriented architecture (SOA) that takes advantage of Web 2.0 AJAX technology. The layout templates are managed in a centralized API service web app. A member site applies the layout by adding a few lines of Javascript code to invoke the service. This centralized service approach helps enforcing core look-and-feel, yet still gives site builder some degree of freedom to customize presentation through optional configurations.

## Features
* Enforcing consistent header and footer across multiple websites.
* Allowing per-site customization through optional configurations.
* Expediting Javascript downloading by auto combining all Javascript files into one download with Etag caching.
* Layout versioning: A website can choose either ties to a specific layout version or always uses the latest version.
* Security: Only pre-registered client sites can use the service. 

## Description
*Unippear* runs on [Express](http://expressjs.com). The core component is a loader that controls what get injected asynchronously to the document and the order of loading.  *Unippear* mainly consists of following folders and files:
```
/                                         <--- app root
|-- bin                                   
|    +-- www                              <--- app startup script
|-- public                                <--- Express view folder
|    |-- api                              <--- non-payload folder
|    |    |-- index.ejs                   <--- loader
|    |    |-- jquery.ejs                  <--- jquery to be imbeded into index.ejs used by loader only
|    |-- static                           <--- payload folder
|    |    |-- css                         <--- css folder
|    |    |-- img                         <--- img folder
|    |    |-- js                          <--- js folder
|    |    |-- footer.html                 <--- footer HTML fragment
|    |    |-- header.html                 <--- header HTML fragment
|-- routes                                
|    +-- index.js                         <--- Express routers
|-- app.js                                <--- Express app config
|-- package.json                          <--- Node package descriptor

```
## Implementation Guidelines
It is assumed that the layout to be implemented as a service will be imported from an existing website since nearly all organizations already have a web presence. In simplest case the import task involves no more than copy & paste files and HTML code fragments. Complexity arises when client-side Javascript needs to be executed to render header and footer. Following guidelines are drawn from converting an a real production web site:
* HTML fragments and assets loaded by AJAX follow a different DOM parsing order. Events that works before may not get triggered at desired time. For example, jQuery `$(function(){})` block is executed when DOM is ready. But if header and footer are injected to the DOM by AJAX, then DOM *ready* event will be triggered prior to header and footer are available. To get the desired behavior, if jQuery is added to payload or if directly referenced by the document, *Unippear* will trigger a document-level custom event *headerLoaded* and *footerLoaded* when headers and footers are loaded, respectively. Javascript that depends on the readiness of header, for example, should then be enclosed in `$(document).on('headerLoaded')` instead.
* When a HTML fragment is injected into DOM by AJAX, some browsers prevent inline Javascript in the fragment to be executed. Therefore header and footer HTML fragment should be free of inline Javascript.

## Planned Enhancements
* Allow multiple themes

## Installation
```npm install site-layout-service```
