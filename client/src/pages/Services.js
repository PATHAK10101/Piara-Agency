import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // path to your axios.js

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("/services");
        setServices(res.data);
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {services.map((service) => (
        <div key={service._id} className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold">{service.icon} {service.title}</h2>
          <p className="text-gray-400 mt-2">{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Services;
