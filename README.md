SiteLayoutService
=================

Enforce consistent look-and-feel to multiple enterprise websites through centralized layout manager service.

## Background
A large organization often owns many web sites, such as vanity sites, sites of its  subsidiaries etc, in addition to home portal. Maintaining a consistent look-and-feel for branding purpose is desirable, sometimes even mandatory. In early days when most websites were built with static HTML files, consistency is achieved through sharing a set of template files by copying. Nowadays most sites are built on a server-side scripting platform employing some sort of template engines. For this templating sharing solution to work, adapting the template to a specific engine is unavoidable. However, this conversion effort not only takes time, but also prone to breaking the consistency. Moreover, coordinating template upgrade could also be a challenge.

SiteLayoutService addresses these problems through a service oriented architecture that takes advantage of web 2.0 AJAX technology. The layout is managed in a centralized API service. A client site applies the layout by adding a few lines of Javascript code. 

## Description
## Implementation Guidelines
