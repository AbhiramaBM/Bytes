const buildUpiLink = ({ upiId, amount, note }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: 'RuralCare Connect',
    am: `${amount}`,
    cu: 'INR',
    tn: note
  });
  return `upi://pay?${params.toString()}`;
};

export const getPaymentLinkForPrescription = ({ prescriptionId, totalAmount = 0 }) => {
  if (process.env.PAYMENT_UPI_LINK) {
    return process.env.PAYMENT_UPI_LINK;
  }

  const upiId = process.env.PAYMENT_UPI_ID || '9900426040@ybl';
  const amount = Number(totalAmount) > 0 ? Number(totalAmount) : 0;
  const note = `Prescription ${prescriptionId}`;
  return buildUpiLink({ upiId, amount, note });
};

