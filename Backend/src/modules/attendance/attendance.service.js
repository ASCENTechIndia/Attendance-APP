const {
  attendanceButtonFlagRepo,
  attendanceInsRepo,
  attendanceMonthlySummaryRepo,
  attendanceDailySummaryRepo,
  attendanceMonthlySummaryRepoWeb,
  attendanceDailySummaryRepoWeb,
  attendanceDailyDetailsRepo,
  attendanceDailyDetailsRepoWeb,
  attendanceMonthlyRegisterRepo
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

async function attendanceDailyDetailsService(userId, month, year) {
  return attendanceDailyDetailsRepo(userId, month, year);
}

async function attendanceDailyDetailsServiceWeb(userId, month, year) {
  return attendanceDailyDetailsRepoWeb(userId, month, year);
}

async function attendanceMonthlyRegisterService(payload) {
  return attendanceMonthlyRegisterRepo(payload);
}

module.exports = {
  attendanceButtonFlagService,
  attendanceInsService,
  attendanceMonthlySummaryService,
  attendanceDailySummaryService,
  attendanceMonthlySummaryServiceWeb,
  attendanceDailySummaryServiceWeb,
  attendanceDailyDetailsService,
  attendanceDailyDetailsServiceWeb,
  attendanceMonthlyRegisterService
};
