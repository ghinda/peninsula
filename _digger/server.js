var request = require('request');
var cheerio = require('cheerio');
var Handlebars = require('handlebars');
var fs = require('fs');
var moment = require('moment');

var dist = './public';

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function(context, block) {
  if (moment) {
    var f = block.hash.format || "MMM Do, YYYY";
    return moment(Date(context)).format(f);
  }else{
    return context;   //  moment plugin not available. return data as is.
  };
});

var hbsBandTemplate = fs.readFileSync('./templates/band.hbs').toString();
var hbsConfigTemplate = fs.readFileSync('./templates/_config.yml').toString();
var bandTemplate = Handlebars.compile(hbsBandTemplate);
var configTemplate = Handlebars.compile(hbsConfigTemplate);

var convertTitle = function(title) {
	return title.toLowerCase().replace(/ /g, '-');
}

var locations = [];

var url = 'http://peninsula.ro/index.php/schedule/musical';
request(url, function(err, resp, body) {
	if (err) throw err;

	$ = jQuery = cheerio.load(body);

	// scraping!
	$('section.schedule_location').each(function(i, schedule) {

		var $schedule = $(this);

		// get title
		var locationTitle = $schedule.find('h1').text();

		// cleanup table rowspans
		// and parse values
		var $table = $('table', $schedule),
			$tr = $('tr', $table);

		$tr.each(function(i, row) {

			$('td', $(this)).each(function(j, cell) {

				var rowspan = parseInt($(cell).attr('rowspan') || 1);

				var q;
				for(q = 1; q < rowspan; q++) {

					// add empty cell to the next rows
					var foundRow = $tr.eq(i + q);

					$('td', foundRow).eq(j).before('<td rowspan="1"></td>');

				}

				$(cell).attr('rowspan', 1);

				var dayHeader = $('tr', $table).first().find('th').eq(j + 1).text(),
					day = parseInt(dayHeader.replace(/\D+/g, '')),
					hour = $('th.hour', $(row)).text(),
					parsedHour = parseInt(hour.split(':')[0]);

				if(hour.length < 5) {
					hour = '0' + hour;
				}

				var dateDay = (parsedHour < 8 && parsedHour >= 0) ? day + 1 : day;

				// hour
				var band = {
					name: $(cell).text(),
					link: $(cell).find('a').attr('href'),
					day: day,
					date: new Date('2013-07-' + dateDay + 'T' + hour).toISOString()
				}

				//console.log(band.day);
				console.log(band.date);
				//console.log(parseInt(band.day));

				if(band.name !== '') {
					//console.log(day, hour, band);
					if(band.link) console.log(band.link);
				}

				var compiledTemplate = bandTemplate({ 'band': band });

				// write to file
				//fs.mkdirSync(dist + '/test', 0755);
				//fs.writeFileSync(dist + '/test/test.md', compiledTemplate);

			});


		});

		// parse schedule

		console.log(convertTitle(locationTitle));

		locations.push({ name: convertTitle(locationTitle) });

	});

	var compiledTemplate = configTemplate({ 'locations': locations });

	// write to file
	//fs.mkdirSync(dist + '/test', 0755);
	fs.writeFileSync(dist + '/_config.yml', compiledTemplate);

});
