const api_key = "319574139c3d65012c05bc9d3e466609";
const settings_el = document.querySelector(".settings");
const info_el = document.querySelector(".info");
let playing = false;
let settings = { username: "", polling: "3" };

function requestUpdate(api_key, user) {
  if(user != "")
  {
    let url = `https://ws.audioscrobbler.com/2.0/?api_key=${api_key}&method=user.getRecentTracks&user=${user}&extended=1&limit=1&format=json`;
  
    let request = new Request(url, {
      method: "GET",
    });
  
    return fetch(request);
  }
}

function successHandler(value) {
  value.json().then(
    (data) => {
      let track = data.recenttracks.track[0];
      let el_info = document.querySelector(".info .status");
      let el_artist = document.querySelector(".info .artist");
      let el_title = document.querySelector(".info .title");

      if (track["@attr"] == undefined) {
        if (playing) {
          // Stop Playing
          playing = false;
          el_title.classList.add("invisible");
          el_artist.classList.add("invisible");
          el_info.classList.add("invisible");
        }
      } else if (playing == false) {
        // Start Playing
        playing = true;
        el_artist.innerText = track.artist.name;
        el_title.innerText = track.name;
        el_title.classList.remove("invisible");
        el_artist.classList.remove("invisible");
        el_info.classList.remove("invisible");
      } else {
        // Track Change
        let old_artist = el_artist.innerText;
        let old_title = el_title.innerText;
        if (old_artist != track.artist.name || old_title != track.name) {
          el_artist.innerText = track.artist.name;
          el_title.innerText = track.name;
        }
      }
    },
    (reason) => {}
  );
  setTimeout(tick, settings["polling"] * 1000);
}

function failureHandler(reason) {
  console.log("Last.FM Query failed:", reason);
  setTimeout(tick, 60000);
}

function tick() {
  let rq = requestUpdate(api_key, settings["username"]);
  rq.then(successHandler, failureHandler);
  rq.catch(failureHandler);
}

function init() {
  document
    .querySelectorAll(".toggle")
    .forEach((element) => element.addEventListener("click", toggle));
  if(document.cookie)
  {
    let cookies = document.cookie
      .split(";")
      .map((cookie) => cookie.split("="))
      .reduce(
        (accumulator, [key, value]) => ({
          ...accumulator,
          [key.trim()]: decodeURIComponent(value),
        }),
        {}
      );
    info_el.classList.toggle("hidden")
    settings = { ...settings, ...cookies };
  }
  else {
    settings_el.classList.toggle("hidden")
  }
  document.querySelector("#save").addEventListener("click", save)
  document.querySelector("#username").value = settings["username"];
  document.querySelector("#polling").value = settings["polling"];
}

function save() {
  document.cookie = "username=" + document.querySelector("#username").value;
  document.cookie = "polling=" + document.querySelector("#polling").value;
}

function toggle() {
  settings_el.classList.toggle("hidden");
  info_el.classList.toggle("hidden");
}

(function () {
  init();
  tick();
})();
