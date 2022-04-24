const express = require("express");
const router = express.Router();
const fs = require("fs");
const sendResponse = require("../helpers/utilities");
const isAuthenticated = require("../middleware/isAuthenticated");
const validateQuery = require("../middleware/validateQuery");

const loadData = () => {
  //read part of the file
  let jobDb = fs.readFileSync("data.json", "utf8");
  jobDb =JSON.parse(jobDb);
  jobDB.ratings.forEach(
    (rating,index)=>
    (jobDb.ratings[index]={
      ...ratings,
      averageRatings:
      (rating.workLifeBalanceRatings +
        rating.payAndBenefits +
        rating.jobsSecurityAndAdvancement +
        rating.management +
        rating.culture) /
        5,
    })
  );

  let map = {};
  jobDb.ratings.forEach(
    (rating) => 
      (map[rating.id] = { id: rating.id, average: rating.averageRatings})
  );

  jobDb.companies.forEach((company)=>
    company.ratings.forEach(
      (rating,index)=> (company.ratings[index] = map[rating].average)
    )
  );

  jobDb.companies.forEach((company)=> {
    let sum = 0;
    company.ratings.forEach((rating) => (sum = sum + parseInt(rating)));
    company.averageRating = sum / company.numOfRatings;
  });

  return jobDb;

};

/* GET companies. */
router.get("/companies", function (req, res, next) {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const city = req.query.city;

  let compList = [];
  let message = "";
  const compInfo = loadData().companies;
  console.log("city", city);
  try {
    if (!city) {
      compList = compInfo;
      message = "No city available";
    } else {
      const citySplit = city.split(",");
     
      const jobsData = loadData().jobs;
      let jobsByCity = [];
      citySplit.forEach(
        (city) =>
          (jobsByCity = [
            ...jobsByCity,
            ...jobsData.filter((job) => job.city === city),
          ])
      );
      compIdbyCity = jobsByCity.map((job) => job.companyId);
      compList = compInfo.filter(
        (company) => compIdbyCity.indexOf(company.id) > -1
      );
      message = "city";
    }

    if (sortBy) {
      console.log(sortBy);
      let order = req.query.order;
      if (order === "asc") {
        compList.sort((a,b) => a.averageRating - b.averageRating);
        message = "sort A to Z ascending";
      } else if (order === "desc") {
        compList.sort((a,b) => b.averageRating - a.averageRating);
        message = "sort A to Z descending";
      }
    }

    let startIndex;
    let endIndex;
    if (page * limit <= compList.length) {
      startIndex = (page - 1) * limit;
      endIndex = page * limit;
      // message = `Get companies list by page ${page} with limit of ${limit}`;
    } else if ((page - 1) * limit <= compList.length) {
      startIndex = (page - 1) * limit;
      endIndex = compList.length;
      // message = `Get companies list by page ${page} with limit of ${limit}`;
    } else if ((page - 1) * limit > compList.length) {
      startIndex = compList.length;
      endIndex = compList.length;
      message = `Page request does not exist`;
    }
    console.log(compList.length);
    compListToRender = compList.slice(startIndex, endIndex);

    return sendResponse(200, compListToRender || {}, message, res, next);
  } catch (error) {
    next(error);
  }
});

// router.get("/testing", function (req, res, next) {
//   const city = req.query.city;
//   console.log(city);
//   if (city) {
//     message = "city";
//     citySplit = city.split(",");
//     cityOne = citySplit[1];
//     cityTwo = citySplit[2] || "";

//     if (!cityTwo) {
//       message = "no city Two";
//     }
//   } else {
//     message = "no city";
//   }

//   return sendResponse(200, { city }, message, res, next);
// });

router.post("/companies",
validateQuery,
 isAuthenticated,
 function (req, res, next) {
  let message = "";
  let index;

  try {
    const {
      id,
      name,
      benefits,
      description,
      ratings,
      job,
      numOfJobs,
      numOfRatings,
    } = req.body;
    if (
      !id ||
      !name ||
      !benefits ||
      !description ||
      !ratings ||
      !job ||
      !numOfJobs ||
      !numOfRatings
    ) {
      const error = new Error("Missing information");
      error.statusCode = 400;
      throw error;
    }
    {
      const data = loadData();
      index = data.companies.map((e) => e.id).indexOf(id);
      if (index !== -1) {
        const error = new Error("Company already exists");
        error.statusCode = 400;
        throw error;
      } else {
        message = ` add company ${name}`;
        const companyObject = {
          id,
          name,
          benefits,
          description,
          ratings,
          job,
          numOfJobs: parseInt(numOfJobs),
          numOfRatings: parseInt(numOfRatings),
        };
        data.companies.push(companyObject);
        addCompInfo = JSON.stringify(data);
        fs.writeFile("./data.json", addCompInfo, (err) => {});
        return sendResponse(200, {}, message, res, next);
      }
    }
  } catch (error) {
    next(error);
  }
});

router.put("/companies/:id", 
isAuthenticated, 
validateQuery,
function (req, res, next) {
  try {
    const { id } = req.params;
    let data = loadData();
    index = data.companies.map((e) => e.id).indexOf(id);
    if (index === -1) {
      const error = new Error("Company not found");
      error.statusCode = 400;
      throw error;
    }
    {
      message = `${index} add enterprise`;
      data.companies[index] = { ...data.companies[index], enterprise: true };
      let updateData = JSON.stringify(data);
      fs.writeFile("./data.json", updateData, (err) => {});
      return sendResponse(200, {}, message, res, next);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/companies/:id",
 isAuthenticated, 
 validateQuery,
 function (req, res, next) {
  try {
    const data = loadData();

    const { id } = req.params;
    index = data.companies.map((e) => e.id).indexOf(id);
    if (index === -1) {
      const error = new Error("Company not found");
      error.statusCode = 400;
      throw error;
    }
    {
      message = `${index} delete`;
      data.companies.splice(index, 1);
      const updateData = JSON.stringify(data);
      fs.writeFile("./data.json", updateData, (err) => {});
      return sendResponse(200, {}, message, res, next);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
