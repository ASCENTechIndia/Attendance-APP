const express = require("express");
const validate = require("../../middleware/validate.middleware");
const { authRequired } = require("../../middleware/auth");
const {
  authComplaintSchema,
  complaintWorkStatusSchema,
} = require("./attendance.validation");
const {
  attendanceButtonFlag,
  attendanceIns,
  attendanceMonthlySummary,
  attendanceDailySummary,
  attendanceMonthlySummaryWeb,
  attendanceDailySummaryWeb,
  attendanceDailyDetails,
  attendanceDailyDetailsWeb
} = require("./attendance.controller");
const { complaintStatusSchema } = require("./attendance.validation");

const router = express.Router();

router.post("/attendanceButtonFlag", attendanceButtonFlag);

router.post("/attendanceIns", attendanceIns);

router.post("/attendanceMonthlySummary", attendanceMonthlySummary);

router.post("/attendanceMonthlySummary-web", attendanceMonthlySummaryWeb);

router.post("/attendanceDailySummary", attendanceDailySummary);

router.post("/attendanceDailySummary-web",  attendanceDailySummaryWeb);

router.post("/attendanceDailyDetails", attendanceDailyDetails);

router.post("/attendanceDailyDetails-web", attendanceDailyDetailsWeb);

module.exports = router;
