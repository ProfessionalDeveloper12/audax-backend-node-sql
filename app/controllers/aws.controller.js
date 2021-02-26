const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const request = require('request');
const fetch = require('node-fetch');
const awsConfig = require('../config/aws.config');
const AWS = require('aws-sdk');

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

