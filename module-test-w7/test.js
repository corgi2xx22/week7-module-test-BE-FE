const fs = require("fs");

const loadData = () => {
  //read part of the file
  let jobData = fs.readFileSync("data.json", "utf8");
  return JSON.parse(jobData);
};

const database = loadData();
let cities = database.jobs.map((job) => job.city);
const cityMap = {};
cities.forEach((city) => (cityMap[city] = true));
cities = Object.keys(cityMap);

// console.log(cities);

const companiesByCity = (city) => {
  const jobsByCity = database.jobs
    .filter((job) => job.city === city)
    .map((job) => job.companyId);
  return database.companies.filter((company) => jobsByCity.indexOf(company.id) > -1);
};

cities.forEach((city) => {
  if (companiesByCity(city).length !== database.companies.length) {
    console.log(city);
  }
});
