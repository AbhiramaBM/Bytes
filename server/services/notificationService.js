export const sendReminderNotification = async ({ userId, reminder }) => {
  // Mock notification transport. Replace with SMS/push providers in production.
  console.log(
    `[NOTIFY] user=${userId} reminder=${reminder._id} medicine="${reminder.title}" at ${reminder.reminder_date} ${reminder.reminder_time}`
  );
};
