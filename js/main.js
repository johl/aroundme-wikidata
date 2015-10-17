// Localize
i18n.init({ fallbackLng: 'en', useCookie: true }, function(err, t) {
   $("body").i18n();
});
// Language switcher
$('#deutsch').click(function() {
  $.i18n.setLng("de", function(t) {
    $("#location-list").empty(); // Empty the list of results
    $("body").i18n();
  });
});
$('#english').click(function() {
  $.i18n.setLng("en", function(t) {
    $("#location-list").empty(); // Empty the list of results
    $("body").i18n();
  });
});

// Main function
(function() {
  function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // Otherwise, CORS is not supported by the browser.
      xhr = null;
    }
    return xhr;
  }
  function locate_me() {
    // Start the spinner
    var l = Ladda.create(this);
    l.start();
    // Empty the list of results
    $("#location-list").empty();
    // Get current language code
    var lang = $.i18n.lng().substring(0,2);
    // Check if we can do HTML5 geolocation
    if (Modernizr.geolocation) {
       navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude;
          var lon = position.coords.longitude;
          var chantek = "http://api.haykranen.nl/wikidata/";
          // Query data around me
          var query = "query?q=around[625," + lat + "," + lon + "," + "0.5]&callback=?";
          var query_xhr = createCORSRequest('GET', chantek+query);
          if (!query_xhr) {
            throw new Error('CORS not supported');
          }
          query_xhr.onload = function(){
            var response = query_xhr.responseText;
            var data = $.parseJSON(response).response;
            $.each(data, function(index, value) {
              // Call queried entities and display them
              var entity = "entity?q=Q"+ value + "&lang="+ lang + "&callback=?";
              var entity_xhr = createCORSRequest('GET', chantek+entity);
              entity_xhr.onload = function(){
                var response = entity_xhr.responseText;
                var data = $.parseJSON(response).response;
                if (data[Object.keys(data)[0]].sitelinks[lang]) {
                  $("#location-list").append(
                      "<li>" +
                      "<big>" +
                      "<a href=" + "\"" + 
                      data[Object.keys(data)[0]].sitelinks[lang].url +
                      "\">"+
                      data[Object.keys(data)[0]].labels + 
                      "</a>" +
                      "</big>" +
                      "</li>"
                  );
                }
              };
              // Stop the spinner
              l.stop();
              entity_xhr.onerror = function() {
                throw new Error('Error making the request');
              };
              entity_xhr.send();
            });
          };
          query_xhr.onerror = function() {
            throw new Error('Error making the request');
          };
          query_xhr.send();
    });
  } else {
      throw new Error('Geolocation not supported'); 
  }
}
// Bind button to function
$("#locate-me").click(locate_me);
})();

