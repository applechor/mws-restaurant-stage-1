let restaurants,
    neighborhoods,
    cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // added 
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if(error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if(error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYXBwbGVjaG9yciIsImEiOiJjamxpcWtvYmYwM3p2M3FuNzZ1NjBlMnJlIn0.LIhrujTnwb_TJr-rbtF_HA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);
    //mycode: set tabindex
    // document.querySelector('#map').tabIndex = '-1';
    updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if(error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if(self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    //set li to focusable
    li.setAttribute('tabindex', 0);
    li.setAttribute('aria-labelledby', 'restaurant-' + restaurant.id);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    // add alt attribute image
    image.alt = DBHelper.imageAltForRestaurant(restaurant);
    li.append(image);

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    // add ID attribute for name
    const restaurantID = 'restaurant-' + restaurant.id;
    name.setAttribute('id', restaurantID);
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    // replace ',' with add to new line
    address.innerHTML = restaurant.address.replace(', ', ',<br/>');
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    // set aria-labelledby relationship between name and link
    const restaurantIdView = 'restaurant-' + restaurant.id + '-view';
    more.setAttribute('role', 'button');
    more.setAttribute('id', restaurantIdView);
    more.setAttribute('aria-labelledby', restaurantID + ' ' + restaurantIdView);
    li.append(more);

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }
        self.markers.push(marker);
    });

};
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */


/**
 * set tab index ='-1' for elements in map-container
 */

// window.addEventListener('load', () => {
//   const mapContainer = document.getElementById("map");
//   mapContainer.setAttribute("tabindex", -1);

//   const mapPanes = mapContainer.getElementsByClassName("leaflet-pane");
//   for (let mapPane of mapPanes) {
//   mapPane.setAttribute("tabindex", -1);
//   };

//   const mapMarkerIcons = mapContainer.getElementsByClassName("leaflet-marker-icon");
//   for (let mapMarkerIcon of mapMarkerIcons) {
//   mapMarkerIcon.setAttribute("tabindex", -1);
//   }; 

//   const mapControlZoomIn = mapContainer.getElementsByClassName("leaflet-control-zoom-in")[0];
//   //const mapControlZoomIn = mapControlZoom.getElementsByTagName("a");
//   mapControlZoomIn.setAttribute("tabindex", -1);

//   const mapControlZoomOut = mapContainer.getElementsByClassName("leaflet-control-zoom-out")[0];
//   mapControlZoomOut.setAttribute("tabindex", -1);

//   const mapControl = mapContainer.getElementsByClassName("leaflet-control-attribution")[0];
//   const mapControlAttri1 = mapControl.getElementsByTagName("a")[0];
//   mapControlAttri1.setAttribute("tabindex", -1);

//   const mapControlAttri2 = mapControl.getElementsByTagName("a")[1];;
//   mapControlAttri2.setAttribute("tabindex", -1);

//   const mapControlAttri3 = mapControl.getElementsByTagName("a")[2];;
//   mapControlAttri3.setAttribute("tabindex", -1);

//   const mapControlAttri4 = mapControl.getElementsByTagName("a")[3];;
//   mapControlAttri4.setAttribute("tabindex", -1);  

// })