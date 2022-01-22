'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Create workout class:
class Workout {
  // store date:
  date = new Date();
  // store id:
  id = Math.floor(100000000 + Math.random() * 900000000);
  // store clicks:
  clicks = 0;

  constructor(coordinates, distance, duration) {
    this.coordinates = coordinates; // [lat, lng]
    this.distance = distance; // kmph
    this.duration = duration; // mins
  }

  _workoutDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    // prettier-ignore
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }

  _click() {
    this.clicks++;
  }
}

// Create running class:
class Running extends Workout {
  type = `running`;
  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);
    this.cadence = cadence;
    this.pacer();
    this._workoutDescription();
  }

  // create pace calc method:
  pacer() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// Create cycling class:
class Cycling extends Workout {
  type = `cycling`;
  constructor(coordinates, distance, duration, elevation) {
    super(coordinates, distance, duration);
    this.elevation = elevation;
    this.speedo();
    this._workoutDescription();
  }

  // create speed calc method:
  speedo() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// Create the main app class:
class App {
  #map;
  #mapEvent;
  workouts = [];

  constructor() {
    this._getPosition();
    // Listen for submission on form:
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    // Listen for a change event on the input type field:
    inputType.addEventListener(`change`, this._toggleElevationField);
    containerWorkouts.addEventListener(`click`, this._mapMove.bind(this));
  }

  // use the geo-location API to get user location:
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        this._errorMsg
      );
  }

  // alert user if getting their location fails:
  _errorMsg() {
    () => {
      alert(`⛔️ The geo-location API failed to obtain your current location!`);
    };
  }

  // display map with the leaflet library:
  _loadMap(location) {
    // use destructuring to access to coords object and log the
    // longitude/latitude properties:
    const { longitude } = location.coords;
    const { latitude } = location.coords;
    console.log(longitude, latitude);

    // log success msg to the console:
    console.log(`🌍 Your browser has identified your current location.`);
    console.log(location);

    // log a google maps link to your location:
    console.log(
      `Your browser is showing your current location at: https://www.google.com/maps/@${longitude},${latitude}`
    );

    // display a map of user location:
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

  // display workout input form:
  _showForm(mappa) {
    this.#mapEvent = mappa;
    form.classList.remove(`hidden`);
    inputDistance.focus();
  }

  // hide workout input form:
  _hideForm() {
    // prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ``;
    form.classList.add(`hidden`);
  }

  // self-explanatory function name here boi!!!:
  _toggleElevationField() {
    // toggle between distance & cadence input fields to match workout:
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  // self-explanatory function name here again boi!!!:
  _newWorkout(e) {
    // prevent default reload:
    e.preventDefault();

    // get data from form:
    const workoutType = inputType.value;
    const workoutDistance = +inputDistance.value;
    const workoutDuration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // create workout validation checker:
    const workoutValidity = (...inputs) =>
      inputs.every(input => Number.isFinite(input));

    // create positive number checker:
    const positiveNum = (...inputs) => inputs.every(input => input > 0);

    // if workout = running, create running object:
    if (workoutType === `running`) {
      const runningCadence = +inputCadence.value;
      // check if data is valid:
      if (
        // !Number.isFinite(workoutDistance) ||
        // !Number.isFinite(workoutDuration) ||
        // !Number.isFinite(runningCadence)
        !workoutValidity(workoutDistance, workoutDuration, runningCadence) ||
        !positiveNum(workoutDistance, workoutDuration, runningCadence)
      ) {
        return alert(`Workout input must be a positive number!`);
      }
      workout = new Running(
        [lat, lng],
        workoutDistance,
        workoutDuration,
        runningCadence
      );
    }

    // if workout = cycling, create cycling object:
    if (workoutType === `cycling`) {
      const cyclingElevation = +inputElevation.value;
      // check if data is valid:
      if (
        !workoutValidity(workoutDistance, workoutDuration, cyclingElevation) ||
        !positiveNum(workoutDistance, workoutDuration)
      ) {
        return alert(`Workout input must be a positive number!`);
      }
      workout = new Cycling(
        [lat, lng],
        workoutDistance,
        workoutDuration,
        cyclingElevation
      );
    }

    // add new workout object to workout array:
    this.workouts.push(workout);
    console.log(workout);

    // display workout map marker:
    this._workoutMarker(workout);

    // display new workouts in list:
    this._workoutRender(workout);

    // hide form

    // clear input fields + hide form:
    // prettier-ignore
    // inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ``;
    this._hideForm();

    // log the mapEvent object:
    console.log(this.#mapEvent);
  }

  // create workout marker method:
  _workoutMarker(workout) {
    L.marker(workout.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 25,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _workoutRender(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === `running` ? `🏃🏾‍♂️` : `🚴🏾‍♂️`
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === `running`) {
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
  </li>`;
    }

    if (workout.type === `cycling`) {
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }
    form.insertAdjacentHTML(`afterend`, html);
  }

  _mapMove(e) {
    if (!this.#map) return;

    const workoutNode = e.target.closest(`.workout`);
    console.log(workoutNode);
    if (!workoutNode) return;

    const workout = this.workouts.find(
      work => work.id == workoutNode.dataset.id
    );
    console.log(workout);

    // use leaflet method to move map:
    this.#map.setView(workout.coordinates, 14, {
      animate: true,
      pan: { duration: 1 },
    });

    workout._click();
  }
}

const workoutApp = new App();
