const axios = require('axios');
const { keys } = require('./config');

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
  const possibilities = googleData
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
      event.geometry.location.lng
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

const sortByDistance = (googleData) => {
  let sortedByDistance = googleData.slice(1);
  sortedByDistance.forEach((event) => {
    event.distanceFromTopRated = calculateDistance(
      googleData[0].latlng.lat,
      googleData[0].latlng.lng,
      event.latlng.lat,
      event.latlng.lng
    );
  });
  sortedByDistance = sortedByDistance.sort((a, b) =>
    a.distanceFromTopRated - b.distanceFromTopRated);

  sortedByDistance.unshift(googleData[0]);
  return sortedByDistance;
};

const findRestaurant = (location, placed, restaurants) => {
  restaurants.forEach(restaurant =>
    calculateDistance(
      location.latlng.lat,
      location.latlng.lng,
      Number(restaurant.restaurant.location.latitude),
      Number(restaurant.restaurant.location.longitude)
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
const fillDay = (day, rankedList, interests, restaurants) => {
  let timeSpent = 0;
  let currentEvent = 0;
  let eventsPlaced = 0;
  let restaurantsPlaced = 0;
  while(timeSpent <= 12 && currentEvent < rankedList.length) {
    day[`event${++eventsPlaced}`] = {
      name: rankedList[currentEvent].name,
      location: { latitude: rankedList[currentEvent].geometry.location.lat, longitude: rankedList[currentEvent].geometry.location.lng},
      googleId: rankedList[currentEvent].place_id,
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
const scheduleBuilder = (startDate, endDate, google, restaurantData, predictHQ, interests) => {
  const filteredData = google.map((location) => {
    return { name: location.name, placeId: location.place_id, rating: location.rating, latlng: location.geometry.location };
  });

  const sorted = sortByDistance(filteredData);

  startDate = new Date(startDate);
  endDate = new Date(endDate);
  
  // Get the start day out
  let currentDate = startDate;
  
  // Initialize the empty schedule object
  const schedule = {};
  
  // Get the total number of days that the user will be in the destination
  const numberOfDays =
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Fill the schedule with "day" objects
  for (let i = 1; i < numberOfDays + 2; i += 1) {
    schedule[`day_${i}`] = {};
  }

  const googleLength = google.length;
  
  // Go through each day, fill it out with events
  const days = Object.keys(schedule);
  days.forEach((day) => {
    schedule[day].events = sorted.splice(0, Math.floor(googleLength / (numberOfDays + 1)));
    schedule[day].liveEvents = [];
    schedule[day].restaurants = [];
    predictHQ.forEach((event, i) => {
      if (new Date(event.start).getDate() === currentDate.getDate()) {
        schedule[day].liveEvents.push(event);
        predictHQ.splice(i, 1);
      }
    });
    for (let i = 0; i < 4; i++) {
      schedule[day].restaurants.push(findRestaurant(schedule[day].events[0], 0, restaurantData));
    }
    schedule[day].date = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);

  });
  return schedule;
};

const getSchedule = (startDate, endDate, location, interests, cb) => {
  const query = location.split(' ').join('+');
  const zomatoConfig = {
    headers: {
      'user-key': keys.zomato,
    },
  };
  const predictHQconfig = {
    headers: {
      Authorization: `Bearer ${keys.predictHQToken}`,
    },
  };
  let googleData = [];
  axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+point+of+interest&language=en&key=${keys.googlePlacesAPI}`)
    .then((response1) => {
      googleData = googleData.concat(response1.data.results);
      return axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${response1.data.next_page_token}&key=${keys.googlePlacesAPI}`)
    })
    .then((response2) => {
      if (response2.data.results.length) {
        googleData = googleData.concat(response2.data.results);
      }
      return axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${response2.data.next_page_token}&key=${keys.googlePlacesAPI}`)
    })
    .then((response3) => {
      if (response3.data.results.length) {
        googleData = googleData.concat(response3.data.results);
      }
      return Promise.all([
        axios.get(`https://api.predicthq.com/v1/events/?category=concerts,festivals,performing-arts,sports&within=10mi@${googleData[0].geometry.location.lat},${googleData[0].geometry.location.lng}.0060&start.gte=2018-02-11&start.lte=2018-02-17&rank_level=4,5`, predictHQconfig),
        axios.get(`https://developers.zomato.com/api/v2.1/search?lat=${googleData[0].geometry.location.lat}&lon=${googleData[0].geometry.location.lng}&sort=rating`, zomatoConfig),
      ]);
    })
    .then(([predictHQ, zomato]) => {
      cb(scheduleBuilder(startDate, endDate, googleData, zomato.data.restaurants, predictHQ.data.results, interests));
    })
    .catch(err => console.error(err));
};

// const start = new Date('February 10, 2018 00:00:00');
// const end = new Date('Febrauary 13, 2018 00:00:00');
// const query = 'New York City';
// const interests = ['museum', 'park', 'point_of_interest', 'music'];

// getSchedule(start, end, query, interests, response => console.log(response));

module.exports.getSchedule = getSchedule;
