const db = require("../models");
const request = require('request');
const fetch = require('node-fetch');
const awsConfig = require('../config/aws.config');
const AWS = require('aws-sdk');
const stripeConfig = require("../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);
const Speaker = db.speaker;

const YOUR_DOMAIN = process.env.NODE_ENV.trim() == "development" ? "http://localhost:3000/admin/profile" : "https://audaxfront.ukcourier.a2hosted.com/admin/profile";

exports.getTranscripts = (req, res) => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = awsConfig;
  const region = 'us-east-2';

  const s3 = new AWS.S3({
    region,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

  let getParams = {
    Bucket: 'transcriptionend', // your bucket name,
    Key: 'mockinterview6_____vhbctftb.json' // path to the object you're looking for
  }

  s3.getObject(getParams, function (err, data) {
    // Handle any error and exit
    if (err) {
      res.status(401).send({ error: true, errorObj: err });
      return err;
    }

    // No error happened
    // Convert Body from a Buffer to a String

    let objectData = JSON.parse(data.Body.toString('utf-8')); // Use the encoding necessary

    let speakers = [];

    objectData.dialog.map((transcript, index) => {
      if (!speakers.includes(transcript.speaker)) {
        speakers.push(transcript.speaker);
      }
    });

    objectData.speakers = speakers;

    res.status(200).send({ error: false, scriptData: objectData });
  });
};

exports.createPayment = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service Usage of this month',
            // images: ['https://i.imgur.com/EHyR2nP.png', 'https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 35000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  res.json({ id: session.id });
}

exports.updateSpeakers = (req, res) => {
  const user_id = req.body.userId;
  const meeting_uuid = req.body.meetingUUID;
  const speakers = req.body.speakers.toString();

  Speaker.findOne({
    where: {
      user_id,
      meeting_uuid,
    }
  })
    .then(result => {
      if (result) {
        Speaker.update({
          speakers: speakers
        },
          {
            where: {
              user_id,
              meeting_uuid
            }
          })
          .then(updatedRow => {
            res.status(200).send({ error: false, speakers: { meetingUUID: meeting_uuid, speakers: req.body.speakers } })
          })
      } else {
        Speaker.create({
          user_id,
          meeting_uuid,
          speakers
        })
          .then(createdSpeaker => {
            res.status(200).send({ error: false, speakers: { meetingUUID: meeting_uuid, speakers: req.body.speakers } })
          })
      }
    })
    .catch(findErr => {
      res.status(500).send({ error: true, errorMessage: 'Can\'t find speakers' })
    })
}

exports.getSpeakers = (req, res) => {
  const user_id = req.body.userId;
  const meeting_uuid = req.body.meetingUUID;

  Speaker.findOne({
    where: {
      user_id,
      meeting_uuid,
    }
  })
    .then(result => {
      console.log(result)
      if (result) {
        res.status(200).send({ error: false, speakers: { meetingUUID: result.meeting_uuid, speakers: result.speakers.split(',') } })
      } else {
        res.status(404).send({ error: true, errorMessage: 'no result' })
      }
    })
    .catch(findErr => {
      res.status(500).send({ error: true, errorMessage: 'Can\'t find speakers' })
    })
}

