const { repoWardList, repoToiletList, repoComplaintTypeList, regComplaintRepo, assignComplaintRepo, compListRepo,
  repoSupervisorList,repoVendorList,regParticipantRepo,participantListRepo
 } = require('./registerParticipate.repo');

async function serviceWardList(ulbid) {
  return repoWardList(ulbid);
}

async function serviceVendorList(ulbid) {
  return repoVendorList(ulbid);
}

async function serviceToiletList(ulbid, wardid) {
  return repoToiletList(ulbid, wardid);
}
async function serviceComplaintTypeList(ulbid) {
  return repoComplaintTypeList(ulbid);
}

async function regComplaintService(payload) {
  return regComplaintRepo(payload);
}

async function assignComplaintService(payload) {
  return assignComplaintRepo(payload);
}

async function compListService(si_id,ulbid,fromDate, toDate, status, page,limit) {
  return compListRepo(si_id,ulbid,fromDate, toDate, status, page,limit);
}

async function serviceSupervisorList(ulbid) {
  return repoSupervisorList(ulbid);
}

async function regParticipantService(payload) {

    return regParticipantRepo(payload);

}

async function participantListService(
  fromDate,
  toDate,
  page,
  limit
) {
  return participantListRepo(
    fromDate,
    toDate,
    page,
    limit
  );
}

module.exports = { serviceWardList, serviceToiletList, serviceComplaintTypeList, regComplaintService, assignComplaintService, compListService,
  serviceSupervisorList, serviceVendorList,regParticipantService,participantListService
 };
