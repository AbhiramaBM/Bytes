const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export const toMinutes = (time) => {
  const [hours, minutes] = `${time}`.split(':').map(Number);
  return (hours * 60) + minutes;
};

export const sanitizeText = (value = '') => `${value}`.replace(/[<>$]/g, '').trim();

const isValidDateString = (value) => DATE_RE.test(`${value}`);
const isValidTimeString = (value) => TIME_RE.test(`${value}`);

const isDateWithinRange = (date, startDate, endDate) => {
  if (!isValidDateString(date) || !isValidDateString(startDate) || !isValidDateString(endDate)) {
    return false;
  }
  return date >= startDate && date <= endDate;
};

export const normalizeDoctorAvailability = (availability = {}) => {
  const acceptingAppointments = availability.acceptingAppointments !== false;
  const statusNote = sanitizeText(availability.statusNote || '').slice(0, 240);

  const leaveRanges = Array.isArray(availability.leaveRanges)
    ? availability.leaveRanges
      .map((item) => ({
        startDate: `${item?.startDate || ''}`.trim(),
        endDate: `${item?.endDate || ''}`.trim(),
        leaveType: sanitizeText(item?.leaveType || 'leave').slice(0, 50) || 'leave',
        reason: sanitizeText(item?.reason || '').slice(0, 240)
      }))
      .filter((item) => isValidDateString(item.startDate) && isValidDateString(item.endDate) && item.endDate >= item.startDate)
    : [];

  const blockedSlots = Array.isArray(availability.blockedSlots)
    ? availability.blockedSlots
      .map((item) => ({
        date: `${item?.date || ''}`.trim(),
        startTime: `${item?.startTime || ''}`.trim(),
        endTime: `${item?.endTime || ''}`.trim(),
        reason: sanitizeText(item?.reason || '').slice(0, 240)
      }))
      .filter((item) => (
        isValidDateString(item.date) &&
        isValidTimeString(item.startTime) &&
        isValidTimeString(item.endTime) &&
        toMinutes(item.endTime) > toMinutes(item.startTime)
      ))
    : [];

  return {
    acceptingAppointments,
    statusNote,
    leaveRanges,
    blockedSlots
  };
};

export const getDoctorAvailabilityBlock = ({ doctor, appointmentDate, appointmentTime }) => {
  const availability = doctor?.availability || {};
  const acceptingAppointments = availability.acceptingAppointments !== false;
  const statusNote = availability.statusNote || '';
  const leaveRanges = Array.isArray(availability.leaveRanges) ? availability.leaveRanges : [];
  const blockedSlots = Array.isArray(availability.blockedSlots) ? availability.blockedSlots : [];

  if (!acceptingAppointments) {
    return {
      blocked: true,
      reason: statusNote || 'Doctor is temporarily unavailable for appointments'
    };
  }

  const leave = leaveRanges.find((item) => isDateWithinRange(appointmentDate, item.startDate, item.endDate));
  if (leave) {
    const leaveLabel = leave.leaveType ? `${leave.leaveType}` : 'leave';
    return {
      blocked: true,
      reason: leave.reason || `Doctor is on ${leaveLabel}`
    };
  }

  if (!appointmentTime) {
    return { blocked: false };
  }

  const targetMinutes = toMinutes(appointmentTime);
  const slotBlock = blockedSlots.find((item) => (
    item.date === appointmentDate &&
    targetMinutes >= toMinutes(item.startTime) &&
    targetMinutes < toMinutes(item.endTime)
  ));

  if (slotBlock) {
    return {
      blocked: true,
      reason: slotBlock.reason || `Doctor unavailable from ${slotBlock.startTime} to ${slotBlock.endTime}`
    };
  }

  return { blocked: false };
};

export const getBlockedSlotsForDate = ({ doctor, appointmentDate, allSlots = [] }) => {
  const availability = doctor?.availability || {};
  const blockedMap = {};

  const globalBlock = getDoctorAvailabilityBlock({
    doctor,
    appointmentDate,
    appointmentTime: null
  });

  if (globalBlock.blocked) {
    allSlots.forEach((slot) => {
      blockedMap[slot] = globalBlock.reason;
    });
    return blockedMap;
  }

  const blockedSlots = Array.isArray(availability.blockedSlots) ? availability.blockedSlots : [];

  allSlots.forEach((slot) => {
    const slotMinutes = toMinutes(slot);
    const block = blockedSlots.find((item) => (
      item.date === appointmentDate &&
      slotMinutes >= toMinutes(item.startTime) &&
      slotMinutes < toMinutes(item.endTime)
    ));
    if (block) {
      blockedMap[slot] = block.reason || `Doctor unavailable from ${block.startTime} to ${block.endTime}`;
    }
  });

  return blockedMap;
};
