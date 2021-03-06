const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
// const Role = db.role;
const Payment = db.payment;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then(user => {
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      // get user's paid status
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      if (month == 0) {
        year--;
        month = 11;
      }

      Payment.findOne({
        where: {
          user_id: user.id,
          year: year,
          month: month
        }
      })
        .then(payment => {
          user = user.toJSON();

          if (!payment) {
            // User didn't use this service for the last month
            user.lastMonthUsageAmount = 0;
            user.lastMonthPaidStatus = 0;

            return res.status(200).send({
              error: false,
              user: user,
              token: token
            });
          }

          user.lastMonthUsageAmount = payment.usage_amount;
          user.lastMonthPaidStatus = payment.paid_status;

          res.status(200).send({
            error: false,
            user: user,
            token: token
          });
        })
    })
    .catch(err => {
      res.status(500).send({ error: true, errorMessage: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ error: true, errorMessage: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          error: true,
          accessToken: null,
          errorMessage: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      // get user's paid status
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      if (month == 0) {
        year--;
        month = 11;
      }

      Payment.findOne({
        where: {
          user_id: user.id,
          year: year,
          month: month
        }
      })
        .then(payment => {
          user = user.toJSON();

          if (!payment) {
            // User didn't use this service for the last month
            user.lastMonthUsageAmount = 0;
            user.lastMonthPaidStatus = 0;

            return res.status(200).send({
              error: false,
              user: user,
              token: token
            });
          }

          user.lastMonthUsageAmount = payment.usage_amount;
          user.lastMonthPaidStatus = payment.paid_status;

          res.status(200).send({
            error: false,
            user: user,
            token: token
          });
        })
    })
    .catch(err => {
      res.status(500).send({ error: true, errorMessage: err.message });
    });
};
