const db = require("../models");
const request = require('request');
const fetch = require('node-fetch');
const awsConfig = require('../config/aws.config');
const AWS = require('aws-sdk');
const stripeConfig = require("../config/stripe.config");
const { user } = require("../models");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);
const Transcript = db.transcript;

const YOUR_DOMAIN = process.env.NODE_ENV.trim() == "development" ? "http://localhost:3000/admin/profile" : "https://audaxfront.ukcourier.a2hosted.com/admin/profile";

exports.getTranscripts = (req, res) => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = awsConfig;
  const region = 'us-east-2';
  const user_id = req.body.userId;
  const meeting_uuid = req.body.meetingUUID;

  Transcript.findOne({
    where: {
      user_id,
      meeting_uuid,
    }
  })
    .then(result => {
      if (result) {
        const scriptData = JSON.parse(result.transcript);
        res.status(200).send({ error: false, scriptData });
      } else {
        // If there is no result, get transcript from 
        console.log("there is no result on database, getting data from aws...")
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

          if (err) {
            res.status(401).send({ error: true, errorObj: err });
            return err;
          }

          console.log("Transcript data fetched.")
          let objectData = JSON.parse(data.Body.toString('utf-8')); // Use the encoding necessary

          let speakers = [];

          objectData.dialog.map((transcript, index) => {
            if (!speakers.includes(transcript.speaker)) {
              speakers.push(transcript.speaker);
            }
          });

          // objectData.speakers = speakers;
          objectData.speakersCount = speakers.length;

          res.status(200).send({ error: false, scriptData: objectData, first: true });
        });
      }
    })
    .catch(findErr => {
      res.status(500).send({ error: true, errorMessage: 'Can\'t find speakers' })
    })
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

////////////////////////////////////////////////////
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

  /////////////// Above code is not used ///////////////////

exports.saveTranscript = (req, res) => {
  const user_id = req.body.userId;
  const meeting_uuid = req.body.meetingUUID;
  const transcript = JSON.stringify(req.body.transcript);

  Transcript.create({
    user_id,
    meeting_uuid,
    transcript
  })
    .then(scriptData => {
      res.status(200).send({error: false, scriptData})
    })
    .catch(err => {
      res.status(500).send({error: true, errorObj: err});
    })
}

exports.updateTranscript = (req, res) => {
  const user_id = req.body.userId;
  const meeting_uuid = req.body.meetingUUID;
  const transcript = JSON.stringify(req.body.transcript);

  Transcript.findOne({
    where: {
      user_id,
      meeting_uuid,
    }
  })
    .then(result => {
      if (result) {
        Transcript.update({
          transcript: transcript
          },
          {
            where: {
              user_id,
              meeting_uuid
            }
          })
            .then(updatedRow => {
              res.status(200).send({ error: false, transcript: JSON.parse(transcript) })
            })
      } else {
        res.status(404).send({error: true, errorMessage: 'Can\'t find transcript'});
      }
    })
    .catch(findErr => {
      res.status(500).send({ error: true, errorMessage: 'Can\'t find transcript' });
    })
}
