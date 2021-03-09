const { authJwt } = require("../middleware");
const controller = require("../controllers/aws.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/aws/get_transcripts",
    authJwt.verifyToken,
    controller.getTranscripts
  );

  app.post(
    "/api/aws/payment",
    authJwt.verifyToken,
    controller.createPayment
  );

  // app.post(
  //   "/api/aws/update_speakers",
  //   authJwt.verifyToken,
  //   controller.updateSpeakers
  // );
  
  // app.post(
  //   "/api/aws/get_speakers",
  //   authJwt.verifyToken,
  //   controller.getSpeakers
  // );

  app.post(
    "/api/aws/save_transcript",
    authJwt.verifyToken,
    controller.saveTranscript
  );

  app.post(
    "/api/aws/update_transcript",
    authJwt.verifyToken,
    controller.updateTranscript
  );

  app.post(
    "/api/aws/add_transcript_comment",
    authJwt.verifyToken,
    controller.addTranscriptComment
  )
};
