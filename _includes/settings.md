{% if page.url contains '/hu/' %}
	{% assign lang = 'hu' %}
{% else %}
	{% assign lang = 'ro' %}
{% endif %}

{% assign baseurl_nolang = '' %}
{% assign baseurl = baseurl_nolang | append: '/' | append: lang %}
