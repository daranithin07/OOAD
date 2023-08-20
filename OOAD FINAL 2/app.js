const express = require("express");
const mongoose = require("mongoose");
const Booking = require("./models/booking");
const User = require("./models/users");
const Room = require("./models/rooms");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { getMaxListeners } = require("process");

let isAdmin = false;
let currentUser = "";
let roomId = "";
// Express app
const app = express();

// Connect to mongodb

const dbURL =
  "mongodb+srv://daranithin:daranithin%4028@cluster0.dmvpqny.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    // listen for requests
    console.log("connected");
    app.listen(2000);
  })
  .catch((error) => {
    console.log(error);
  });

// register view engine
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Sample routes
app.get("/", function (req, res) {
  res.render("index", { currentUser: currentUser });
});

app.get("/login", (req, res) => {
  res.render("login", { message: "", currentUser: currentUser });
});

app.get("/register", (req, res) => {
  res.render("register", { message: "", currentUser: currentUser });
});

app.get("/logout", (req, res) => {
  currentUser = "";
  res.redirect("/");
});

app.get("/pricing", (req, res) => {
  // const room = new Room({
  //   image:
  //     "https://www.gannett-cdn.com/-mm-/05b227ad5b8ad4e9dcb53af4f31d7fbdb7fa901b/c=0-64-2119-1259/local/-/media/USATODAY/USATODAY/2014/08/13/1407953244000-177513283.jpg",
  //   title: "prostitute",
  //   info: "info",
  //   price: "$600",
  //   people: "2",
  // });
  // room.save();
  Room.find()
    .then((result) => {
      console.log(result);
      res.render("pricing", { rooms: result, currentUser: currentUser });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/add", (req, res) => {
  res.render("add", { currentUser: currentUser });
});

app.get("/payment", (req, res) => {
  res.render("payment", { currentUser: currentUser });
});

app.get("/book", (req, res) => {
  if (currentUser) {
    res.render("book", { currentUser: currentUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/features", (req, res) => {
  res.render("features", { currentUser: currentUser });
});

app.get("/bookings", (req, res) => {
  if (currentUser == "admin@gmail.com") {
    Booking.find()
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("bookings", { bookings: result, currentUser: currentUser });
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (currentUser) {
    Booking.find({ email: currentUser })
      .sort({ createdAt: -1 })
      .then((result) => {
        res.render("bookings", { bookings: result, currentUser: currentUser });
      })
      .catch((err) => {
        console.log(err);
      });
      
  } else {
    res.redirect("/login");
  }
});

app.get("/bookings/:id", (req, res) => {
  id = req.params.id;
  Booking.findByIdAndDelete(id)
    .then((result) => {
      res.redirect("/bookings");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/contact-us", (req, res) => {
  res.render("contact-us", { currentUser: currentUser });
})

app.get("/edit/:id", (req, res) => {
  roomId = req.params.id;
  console.log(roomId);
  res.redirect("/edit");
});

app.get("/edit", (req, res) => {
  res.render("edit", { currentUser: currentUser });
});

app.get("/delete/:id", (req, res) => {
  roomId = req.params.id;
  Room.findByIdAndDelete(roomId)
    .then((result) => {
      res.redirect("/pricing");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/edit", (req, res) => {
  const image = req.body.image;
  const title = req.body.title;
  const info = req.body.info;
  const price = req.body.price;
  const people = req.body.people;

  Room.findByIdAndUpdate(
    roomId,
    {
      image: image,
      title: title,
      info: info,
      price: price,
      people: people,
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated");
      }
    }
  );

  res.redirect("/pricing");
});

app.post("/add", (req, res) => {
  const image = req.body.image;
  const title = req.body.title;
  const info = req.body.info;
  const price = req.body.price;
  const people = req.body.people;

  const room = new Room(
    {
      image: image,
      title: title,
      info: info,
      price: price,
      people: people,
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Added");
      }
    }
  );

  room.save();

  Room.find()
    .then((result) => {
      res.render("pricing", { rooms: result, currentUser: currentUser });
    })
    .catch((err) => {
      console.log(err);
    });
});


app.post("/login", (req, res) => {
  User.find({ email: req.body.email }).then((result) => {
    if (result) {
      console.log(req.body.password)
      if (result[0].password == req.body.password) {
        if (result[0].email == "admin@gmail.com") {
          currentUser = "admin@gmail.com";
        } else {
          currentUser = result[0].email;
        }
        res.redirect("/");
      } else {
        res.render("login", {
          message: "Wrong password",
          currentUser: currentUser,
        });
      }
    } else {
      res.render("login", {
        message: "User dosen't exist",
        currentUser: currentUser,
      });
    }
  });
});




app.post("/register", (req, res) => {
  User.find()
    .then((results) => {
      let flag = true;
      results.forEach((result) => {
        if (result.email == req.body.email) {
          res.render("register", {
            message: "Email Already in use",
            currentUser: currentUser,
          });
          flag = false;
        }
      });
      if (flag) {
        if (req.body.password == req.body.checkpassword) {
          const user = new User({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
          });
          user.save();
          currentUser = req.body.email;
          res.redirect("/");
        } else {
          res.render("register", {
            message: "Passwords don't match",
            currentUser: currentUser,
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/book", (req, res) => {
  const booking = new Booking({
    name: req.body.name,
    purpose: req.body.purpose,
    email: req.body.email,
    arrivalDate: req.body.arrivalDate,
    departureDate: req.body.departureDate,
  });
  booking.save();

  res.redirect("/payment");
});

app.post("/payment", (req, res) => {
  res.redirect("/bookings");
});


