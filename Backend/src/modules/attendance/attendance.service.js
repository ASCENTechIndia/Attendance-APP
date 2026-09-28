const {
  attendanceButtonFlagRepo,
  attendanceInsRepo,
  attendanceMonthlySummaryRepo,
  attendanceDailySummaryRepo,
  attendanceMonthlySummaryRepoWeb,
  attendanceDailySummaryRepoWeb
} = require("./attendance.repo");


async function attendanceButtonFlagService(payload) {
  return attendanceButtonFlagRepo(payload);
}

async function attendanceInsService(payload) {
  return attendanceInsRepo(payload);
}

async function attendanceMonthlySummaryService(month, year) {
  return attendanceMonthlySummaryRepo(month, year);
}

async function attendanceMonthlySummaryServiceWeb(month, year) {
  return attendanceMonthlySummaryRepoWeb(month, year);
}

async function attendanceDailySummaryService(date, userId) {
  return attendanceDailySummaryRepo(date, userId);
}

async function attendanceDailySummaryServiceWeb(date, userId) {
  return attendanceDailySummaryRepoWeb(date, userId);
}

module.exports = {
  attendanceButtonFlagService,
  attendanceInsService,
  attendanceMonthlySummaryService,
  attendanceDailySummaryService,
  attendanceMonthlySummaryServiceWeb,
  attendanceDailySummaryServiceWeb
};
