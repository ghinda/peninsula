/* LocalStorage polyfill */
if (typeof window.localStorage == 'undefined' || typeof window.sessionStorage == 'undefined') (function () {

var Storage = function (type) {
  function createCookie(name, value, days) {
	var date, expires;

	if (days) {
	  date = new Date();
	  date.setTime(date.getTime()+(days*24*60*60*1000));
	  expires = "; expires="+date.toGMTString();
	} else {
	  expires = "";
	}
	document.cookie = name+"="+value+expires+"; path=/";
  }

  function readCookie(name) {
	var nameEQ = name + "=",
		ca = document.cookie.split(';'),
		i, c;

	for (i=0; i < ca.length; i++) {
	  c = ca[i];
	  while (c.charAt(0)==' ') {
		c = c.substring(1,c.length);
	  }

	  if (c.indexOf(nameEQ) == 0) {
		return c.substring(nameEQ.length,c.length);
	  }
	}
	return null;
  }
  
  function setData(data) {
	data = JSON.stringify(data);
	if (type == 'session') {
	  window.name = data;
	} else {
	  createCookie('localStorage', data, 365);
	}
  }
  
  function clearData() {
	if (type == 'session') {
	  window.name = '';
	} else {
	  createCookie('localStorage', '', 365);
	}
  }
  
  function getData() {
	var data = type == 'session' ? window.name : readCookie('localStorage');
	return data ? JSON.parse(data) : {};
  }


  // initialise if there's already data
  var data = getData();

  return {
	length: 0,
	clear: function () {
	  data = {};
	  this.length = 0;
	  clearData();
	},
	getItem: function (key) {
	  return data[key] === undefined ? null : data[key];
	},
	key: function (i) {
	  // not perfect, but works
	  var ctr = 0;
	  for (var k in data) {
		if (ctr == i) return k;
		else ctr++;
	  }
	  return null;
	},
	removeItem: function (key) {
	  delete data[key];
	  this.length--;
	  setData(data);
	},
	setItem: function (key, value) {
	  data[key] = value+''; // forces the value to a string
	  this.length++;
	  setData(data);
	}
  };
};

if (typeof window.localStorage == 'undefined') window.localStorage = new Storage('local');
if (typeof window.sessionStorage == 'undefined') window.sessionStorage = new Storage('session');

})();

/* Peninsula Unofficial 2012
 * 2012 Ionut Colceriu - ghinda.net
 */
 
/* Get favorites from localStorage */
var starredArtists = localStorage.getItem('starredArtists');

if(starredArtists) {
	starredArtists = JSON.parse(starredArtists);
} else {
	starredArtists = [];
}

// init stars in lists when loading pages
var initFavorites = function(e) {
	var $artist,
		artistId,
		$activePage = $.mobile.activePage,
		$programDetails = $('.program-details', $activePage);

	$('.artist', $activePage).each(function() {
	
		$artist = $(this);
		artistId = $artist.attr('id');
		
		// if artist is in favorites
		if(starredArtists.indexOf(artistId) != -1) {
			// highlight star button
			$('.star-artist', $artist).addClass('starred');
			
			// if element is a favorite, make it visible
			if($artist.hasClass('favorite-artist')) {
				$artist.addClass('show-favorite-artist');
			}
			
		}
	
	});
	
	// if band view
	if($programDetails.length) {
	
		artistId = $programDetails.attr('id');
	
		// if artist is in favorites
		if(starredArtists.indexOf(artistId) != -1) {
			// highlight star button
			$('.star-artist', $programDetails).addClass('starred');
		}
	
	};
	
};

// star current artist
var starArtist = function(e) {

	var $button = $(this),
		artistId = $button.parents('li:first').attr('id');
	
	// if un-starring remove from array
	if($button.hasClass('starred')) {
		starredArtists.splice(starredArtists.indexOf(artistId), 1);
	} else {
	// if not favorited, add to array
		starredArtists.push(artistId);
	}
	
	// toggle highlight star
	$button.toggleClass('starred');
	
	// update localStorage
	localStorage.setItem('starredArtists', JSON.stringify(starredArtists));
};

// init
$(document).bind('pageinit', function() {

	// check starred artists
	$('[data-role=page]').on('pagebeforeshow', initFavorites);
	
	// star artist
	$('.star-artist').on('vclick', starArtist);
	
});