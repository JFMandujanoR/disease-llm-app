import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";

export default function MapView() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await axios.get(`/api/map-data`, {
        params: { start: "2020-03-01", end: "2020-04-01" }
      });
      setPoints(res.data.features);
    }
    fetchData();
  }, []);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{height:"400px",width:"100%"}}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((f,i)=>(
        <Marker key={i} position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}>
          <Popup>
            {f.properties.country} - {f.properties.province || "N/A"}<br/>
            Cases: {f.properties.cases}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
