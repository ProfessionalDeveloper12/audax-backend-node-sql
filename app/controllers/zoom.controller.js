const zoomConfig = require('../config/zoom.config');
const request = require('request');

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
      }

      res.status(200).send({ error: false, zoomAccessToken: body.access_token, zoomRefreshToken: body.refresh_token })

      return

      if (body.access_token) {

        // Step 4:  
        // We can now use the access token to authenticate API calls

        // Send a request to get your user information using the /me context
        // The `/me` context restricts an API call to the user the token belongs to
        // This helps make calls to user-specific endpoints instead of storing the userID

        // request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
        //     if (error) {
        //         console.log('API Response Error: ', error)
        //     } else {
        //         body = JSON.parse(body);
        //         // Display response in console
        //         console.log('API call ', body);
        //         // Display response in browser
        //         var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
        //         res.send(`
        //             <style>
        //                 @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "👋";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
        //             </style>
        //             <div class="container">
        //                 <div class="info">
        //                     <img src="${body.pic_url}" alt="User photo" />
        //                     <div>
        //                         <span>Hello World!</span>
        //                         <h2>${body.first_name} ${body.last_name}</h2>
        //                         <p>${body.role_name}, ${body.company}</p>
        //                     </div>
        //                 </div>
        //                 <div class="response">
        //                     <h4>JSON Response:</h4>
        //                     <a href="https://marketplace.zoom.us/docs/api-reference/zoom-api/users/user" target="_blank">
        //                         API Reference
        //                     </a>
        //                     ${JSONResponse}
        //                 </div>
        //             </div>
        //         `);
        //     }
        // }).auth(null, null, true, body.access_token);

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
      res.status(500).send({error: true, errorObj: err})
    }
    res.status(200).send({zoomUser: body, error: false});
  });
}

exports.getUserMeetings = (req, res) => {
  const userId = req.body.userId;
  const zoomAccessToken = req.body.zoomAccessToken;

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
      res.status(200).send({zoomUser: body, error:false});
    }
  })
};

