export async function fetchDiseases() {
  const res = await fetch(`${__API_BASE__}/api/diseases`);
  return res.json();
}

export async function fetchData(disease) {
  const res = await fetch(`${__API_BASE__}/api/data?disease=${disease}`);
  return res.json();
}
