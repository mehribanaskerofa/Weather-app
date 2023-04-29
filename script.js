
const root = document.getElementById("root");
const popup = document.getElementById("popup");
const textInput = document.getElementById("text-input");
const form = document.getElementById("form");

let store = {
    coord:{
      lon:20.99,
      lat:40.34
    },
    weather:{},
    main:{
      feelsLike:0
    },
    sys:{
      country:""
    }
};

const link =
  "https://api.openweathermap.org/data/2.5/weather";

const apiKey="&appid="+"b535d77ec67015546740bd5439a80117";


async function getWeatherdata(){
  const lat_lon="?lat="+store.coord.lat+"&lon="+store.coord.lon;
  const result = await fetch(`${link}${lat_lon}${apiKey}&units=metric`);
  const data=await result.json();
  return data;
}
function setLocalStorage(){
  localStorage.setItem("lonlat", JSON.stringify({
    lon: store.coord.lon,
    lat: store.coord.lat
  }));
}
function setPosition(position){
  console.log(position.coords.latitude+"hjk"+position.coords.latitude);
    store={
      ...store,
      coord:{
        lon: position.coords.longitude,
        lat: position.coords.latitude
      }
    }
    setLocalStorage();
    fetchData();
}


function getLocalStorageData(){
  const lonlat=JSON.parse(localStorage.getItem("lonlat"));
  if(lonlat){
      store={
        ...store,
        coord: {
          lon: lonlat['lon'],
          lat: lonlat['lat']
        }
      }
    }
}



const fetchData = async () => {
  try {
   
    getLocalStorageData();

    // const latlon = localStorage.getItem("query") || store.city;

    // console.log(store.coord.lat);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setPosition);
    }

    setLocalStorage();

    const data = await getWeatherdata();

    const {
      coord:{
        lon: lon,
        lat: lat
      },
      weather:weather,
      main:{
        feels_like: feelsLike
      },
      sys:{
        country: country
      }
    } = data;

    store = {
      ...store,
      coord:{
        lon: lon,
        lat: lat
      },
      weather:weather[0],
      main:{
        feels_like: feelsLike
      },
      sys:{
        country: country
      }
    };

    renderComponent();

    initMap()
  } catch (err) {
    console.log(err);
  }
};

const getImage = (iconcode) => {
  return "http://openweathermap.org/img/w/" + iconcode + ".png";
};



const markup = () => {
  
  const {   
    weather:weather,
    main:{
      feels_like: feelsLike
    },
    sys:{
      country: country
    } 
  } =store;
  return `<div class="container"> 
            <div class="top">
              <div class="city">
                <div class="city-subtitle">Weather Today in</div>
                  <div class="city-title" id="city">
                  <span>${country}</span>
                </div>
              </div>
              <div class="city-info">
                <div class="top-left">
                <img class="icon" src="${getImage(weather.icon)}" alt="" />
                <div class="description">${weather.description}</div>
              </div>
            
              <div class="top-right">
                <div class="city-info__title">${feelsLike}°</div>
              </div>
            </div>
          </div>
           <div id="map"></div>
      </div>`;
};

const togglePopupClass = () => {
  popup.classList.toggle("active");
};

const renderComponent = () => {
  root.innerHTML = markup();

  const city = document.getElementById("city");
  city.addEventListener("click", togglePopupClass);
};

const handleInput = (e) => {
  store = {
    ...store,
    city: e.target.value,
  };
};

const handleSubmit = (e) => {
  e.preventDefault();
  const value = store.city;

  if (!value) return null;

  localStorage.setItem("query", value);
  fetchData();
  togglePopupClass();
};

form.addEventListener("submit", handleSubmit);
textInput.addEventListener("input", handleInput);

fetchData();




function initMap() {
  const myLatlng = { lat: store.coord.lat, lng: store.coord.lon };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: myLatlng,
  });

  var marker=new google.maps.Marker({
    position: myLatlng,
    map:map,
    title:"You pointed me"
    // icon:""
  });


  let infoWindow = new google.maps.InfoWindow({
    content: "<h3>This is my spot!</h3>",
    position: { lat: store.coord.lat-0.0001, lng: store.coord.lon-0.0001 }
  });


  marker.addListener("click", () => {
    infoWindow.open(map,marker);
  });
}

