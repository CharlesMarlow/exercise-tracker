const express = require("express");
const cors = require("cors");
const shortid = require("shortid");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const UsernameAndId = require("./models/user");
const UserFitnessData = require("./models/exercise");
const app = express();

const port = process.env.PORT || 3000;

// DB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/users", {
  useNewUrlParser: true
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Send static files
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST: create new user
app.post("/api/exercise/newuser", (req, res) => {
  let tempId = shortid.generate();
  let data = { username: req.body.username, _id: tempId, fitnessData: Array };
  UsernameAndId.find({ username: data.username }, (err, docs) => {
    if (err) {
      res.send("Query failed. Pleasy try again");
    } else {
      if (docs.length == 0) {
        let saveUserNameAndId = new UsernameAndId(data);
        saveUserNameAndId.save(err => {
          if (err) {
            res.send("Username or UserId could not be saved");
          }
          res.json(data);
        });
      } else {
        res.send("Username already taken");
      }
    }
  });
});

// POST: create new exercise for user
app.post("/api/exercise/add", (req, res) => {
  let date =
    req.body.date === ""
      ? new Date().toDateString()
      : new Date(req.body.date).toDateString();
  let data = {
    username: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    _id: req.body.userId,
    date: date
  };
  let query = req.body.userId;
  if (req.body.description == "") {
    res.send("Description is required");
  } else if (req.body.duration == "") {
    res.send("Duration is required");
  } else {
    UsernameAndId.findById(query, (err, docs) => {
      if (err) {
        res.send("Could not be found");
      } else {
        let data = {
          username: docs.username,
          id: req.body.userId,
          description: req.body.description,
          duration: req.body.duration,
          _id: req.body.userId,
          date: date
        };
        if (docs !== null) {
          docs.fitnessData.push(data);
          docs.save(err => {
            if (err) {
              res.send("Fitness data could not be updated");
            }
            res.json(data);
          });
        } else {
          res.send("Invalid Id");
        }
      }
    });
  }
});

// GET: get user exercise log
app.get("/api/exercise/log?", (req, res) => {
  let searchedUserId = req.query.userId;
  let regex = /^[\d]{4}[-]{1}([0]?[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]?[1-9]{1}|[1]{1}[\d]{1}|[2]{1}[\d]{1}|[3]{1}[0-1]{1})$/;
  let testFromDate = regex.test(req.query.from);
  let testToDate = regex.test(req.query.to);
  let fromDate = req.query.from === undefined ? undefined : req.query.from;
  let toDate = req.query.to === undefined ? undefined : req.query.to;
  let limit = req.query.limit === undefined ? undefined : req.query.limit;

  UsernameAndId.findById(searchedUserId, (err, docs) => {
    if (err) {
      res.send("Id search Failed");
    } else {
      if (docs !== null) {
        if (fromDate !== undefined && toDate !== undefined) {
          if (testFromDate && testToDate) {
            let fitnessDataToDisplay = [];
            docs.fitnessData.map((v, i, a) => {
              if (
                new Date(v.date).getTime() >= new Date(fromDate).getTime() &&
                new Date(v.date).getTime() <= new Date(toDate).getTime()
              ) {
                fitnessDataToDisplay.push(v);
              }
            });
            if (limit > 0) {
              fitnessDataToDisplay = fitnessDataToDisplay.slice(0, limit);
              let result = {
                _id: searchedUserId,
                userName: docs.username,
                from: new Date(fromDate).toDateString(),
                to: new Date(toDate).toDateString(),
                limit: limit,
                log: fitnessDataToDisplay
              };
              res.json(result);
            } else {
              let result = {
                _id: searchedUserId,
                userName: docs.username,
                from: new Date(fromDate).toDateString(),
                to: new Date(toDate).toDateString(),
                limit: limit,
                log: fitnessDataToDisplay
              };
              res.json(result);
            }
          } else {
            res.send(
              "Wrong format: PLEASE ENTER DATE IN xxxx-xx-xx FORMAT"
            );
          }
        } else if (fromDate === undefined && toDate !== undefined) {
          if (testToDate) {
            let fitnessDataToDisplay = [];
            docs.fitnessData.map((v, i, a) => {
              if (new Date(v.date).getTime() <= new Date(toDate).getTime()) {
                fitnessDataToDisplay.push(v);
              }
            });
            if (limit > 0) {
              fitnessDataToDisplay = fitnessDataToDisplay.slice(0, limit);
              let result = {
                _id: searchedUserId,
                userName: docs.username,
                to: new Date(toDate).toDateString(),
                limit: limit,
                log: fitnessDataToDisplay
              };
              res.json(result);
            } else {
              let result = {
                _id: searchedUserId,
                userName: docs.username,
                to: new Date(toDate).toDateString(),
                limit: limit,
                log: fitnessDataToDisplay
              };
              res.json(result);
            }
          } else {
            res.send(
              "FROMDATE is missing, TODATE is PRESENT and is of the WRONG format - PLEASE ENTER TODATE IN xxxx-xx-xx FORMAT"
            );
          }
        } else if (fromDate !== undefined && toDate === undefined) {
          if (testFromDate) {
            let fitnessDataToDisplay = [];
            docs.fitnessData.map((v, i, a) => {
              if (new Date(v.date).getTime() >= new Date(fromDate).getTime()) {
                fitnessDataToDisplay.push(v);
              }
            });
            if (limit > 0) {
              fitnessDataToDisplay = fitnessDataToDisplay.slice(0, limit);
              let result = {
                _id: searchedUserId,
                userName: docs.username,
                from: new Date(fromDate).toDateString(),
                limit: limit,
                log: fitnessDataToDisplay
              };
              res.json(result);
            } else {
              let result = {
                _id: searchedUserId,
                userName: docs.username,
                from: new Date(fromDate).toDateString(),
                limit: limit,
                log: fitnessDataToDisplay
              };
              res.json(result);
            }
          } else {
            res.send(
              "TODATE is missing, FROMDATE is PRESENT but is of the WRONG format - PLEASE ENTER FROMDATE IN xxxx-xx-xx FORMAT"
            );
          }
        } else if (fromDate === undefined && toDate === undefined) {
          res.json(docs.fitnessData);
        }
      } else {
        res.send("UserId not found");
      }
    }
  });
});

//Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "Not Found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});


app.listen(port, () => {
  console.log(`App is listening on port ${port}. This is great news!`);
});
