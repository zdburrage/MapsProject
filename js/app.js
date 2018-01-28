// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.

      var locations = [{
              title: 'Sapa House',
              location: {
                  lat: 32.781455,
                  lng: -96.79731979999997
              },
              fourSquareId: "57b5183b498ed5c94e11fe20"
          },
          {
              title: 'Woolworth',
              location: {
                  lat: 32.781284,
                  lng: -96.79868299999998
              },
              fourSquareId: "5262cf25498ef231bee38a09"
          },
          {
              title: 'Trees',
              location: {
                  lat: 32.7846208,
                  lng: -96.7843848
              },
              fourSquareId: "40e0b100f964a52075091fe3"
          },
          {
              title: 'Bread Zeppelin',
              location: {
                  lat: 32.7801772,
                  lng: -96.8007728
              },
              fourSquareId: "586128b08f0be47e424bb38a"
          },
          {
              title: 'Flying Horse Cafe',
              location: {
                  lat: 32.7801499,
                  lng: -96.79906260000001
              },
              fourSquareId: "5290ea7d11d23122edf13b03"
          },
      ];

      var infowindows = [];

      var markers = [

      ];

      var Destination = function(d) {
          this.lat = ko.observable(d.location.lat);
          this.lng = ko.observable(d.location.lng);
          this.fourSquareId = ko.observable(d.fourSquareId);
          this.marker = ko.observable();
          this.address = ko.observable('');
          this.phone = ko.observable('');
          this.photo = ko.observable(' ');
          this.categories = ko.observableArray([]);
          this.url = ko.observable('');
      };
      var self;
      var ViewModel = function() {
          self = this;
          self.startLocation = ko.observable('');
          self.endLocation = ko.observable('');
          this.destinations = ko.observableArray([]);
          self.currentLocation = ko.observable();
          locations.forEach(function(d) {
              self.destinations.push(new Destination(d));
          });
          self.query = ko.observable('');
          self.imagePath = ko.observable('');
          var webResult;
          var mobileResult;
          $.ajax({
              url: 'https://api.teleport.org/api/urban_areas/slug:dallas/images/',
              dataType: 'json',
              success: function(data) {
                  mobileResult = data.photos[0].image.mobile;
                  webResult = data.photos[0].image.web;
                  if ($(document).width() >= 800) {
                      self.imagePath(mobileResult);
                  } else {
                      self.imagePath(webResult);
                  }


              },
              error: function(e) {
                  self.imagePath("https://visitdallas.imgix.net/media_gallery/skyline-and-downtown/skyline/Dallas_CVB_Clay_Coleman_2.jpg");
              }
          });

          self.destinations().forEach(function(d) {

              var infowindow = new google.maps.InfoWindow({
                  maxWidth: 200,
              });
              infowindows.push(infowindow);
              var marker;
              marker = new google.maps.Marker({
                  position: new google.maps.LatLng(d.lat(), d.lng()),
                  map: map,
                  animation: google.maps.Animation.DROP
              });
              d.marker = marker;
              $.ajax({
                  url: 'https://api.foursquare.com/v2/venues/' + d.fourSquareId() +
                      '?client_id=ZT2KZ3GBVHOTV4CLUDMOM11B333IIJ2O2V4Z0HTEXT0C1PWF&client_secret=AO4UA0ZBGNXVJNPZXB5J3QNVO5BRHMNE3CJACCMXSCXHK5Y1&v=20171227',
                  dataType: 'json',
                  success: function(data) {
                      // Make results easier to handle
                      var result = data.response.venue;

                      d.address(result.location.address + ' ' + result.location.city + ', ' + result.location.state);
                      d.phone(result.contact.formattedPhone || 'No Phone Number Provided');
                      d.photo(result.bestPhoto.prefix + '100x100' + result.bestPhoto.suffix);
                      d.url(result.url || '');
                      result.categories.forEach(function(c) {
                          d.categories.push(' ' + c.name);
                      });
                      google.maps.event.addListener(d.marker, 'click', function() {
                          self.closeAllInfoWindows();
                          infowindow.open(map, this);
                          d.marker.setAnimation(google.maps.Animation.BOUNCE);
                          setTimeout(function() {
                              d.marker.setAnimation(null);
                          }, 800);
                          infowindow.setContent('<h3>' + d.title() + '</h3>' +
                              '<img src=' + d.photo() + '>' + '<br>' + '<br>' + d.address() +
                              '<br>' + '<br>' + '<p>Phone Number: ' + d.phone() +
                              '</p>' + '<p>Category: ' + d.categories() + '</p>' + '<a href =' + d.url() + '>' + d.url() + '</a>');

                      });

                  },
                  error: function(e) {
                      google.maps.event.addListener(d.marker, 'click', function() {
                          self.closeAllInfoWindows();
                          infowindow.open(map, d.marker);
                          d.marker.setAnimation(google.maps.Animation.BOUNCE);
                          setTimeout(function() {
                              d.marker.setAnimation(null);
                          }, 800);
                          infowindow.setContent('<h5>Foursquare data is unavailable. Please try refreshing later.</h5>');

                      });

                  }

              });
          });

          self.closeAllInfoWindows = function() {
              for (var i = 0; i < infowindows.length; i++) {
                  infowindows[i].close();
              }
          };

          self.showInfo = function(d) {
              google.maps.event.trigger(d.marker, 'click');
          };
          self.mediaQuery = function() {
              if ($(document).width() >= 890) {
                  self.imagePath(mobileResult);
                  map.setZoom(15);
                  map.setCenter(new google.maps.LatLng(32.782946, -96.79096199999998));
              } else {
                  self.imagePath(webResult);
                  map.setZoom(14);
                  map.setCenter(new google.maps.LatLng(32.782946, -96.79096199999998));
              }
          };


          self.getDirections = function() {


              map.directionsService.route({
                  origin: self.startLocation(),
                  destination: new google.maps.LatLng(self.endLocation().lat(), self.endLocation().lng()),
                  travelMode: 'DRIVING'
              }, function(response, status) {
                  if (status === 'OK') {
                      map.directionsDisplay.setDirections(response);
                  } else {
                      window.alert('Directions request failed due to ' + status);
                  }
              });
          };

          self.filterDestinations = ko.computed(function() {
              var search = self.query().toLowerCase();
              return ko.utils.arrayFilter(self.destinations(), function(destination) {
                  if (destination.title().toLowerCase().indexOf(search) >= 0) {
                      destination.marker.setVisible(true);
                  } else {
                      destination.marker.setVisible(false);
                  }
                  return destination.title().toLowerCase().indexOf(search) >= 0;
              });
          });

      };



      var map;

      function initMap() {
          // Constructor creates a new map - only center and zoom are required.
          map = new google.maps.Map(document.getElementById('map'), {
              center: {
                  lat: 32.782946,
                  lng: -96.79096199999998
              },
              zoom: 13
          });
          map.directionsService = new google.maps.DirectionsService();
          map.directionsDisplay = new google.maps.DirectionsRenderer();
          var largeInfowindow = new google.maps.InfoWindow();
          // The following group uses the location array to create an array of markers on initialize.
          for (var i = 0; i < locations.length; i++) {
              // Get the position from the location array.
              var position = locations[i].location;
              var title = locations[i].title;
              // Create a marker per location, and put into markers array.
              var marker = new google.maps.Marker({
                  position: position,
                  title: title,
                  animation: google.maps.Animation.DROP,
                  id: i
              });
              // Push the marker to our array of markers.
              markers.push(marker);
              map.directionsDisplay.setMap(map);

              // Create an onclick event to open an infowindow at each marker.
              marker.addListener('click', function() {
                  populateInfoWindow(this, largeInfowindow);
              });
          }
          infoWindow = new google.maps.InfoWindow();
          getCurrentLocation();
      }


      function getCurrentLocation() {
          if (navigator.geolocation) {
            $('#hidden').toggleClass('hidden');
              navigator.geolocation.getCurrentPosition(function(position) {
                  var geocoder = new google.maps.Geocoder();
                  var pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  };
                  var latlng = new google.maps.LatLng(pos.lat, pos.lng);
                  geocoder.geocode({
                      'latLng': latlng
                  }, function(results, status) {
                      if (status === google.maps.GeocoderStatus.OK) {
                          if (results[1]) {
                              self.startLocation(results[0].formatted_address);
                        var marker = new google.maps.Marker({
                          position: pos,
                          title: 'Your Location (' + results[0].formatted_address + ')' ,
                          animation: google.maps.Animation.DROP,
                          map: map
                        });
                        populateInfoWindow(marker, infoWindow);
                        marker.addListener('click', function() {
                          populateInfoWindow(this, infoWindow);
                        });
                        markers.push(marker);
                        map.setCenter(pos);
                        $('#hidden').toggleClass('hidden');
                          } else {
                              alert('No results found');
                              $('#hidden').toggleClass('hidden');
                          }
                      } else {
                          alert('Geocoder failed due to: ' + status);
                          $('#hidden').toggleClass('hidden');
                      }
                  });
              }, function() {
                  handleLocationError(true, infoWindow, map.getCenter());
              });
          } else {
              // Browser doesn't support Geolocation
              handleLocationError(false, infoWindow, map.getCenter());
          }
      }


      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
          infoWindow.setPosition(pos);
          infoWindow.setContent(browserHasGeolocation ?
              'Error: The Geolocation service failed.' :
              'Error: Your browser doesn\'t support geolocation.');
          infoWindow.open(map);
          $('#hidden').toggleClass('hidden');
      }

      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
          // Check to make sure the infowindow is not already opened on this marker.
          if (infowindow.marker != marker) {
              infowindow.marker = marker;
              infowindow.setContent('<div>' + marker.title + '</div>');
              infowindow.open(map, marker);
              // Make sure the marker property is cleared if the infowindow is closed.
              infowindow.addListener('closeclick', function() {
                  infowindow.marker = null;
              });
          }
      }


      function checkScreenForZoom() {
          if ($(document).width() <= 800) {
              map.zoom = 13;
          } else {
              map.zoom = 15;
          }
          // body...
      }


      $(document).ready(function() {
          ko.applyBindings(new ViewModel());
          self.mediaQuery();

      });