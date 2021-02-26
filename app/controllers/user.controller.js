const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;

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

  User.update(user, {where: {id: user.id}})
      .then(result => {
        console.log(result);
        User.findOne({
          where: {
            id: user.id
          }
        })
          .then(updatedUser => {
            if (!updatedUser) {
              return res.status(404).send({error: true, errorMessage: "User Not found." });
            }

            res.status(200).send({
              error: false,
              user: updatedUser
            });
          })
      })
      .catch(error => {
        cosole.log(error)
        res.status(400).send({error: true, eooroMessage: "Unable to update"})
      })
}