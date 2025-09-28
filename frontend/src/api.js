// frontend/src/api.js

// Fetch available datasets / metrics
export async function fetchDiseases() {
  const res = await fetch(`${__API_BASE__}/api/diseases`);
  return res.json(); // expects { diseases: ["covid19", "measles"] }
}

// frontend/src/api.js
export async function fetchData(dataset, metric = null) {
  const url = metric
    ? `${__API_BASE__}/api/data?dataset=${dataset}&metric=${metric}`
    : `${__API_BASE__}/api/data?dataset=${dataset}`;
  const res = await fetch(url);
  return res.json();
}

