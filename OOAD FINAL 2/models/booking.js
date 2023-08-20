const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    arrivalDate: {
      type: String,
      required: true,
    },
    departureDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
