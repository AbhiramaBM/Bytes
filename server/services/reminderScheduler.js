import Reminder from '../models/Reminder.js';
import { sendReminderNotification } from './notificationService.js';

let schedulerHandle = null;

const toDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`);

export const processDueReminders = async () => {
  const now = new Date();

  const candidates = await Reminder.find({
    status: 'active',
    notifiedAt: { $exists: false }
  }).limit(200);

  const dueReminders = candidates.filter((item) => {
    const dt = toDateTime(item.reminder_date, item.reminder_time);
    return Number.isFinite(dt.getTime()) && dt <= now;
  });

  for (const reminder of dueReminders) {
    await sendReminderNotification({ userId: reminder.user_id, reminder });
    reminder.notifiedAt = new Date();
    await reminder.save();
  }
};

export const startReminderScheduler = () => {
  if (schedulerHandle) return;

  schedulerHandle = setInterval(async () => {
    try {
      await processDueReminders();
    } catch (error) {
      console.error('[REMINDER_SCHEDULER] Error:', error.message);
    }
  }, 60 * 1000);

  console.log('[REMINDER_SCHEDULER] Started (interval: 60s)');
};

