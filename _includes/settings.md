{% if page.url contains '/hu/' %}
	{% assign lang = 'hu' %}
{% else %}
	{% assign lang = 'ro' %}
{% endif %}

{% assign baseurl_nolang = 'https://www.ghinda.net/peninsula' %}
{% assign baseurl = baseurl_nolang | append: '/' | append: lang %}
