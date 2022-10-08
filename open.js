require("dotenv").config();
const open = require("open");

open(`${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/login`);