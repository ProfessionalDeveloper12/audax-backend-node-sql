const db = require("../models");
const request = require('request');
const fetch = require('node-fetch');
const awsConfig = require('../config/aws.config');
const AWS = require('aws-sdk');
const stripeConfig = require("../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = process.env.NODE_ENV.trim() == "development" ? "http://localhost:3000/admin/payment" : "https://audaxfront.ukcourier.a2hosted.com/admin/payment";

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
      res.status(401).send({error: true, errorObj: err});
      return err;
    }

    // No error happened
    // Convert Body from a Buffer to a String

    let objectData = data.Body.toString('utf-8'); // Use the encoding necessary
    res.status(200).send({ error: false, scriptData: JSON.parse(objectData)});
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

