const axios = require('axios');
const { keys } = require('./config');
const { breakfast, other } = require('./restaurantTypes');

const attractionTimes = {
  amusement_park: 12,
  aquarium: 3,
  art_gallery: 3,
  book_store: 1,
  bowling_alley: 2,
  casino: 3,
  clothing_store: 1,
  point_of_interest: 3,
  shopping_mall: 3,
  library: 2,
  movie_theater: 3,
  museum: 5,
  night_club: 3,
  park: 1,
  stadium: 5,
  zoo: 5,
};

// Helper function to get the distance between two locations with lat/lng
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1)
    * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist *= 1.609344;
  return dist;
};

// Helper function to rank the likelihood that a user is interested in an event balanced with
// how close that event is to the most recent event
const makeRankings = (googleData, predictHQ, interests, dislikes) => {
  const possibilities = googleData.results
    .filter((event) => {
      for (let i = 0; i < event.types.length; i++) {
        if (interests.includes(event.types[i]) && event.name !== 'Walking Tours' && !dislikes.includes(event.types[i])) {
          return event;
        }
      }
    })
    .sort((a, b) => b.rating - a.rating);

  let sortedByDistance = possibilities.slice(1);
  sortedByDistance.forEach((event) => {
    event.distanceFromTopRated = calculateDistance(
      possibilities[0].geometry.location.lat,
      possibilities[0].geometry.location.lng,
      event.geometry.location.lat,
      event.geometry.location.lng,
    );
  });
  sortedByDistance = sortedByDistance.sort((a, b) =>
    a.distanceFromTopRated - b.distanceFromTopRated);

  sortedByDistance.forEach((event) => {
    event.ranking = (event.rating - event.distanceFromTopRated) / 5;
  });

  sortedByDistance.unshift(possibilities[0]);

  return sortedByDistance;
};

const findRestaurant = (location, placed, restaurants) => {
  restaurants.forEach(restaurant =>
    calculateDistance(
      location.geometry.location.lat,
      location.geometry.location.lng,
      Number(restaurant.restaurant.location.latitude),
      Number(restaurant.restaurant.location.longitude),
    ));
  const sorted = restaurants.sort((a, b) => a.distanceFromTopRated - b.distanceFromTopRated);
  const result = {
    name: sorted[0].restaurant.name,
    location: {
      latitude: Number(sorted[0].restaurant.location.latitude),
      longitude: Number(sorted[0].restaurant.location.longitude), 
    },
  };
  sorted.splice(0, 1);
  return result;
};

// Helper function to fill out the day
const fillDay = (day, rankedList, interests, currentDay, restaurants) => {
  let timeSpent = 0;
  let currentEvent = 0;
  let eventsPlaced = 0;
  let restaurantsPlaced = 0;
  while(timeSpent <= 12 && currentEvent < rankedList.length) {
    day[`event${++eventsPlaced}`] = {
      name: rankedList[currentEvent].name,
      location: { latitude: rankedList[currentEvent].geometry.location.lat, longitude: rankedList[currentEvent].geometry.location.lng},
    };
    if (attractionTimes[rankedList[currentEvent].types[0]]) {
      timeSpent += attractionTimes[rankedList[currentEvent].types[0]];
    } else {
      timeSpent += 1;
    }
    rankedList.splice(currentEvent, 1);
    currentEvent++;
  }
  while (restaurantsPlaced < 5) {
    day[`restaurant${++restaurantsPlaced}`] = findRestaurant(rankedList[0], restaurantsPlaced, restaurants);
  }
};

// Here's where the magic happens
const scheduleBuilder = (startDate, endDate, google, restaurantData, interests) => {
  // Get the user's interests and dislikes, store them in arrays
  
  const dislikes = ['aquarium', 'casino'];

  // Figure out what the current day of the week is to check if it's open then
  let currentDay = startDate.getDay();

  let currentDate = startDate;
  // startDate = 0;

  // Initialize the empty schedule object
  const schedule = {};

  // Get the total number of days that the user will be in the destination
  const numberOfDays =
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Fill the schedule with "day" objects
  for (let i = 1; i < numberOfDays + 2; i += 1) {
    schedule[`day_${i}`] = {};
  }

  // This is just here so that the function can actually run
  const predictHQPlaceHolder = true;

  // Make the ranked list
  const sortedAndRated = makeRankings(google, predictHQPlaceHolder, interests, dislikes);

  // Go through each day, fill it out with events
  const days = Object.keys(schedule);
  days.forEach((day) => {
    fillDay(schedule[day], sortedAndRated, interests, currentDay, restaurantData.restaurants);
    schedule[day].date = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    currentDay = currentDay < 7 ? currentDay + 1 : 0;
  });
  return schedule;
};

const getSchedule = (startDate, endDate, location, interests, cb) => {
  const query = location.split(' ').join('+');
  const config = {
    headers: {
      'user-key': keys.zomato,
    },
  };
  let googleData;
  let restaurantData;
  axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+point+of+interest&language=en&key=${keys.googlePlacesAPI}`)
    .then(googleResponse => {
      googleData = googleResponse;
      axios.get(`https://developers.zomato.com/api/v2.1/search?lat=${googleResponse.data.results[0].geometry.location.lat}&lon=${googleResponse.data.results[0].geometry.location.lng}&sort=rating`, config)
        .then(restaurantResponse => {
          restaurantData = restaurantResponse;
          cb(scheduleBuilder(startDate, endDate, googleData.data, restaurantData.data, interests));
        })
        .catch(error => console.error(error));
    })
    .catch(err => console.error(err));
  // return Promise.all([
  //   axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+point+of+interest&language=en&key=${keys.googlePlacesAPI}`),
  //   axios.get(`https://developers.zomato.com/api/v2.1/search?q=${query}&sort=rating`, config),
  // ])
  //   .then(([restaurants, googlePlaces]) => cb(scheduleBuilder(startDate, endDate, restaurants.data, googlePlaces.data, interests)))
  //   .catch(err => console.error(err));
};



const start = new Date('February 10, 2018 00:00:00');
const end = new Date('Febrauary 13, 2018 00:00:00');
const query = 'New Orleans';
const interests = ['museum', 'park', 'point_of_interest', 'music'];

getSchedule(start, end, query, interests, (schedule) => console.log(schedule));

module.exports.getSchedule = getSchedule;
