{% if page.url contains '/hu/' %}
	{% assign lang = 'hu' %}
{% else %}
	{% assign lang = 'ro' %}
{% endif %}

{% assign baseurl_nolang = 'http://ghinda.net/peninsula' %}
{% assign baseurl_nolang = 'http://localhost:4000' %}
{% assign baseurl = baseurl_nolang | append: '/' | append: lang %}
