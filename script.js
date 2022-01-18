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

// Create the main app class:
class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    // Listen for submission on form:
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    // Listen for a change event on the input type field:
    inputType.addEventListener(`change`, this._toggleElevationField);
  }

  _getPosition() {
    // Use the geo-location API to log your location:
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        this._errorMsg
      );
  }

  _errorMsg() {
    () => {
      alert(`⛔️ The geo-location API failed to obtain your current location!`);
    };
  }

  _loadMap(location) {
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
    const coordinates = [latitude, longitude];
    this.#map = L.map('map').setView(coordinates, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // use the on method from the leaflet library to display the
    // workout inputs:
    this.#map.on(`click`, this._showForm.bind(this));
  }

  _showForm(mappa) {
    this.#mapEvent = mappa;
    form.classList.remove(`hidden`);
    inputDistance.focus();
  }

  _toggleElevationField() {
    // toggle between distance & cadence input fields to match workout:
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    // prevent default reload:
    e.preventDefault();

    // clear input fields:
    // prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ``;

    console.log(mapEvent);

    // destructure the mouseEvent object & extract the lat lat properties:
    const { lat, lng } = this.#mapEvent.latlng;

    // display map markers at clicked point:
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 25,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        })
      )
      .setPopupContent(`Geo-tag dropped`)
      .openPopup();
  }
}

const workoutApp = new App();
