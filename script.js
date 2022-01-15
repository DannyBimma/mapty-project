'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Use the geo-location API to log your location:
navigator.geolocation.getCurrentPosition(
  location => {
    console.log(`🌍 Your browser has identified your current location.`);
    console.log(location);
    // use destructuring to access to coords object and log the
    // longitude/latitude properties:
    const { longitude } = location.coords;
    const { latitude } = location.coords;
    console.log(longitude, latitude);

    // use the coords to log a google maps link to your location:
    console.log(
      `Your browser is showing your current location as: https://www.google.com/maps/@${longitude},${latitude}`
    );
    // use the leaflet library to display a map of your location:
    const coordinates = [longitude, latitude];
    const map = L.map('map').setView(coordinates, 18);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([51.5, -0.09])
      .addTo(map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
  },
  () => {
    alert(`⛔️ The geo-location API failed to obtain your current location!`);
  }
);
