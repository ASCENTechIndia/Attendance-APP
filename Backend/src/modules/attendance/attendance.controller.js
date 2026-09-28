const {
  attendanceButtonFlagService,
  attendanceInsService,
  attendanceMonthlySummaryService,
  attendanceDailySummaryService,
  attendanceMonthlySummaryServiceWeb,
  attendanceDailySummaryServiceWeb
} = require("./attendance.service");
const { auditLog } = require("../../utils/audit-log");
const { logApiSuccess, logApiError } = require("../../utils/log");

function requestMeta(req) {
  return {
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
  };
}

async function attendanceButtonFlag(req, res, next) {
  try {
    const body = req.body || {};

    const payload = {
      userId: body.userId,
      ulbId: Number(body.ulbId),
    };

    const out = await attendanceButtonFlagService(payload);

    const isSuccess = String(out.errorCode) === "9999";

    if (isSuccess) {
      logApiSuccess(
        req,
        200,
        {},
        "Attendance button flag fetched successfully"
      );
    } else {
      logApiError(
        req,
        400,
        out.message,
        "Attendance button flag fetch failed"
      );
    }

    auditLog({
      action: "ATTENDANCE_BUTTON_FLAG",
      actor: req.user?.userId || payload.userId || "system",
      module: "authAttendance",
      status: isSuccess ? "SUCCESS" : "FAILED",
      details: {
        outErrorCode: out.errorCode,
        outErrorMsg: out.message,
        punchInFlag: out.punchInFlag,
        punchOutFlag: out.punchOutFlag,
      },
      requestMeta: requestMeta(req),
    });

    return res.ok(out);
  } catch (error) {
    logApiError(
      req,
      500,
      error.message,
      "Attendance button flag error"
    );

    return next(error);
  }
}

async function attendanceIns(req, res, next) {
  try {
    const body = req.body || {};

const payload = {
  userId: body.userId,
  empId: body.empId,
  mode: body.mode,
  lat: body.lat,
  long: body.long,
  photo: body.photo,
  ulbId: Number(body.ulbId),
  deviceId: body.deviceId,
};

    const out = await attendanceInsService(payload);
    const isSuccess = String(out.errorCode) === "9999";

    if (isSuccess) {
      logApiSuccess(
        req,
        200,
        {},
        "Attendance inserted succeeded"
      );
    } else {
      logApiError(
        req,
        400,
        out.message,
        "Attendance inserted failed"
      );
    }

    auditLog({
      action: "ATTENDANCE_INSERT",
      actor: req.user?.userId || payload.userId || "system",
      module: "authAttendance",
      status: isSuccess ? "SUCCESS" : "FAILED",
      details: {
        outErrorCode: out.errorCode,
        outErrorMsg: out.message,
      },
      requestMeta: requestMeta(req),
    });

    return res.ok(out);
  } catch (error) {
    logApiError(
      req,
      500,
      error.message,
      "Attendance insert error"
    );

    return next(error);
  }
}

async function attendanceMonthlySummary(req, res, next) {
  try {
    const body = req.body || {};

    const month = body.month || "ALL";
    const year = body.year || "ALL";

    const rows = await attendanceMonthlySummaryService(month, year);

    return res.ok(rows);
  } catch (error) {
    logApiError(
      req,
      500,
      error.message,
      "Attendance monthly summary error"
    );

    return next(error);
  }
}

async function attendanceMonthlySummaryWeb(req, res, next) {
  try {
    const body = req.body || {};

    const month = body.month || "ALL";
    const year = body.year || "ALL";

    const rows = await attendanceMonthlySummaryServiceWeb(month, year);

    return res.ok(rows);
  } catch (error) {
    logApiError(
      req,
      500,
      error.message,
      "Attendance monthly summary error"
    );

    return next(error);
  }
}

async function attendanceDailySummary(req, res, next) {
  try {
    const body = req.body || {};

const today = new Date();

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const defaultDate =
  `${String(today.getDate()).padStart(2, "0")}-${months[today.getMonth()]}-${today.getFullYear()}`;

const date = body.date || defaultDate;

const userId = body.userId || "ALL";

    const rows = await attendanceDailySummaryService(date, userId);

    return res.ok(rows);
  } catch (error) {
    logApiError(
      req,
      500,
      error.message,
      "Attendance daily summary error"
    );

    return next(error);
  }
}

async function attendanceDailySummaryWeb(req, res, next) {
  try {
    const body = req.body || {};

const today = new Date();

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const defaultDate =
  `${String(today.getDate()).padStart(2, "0")}-${months[today.getMonth()]}-${today.getFullYear()}`;

const date = body.date || defaultDate;

const userId = body.userId || "ALL";

    const rows = await attendanceDailySummaryServiceWeb(date, userId);

    return res.ok(rows);
  } catch (error) {
    logApiError(
      req,
      500,
      error.message,
      "Attendance daily summary error"
    );

    return next(error);
  }
}

module.exports = {
  attendanceButtonFlag,
  attendanceIns,
  attendanceMonthlySummary,
  attendanceDailySummary,
  attendanceMonthlySummaryWeb,
  attendanceDailySummaryWeb
};
