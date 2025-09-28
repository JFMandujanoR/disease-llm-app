// frontend/src/api.js

// Fetch available datasets / metrics
export async function fetchDiseases() {
  const res = await fetch(`${__API_BASE__}/api/diseases`);
  return res.json(); // expects { diseases: ["covid19", "measles"] }
}

// Fetch data for a given dataset and metric
export async function fetchData(dataset = "covid19", metric = "cases") {
  let url = `${__API_BASE__}/api/data?dataset=${dataset}`;
  if (dataset === "covid19") {
    url += `&metric=${metric}`;
  }
  const res = await fetch(url);
  return res.json(); // returns array with {date, state, value, lat, lon}
}

