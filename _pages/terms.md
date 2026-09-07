---
permalink: /terms/
title: Privacy
description: Information about analytics on Jialin Li's website.
analytics: false
sitemap: false
noindex: true
---
{% if site.public_site and jekyll.environment == 'production' and site.analytics.enabled %}
This website uses Google Analytics to understand how visitors use its pages. Google may receive information such as the page URL and your IP address, and may use cookies. See [how Google uses information from sites that use its services](https://policies.google.com/technologies/partner-sites).
{% else %}
This local preview does not use analytics or cookies. External paper and video links open third-party websites with their own privacy policies.
{% endif %}

For questions about this website, contact [{{ site.author.email }}](mailto:{{ site.author.email }}).
