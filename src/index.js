import * as L from "leaflet";

const zip = (a, b) => a.map((k, i) => [k, b[i]]);
const fetchData = async () => {
  const url1 =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326 ";
  const res1 = await fetch(url1);
  const data1 = await res1.json();

  const url2 =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const res2 = await fetch(url2);
  const data2 = await res2.json();

  //console.log(data2);

  let posmig = data2.dataset.value;
  posmig.shift();
  let posIndex = data2.dataset.dimension.Tuloalue.category.index;
  //console.log(posIndex)
  let posArray = Object.keys(posIndex);
  posArray.shift();
  const map1 = posArray.map((x) => x.slice(-3));
  //console.log(map1)
  const zip1 = zip(map1, posmig);
  console.log(zip1);
  const zipInt1 = zip1.map((x) => [parseInt(x[0]), x[1]]);
  zipInt1.sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);
  const last1 = zipInt1.map((x) => x[1]);
  console.log(last1);

  const url3 =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const res3 = await fetch(url3);
  const data3 = await res3.json();

  //console.log(data3)

  let negmig = data3.dataset.value;
  negmig.shift();
  let negIndex = data3.dataset.dimension.Lähtöalue.category.index;
  let negArray = Object.keys(negIndex);
  negArray.shift();
  const map2 = negArray.map((x) => x.slice(-3));
  const zip2 = zip(map2, negmig);
  const zipInt2 = zip2.map((x) => [parseInt(x[0]), x[1]]);
  zipInt2.sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);
  const last2 = zipInt2.map((x) => x[1]);
  console.log(last2);

  data1.features.forEach((object) => {
    object["positive"] = last1[object.id.split(".")[1] - 1];
    object["negative"] = last2[object.id.split(".")[1] - 1];
  });

  console.log(data1);

  // console.log(data2);

  // console.log(data3);

  initMap(data1);
};

const initMap = (data1) => {
  let map = L.map("map", {
    minZoom: -3
  });

  let geoJson = L.geoJSON(data1, {
    weight: 2,
    onEachFeature: getFeature,
    style: getStyle
  }).addTo(map);

  let oms = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const getFeature = (feature1, layer) => {
  if (!feature1.properties.nimi && !feature1.id) return;
  const name = feature1.properties.nimi;
  layer.bindTooltip(name);
  layer.bindPopup(`
  <ul>
  <li>Positive migration: ${feature1.positive} </li>
  <li>Negative migration: ${feature1.negative}</li>
  </ul>`);
};

const getStyle = (feature) => {
  if (Math.pow(feature.positive / feature.negative, 3) * 60 <= 120) {
    return {
      color: `hsl(${
        Math.pow(feature.positive / feature.negative, 3) * 60
      }, 75%, 50%)`
    };
  } else {
    return {
      color: `hsl(120, 75%, 50%)`
    };
  }
};

fetchData();
