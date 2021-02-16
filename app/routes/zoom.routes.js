const { authJwt } = require("../middleware");
const controller = require("../controllers/zoom.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/zoom/login",
    controller.zoomLogin
  ); 

  app.post(
    "/api/zoom/get_token",
    controller.zoomLogin
  )
};
