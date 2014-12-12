SiteLayoutService
=================

Enforce consistent look-and-feel to multiple enterprise websites through centralized layout manager service.

## Background
A large organization often owns many web sites, such as vanity sites, sites of its  subsidiaries etc, in addition to home portal. Maintaining a consistent look-and-feel for branding purpose is desirable, sometimes even mandatory. In early days when most websites were built with static HTML files, consistency is achieved through sharing a set of template files by copying. Nowadays most sites are built on a server-side scripting platform employing some sort of template engines. For this template sharing solution to work, adapting the template to a specific engine is unavoidable. However, this conversion effort not only takes time, but also prone to breaking the consistency. Moreover, coordinating template upgrade could also be a challenge.

*SiteLayoutService* addresses these problems through a service oriented architecture that takes advantage of Web 2.0 AJAX technology. The layout templates are managed in a centralized API service. A client site applies the layout by adding a few lines of Javascript code invoking the service. This centralize service approach helps enforcing core look-and-feel, yet still gives a site builder some degree of freedom to customize the presentation through optional configurations.

## Features
* Enforcing consistent header and footer across multiple websites.
* Allowing per-site customization through optional configurations.
* Expediting Javascript downloading by auto combining all Javascript files into one download with Etag caching.
* Layout versioning: A website can choose either ties to a specific layout version or always uses the latest version.
* Security: Only pre-registered client sites can use the service. 

## Description

## Implementation Guidelines
It is assumed that the layout to be implemented as a service will be imported from an existing website since nearly all organizations already have a web presence. In simplest case the import task involves no more than copy & paste files and HTML code fragments. Complexity arises when client-side Javascript needs to be executed to render header and footer. Following guidelines are drawn from converting an a real production web site:
* HTML fragments and assets loaded by AJAX follow a different processing order. Events that works before may not get triggered at desired time. For example, jQuery `$(function(){})` block is executed when DOM is ready. But if header and footer are injected to the DOM by AJAX, then DOM *ready* event will be triggered prior to header and footer are available. To get desired behavior, *SiteLayoutService* triggers a document-level custom event *headerLoaded* and *footerLoaded* when headers and footers are loaded, respectively. Javascript that depends on the available of header, for example, should be enclosed in `$(document).on('headerLoaded')` instead.
* When a HTML fragment is injected into DOM by AJAX, some browsers prevent inline Javascript in the fragment to be executed. Therefore header and footer HTML fragment should be free of inline Javascript.

## Planned Enhancements
* Allow multiple themes

## Installation
```npm install site-layout-service```
