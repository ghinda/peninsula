var request = require('request');
var cheerio = require('cheerio');
var Handlebars = require('handlebars');
var fs = require('fs');
var moment = require('moment');

var dist = './public';
var days = [ 18, 19, 20, 21 ];

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function(context, block) {
  if (moment) {
    var f = block.hash.format || "";
    return moment(context).format(f);
  }else{
    return context;   //  moment plugin not available. return data as is.
  };
});

var download = function(uri, filename){
	request.head(uri, function(err, res, body){
		request(uri).pipe(fs.createWriteStream(filename));
	});
};

var hbsBandTemplate = fs.readFileSync('./templates/band.hbs').toString();
var hbsDayTemplate = fs.readFileSync('./templates/day.hbs').toString();
var hbsDayStageTemplate = fs.readFileSync('./templates/daystage.hbs').toString();
var hbsConfigTemplate = fs.readFileSync('./templates/_config.yml').toString();

var bandTemplate = Handlebars.compile(hbsBandTemplate);
var dayTemplate = Handlebars.compile(hbsDayTemplate);
var dayStageTemplate = Handlebars.compile(hbsDayStageTemplate);
var configTemplate = Handlebars.compile(hbsConfigTemplate);

var convertTitle = function(title) {
	return title.toLowerCase().replace(/ /g, '-');
}

var locations = [];

var rmDir = function(dirPath) {
	try { var files = fs.readdirSync(dirPath); }
	catch(e) { return; }
	if (files.length > 0)
	for (var i = 0; i < files.length; i++) {
		var filePath = dirPath + '/' + files[i];
		if (fs.statSync(filePath).isFile())
		fs.unlinkSync(filePath);
		else
		rmDir(filePath);
	}
	fs.rmdirSync(dirPath);
};

// cleanup public
rmDir(dist);
fs.mkdirSync(dist);

// make folders
fs.mkdirSync(dist + '/ro', '0755');
fs.mkdirSync(dist + '/ro/_posts', '0755');
fs.mkdirSync(dist + '/media', '0755');
fs.mkdirSync(dist + '/media/images', '0755');


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

				var realDate = new Date('2013-07-' + dateDay);
				realDate.setHours(hour.split(':')[0]);
				realDate.setMinutes(hour.split(':')[1]);

				// hour
				var band = {
					name: $(cell).text().replace(/:/g, ''),
					link: $(cell).find('a').attr('href'),
					day: day,
					date: realDate.toISOString(),
					location: locationTitle
				}

				//console.log(band.day);
				//console.log(band.date);
				//console.log(parseInt(band.day));

				if(band.name === '') {
					return;
				}

				var writeBandFile = function() {

					var compiledTemplate = bandTemplate({ 'band': band });

					var fileName = realDate.getFullYear() + '-' + (realDate.getMonth() + 1) + '-' + realDate.getUTCDate() + '-' + convertTitle(band.name);

					// write to file
					fs.writeFileSync(dist + '/ro/_posts/' + fileName + '.md', compiledTemplate);

				};

				// if has band details page
				if(band.link) {

					// scrape band details
					request(band.link, function(err, resp, body) {
						if (err) throw err;

						var $ = cheerio.load(body);

						var $main = $('.main-text');

						var image = $('header img', $main).attr('src'),
							filename = image.split('/').pop(),
							description = $('.text', $main).text().trim();

						if(filename) {
							download(image, dist + '/media/images/' + filename);
							band.image = filename;
						}

						band.description = description;

						writeBandFile();

					});

				} else {

					writeBandFile();

				}



			});


		});

		// parse schedule

		//console.log(convertTitle(locationTitle));

		locations.push({
			name: locationTitle,
			filename: convertTitle(locationTitle)
		});

	});

	days.forEach(function(day) {

		var compiledTemplate = dayTemplate({ 'day': day });

		// write to file
		fs.writeFileSync(dist + '/ro/day' + day + '.html', compiledTemplate);

		locations.forEach(function(location) {

			var compiledTemplate = dayStageTemplate({
				'day': day,
				'location': location.name
			});

			// write to file
			fs.writeFileSync(dist + '/ro/day' + day + location.filename + '.html', compiledTemplate);

		});

	});

	var compiledTemplate = configTemplate({
		'locations': locations,
		'days': days
	});

	// write to file
	fs.writeFileSync(dist + '/_config.yml', compiledTemplate);

});
