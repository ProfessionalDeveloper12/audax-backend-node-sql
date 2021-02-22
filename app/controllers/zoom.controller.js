const zoomConfig = require('../config/zoom.config');
const request = require('request');
const fetch = require('node-fetch');
const awsConfig = require('../config/aws.config');
const AWS = require("aws-sdk");
const shortid = require('shortid');
const { response } = require('express');

exports.zoomLogin = (req, res) => {
  if (req.body.code) {
    let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.body.code + '&redirect_uri=' + zoomConfig.REDIRECT_URL;

    request.post(url, (error, response, body) => {

      // Parse response to JSON
      body = JSON.parse(body);

      // Logs your access and refresh tokens in the browser
      console.log(`access_token: ${body.access_token}`);
      console.log(`refresh_token: ${body.refresh_token}`);

      if (error) {
        res.status(500).send({ error: true, errorObj: error })
        return
      }

      // res.status(200).send({ error: false, zoomAccessToken: body.access_token, zoomRefreshToken: body.refresh_token })
      if (body.access_token) {
        const zoomAccessToken = body.access_token;

        request({
          headers: {
            'Authorization': 'Bearer ' + zoomAccessToken,
            'Content-Type': 'application/json'
          },
          uri: 'https://api.zoom.us/v2/users/me',
          method: 'GET'
        }, function (err, resp, body1) {
          if (err) {
            res.status(500).send({ error: true, errorObj: err })
            return
          } else {
            const zoomUser = JSON.parse(body1);
            const url = `https://api.zoom.us/v2/users/${zoomUser.id}/meetings`;

            request({
              headers: {
                'Authorization': 'Bearer ' + zoomAccessToken,
                'Content-Type': 'application/json'
              },
              uri: url,
              method: 'GET'
            }, function (er, re, body3) {
              const zoomMeetings = JSON.parse(body3);
              if (er) {
                res.status(500).send({ error: true, errorObj: er });
                return
              } else {

                const getRecordingUrl = `https://api.zoom.us/v2/users/${zoomUser.id}/recordings`;
                request({
                  headers: {
                    'Authorization': 'Bearer ' + zoomAccessToken,
                    'Content-Type': 'application/json'
                  },
                  uri: getRecordingUrl,
                  method: 'GET'
                }, function (e, r, body4) {
                  const zoomRecordings = JSON.parse(body4);

                  if (e) {
                    res.status(500).send({ error: true, errorObj: e });
                    return;
                  } else {
                    res.status(200).send({
                      error: false,
                      zoomData: {
                        zoomAccessToken: body.access_token,
                        zoomRefreshToken: body.refresh_token,
                        zoomUser: zoomUser,
                        zoomMeetings: zoomMeetings,
                        zoomRecordings: zoomRecordings
                      }
                    });
                  }
                })
              }
            })
          }
        });
      } else {
        // Handle errors, something's gone wrong!
      }

    }).auth(zoomConfig.ZOOM_CLIENT_ID, zoomConfig.ZOOM_CLIENT_SECRET);

    return;
  } else {
    // If no authorization code is available, redirect to Zoom OAuth to authorize
    res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + zoomConfig.ZOOM_CLIENT_ID + '&redirect_uri=' + zoomConfig.REDIRECT_URL)
  }
};

exports.getUserInfo = (req, res) => {
  const zoomAccessToken = req.body.zoomAccessToken;

  const url = 'https://api.zoom.us/v2/users/me';
  request({
    headers: {
      'Authorization': 'Bearer ' + zoomAccessToken,
      'Content-Type': 'application/json'
    },
    uri: url,
    method: 'GET'
  }, function (err, response, body) {
    if (err) {
      res.status(500).send({ error: true, errorObj: err })
    } else {
      res.status(200).send({ zoomUser: JSON.parse(body), error: false });
    }
  });
}

exports.getUserMeetings = (req, res) => {
  const userId = req.body.userId;
  const zoomAccessToken = req.body.zoomAccessToken;

  console.log({ userId, zoomAccessToken })

  const url = `https://api.zoom.us/v2/users/${userId}/meetings`;

  request({
    headers: {
      'Authorization': 'Bearer ' + zoomAccessToken,
      'Content-Type': 'application/json'
    },
    uri: url,
    method: 'GET'
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send({ error: true, errorObj: err });
    } else {
      res.status(200).send({ zoomUser: JSON.parse(body), error: false });
    }
  })
};

exports.getMeeting = (req, res) => {
  const meetingId = req.body.meetingId;
  const zoomAccessToken = req.body.zoomAccessToken;

  const url = `https://api.zoom.us/v2/meetings/${meetingId}`;

  request({
    headers: {
      'Authorization': 'Bearer ' + zoomAccessToken,
      'Content-Type': 'application/json'
    },
    uri: url,
    method: 'GET'
  }, function (err, response, body) {
    if (err) {
      return res.status(500).send({ error: true, errorObj: err });
    } else {
      res.status(200).send({ meeting: JSON.parse(body), error: false });
    }
  })
};

exports.uploadMeeting = async (req, res) => {
  const zoomAccessToken = req.body.zoomAccessToken;
  const meeting = req.body.meeting;
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = awsConfig;
  const bucketName = 'transcriptionbegin';
  const region = 'us-east-2';
  const meetingTopic = meeting.topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const fileName = `${meetingTopic}--${shortid.generate()}.${meeting.recording_files[0].file_type}`;

  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region
  });

  for (i = 0; i < 2; i++) {
    if (meeting.recording_files[i].file_type === 'MP4') {
      const download_url = meeting.recording_files[i].download_url + '?access_token=' + zoomAccessToken;
    
      // request.get(download_url, function (err, response, body) {
      //   if (err) {
      //     return res.status(500).send({ error: true, errorObj: err });
      //   } else {
      //     const uploadParams = {
      //       Bucket: bucketName,
      //       Key: fileName, 
      //       Body: body
      //     }
    
      //     s3.upload(uploadParams, function(e, data) {
      //       if (e) {
      //         return res.send({ error: true, errorObj: e })
      //       } else {
      //         res.status(200).send({ data: `Successfully uploaded ${data.Location}`, error: false });
      //       }
      //     })
      //   }
      // })
    
      const recordingResponse = await fetch(download_url);
    
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName, 
        Body: recordingResponse.body
      }
    
      s3.upload(uploadParams, function(e, data) {
        if (e) {
          return res.send({ error: true, errorObj: e })
        } else {
          res.status(200).send({ data: `Successfully uploaded ${data.Location}`, error: false });
        }
      })
    }
  }
}

