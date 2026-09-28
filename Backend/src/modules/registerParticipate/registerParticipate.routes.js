const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authRequired } = require('../../middleware/auth');
const { 
    // complaintRegistrationSchema, assignComplaintSchema , 
    participantRegistrationSchema } = require('./registerParticipate.validation');
const { 
    // getWardList, getToiletList, getComplaintTypeList, registerComplaint, assignComplaint, getComplaintList,
    // getSupervisorList,getVendorList,
    registerParticipant,getParticipantList
 } = require('./registerParticipate.controller');

const router = express.Router();

// router.get('/wardList', getWardList);
// router.get('/vendorList', getVendorList);
// router.get('/toiletList', getToiletList);
// router.get('/complaintTypeList', getComplaintTypeList);
// router.post('/insertComplaint', validate(complaintRegistrationSchema), registerComplaint );
// router.post('/assignComplaint', validate(assignComplaintSchema), assignComplaint );
// router.get('/supervisorList', getSupervisorList);
// router.get('/getCitizenComplaintList', getComplaintList);


router.post(
    "/insertParticipant",
    validate(participantRegistrationSchema),
    registerParticipant
);
router.get('/getParticipantList', getParticipantList);
module.exports = router;