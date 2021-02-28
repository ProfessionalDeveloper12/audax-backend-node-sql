const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Payment = db.payment;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.updateProfile = (req, res) => {
  const user = req.body;

  User.update(user, { where: { id: user.id } })
    .then(result => {
      User.findOne({
        where: {
          id: user.id
        }
      })
        .then(updatedUser => {
          if (!updatedUser) {
            return res.status(404).send({ error: true, errorMessage: "User Not found." });
          }

          res.status(200).send({
            error: false,
            user: updatedUser
          });
        })
    })
    .catch(error => {
      cosole.log(error)
      res.status(400).send({ error: true, eooroMessage: "Unable to update" })
    })
}

exports.updatePaymentStatus = (req, res) => {
  const userId = req.body.userId;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (month == 0) {
    year--;
    month = 11;
  }

  const payment = {};
  payment.paid_status = 1;


  Payment.update(payment, {
    where: {
      user_id: userId,
      year,
      month
    }
  })
    .then(result => {
      Payment.findOne({
        where: {
          user_id: userId
        }
      })
        .then(updatedPayment => {
          if (!updatedPayment) {
            return res.status(404).send({error: true, errorMessage: 'Cannot find data'});
          }

          res.status(200).send({error: false, payment: updatedPayment});
        })
    })
    .catch(err => {
      res.status(500).send({error: true, errorMessage: "Cannot update data"});
    })
}