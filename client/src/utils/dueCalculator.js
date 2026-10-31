// Utility to calculate the upcoming premium due date based on startDate and paymentFrequency

export function calculateNextDueDate(startDateStr, paymentFrequency = 'Annual') {
  if (!startDateStr) return null;

  const start = new Date(startDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let stepMonths = 12;
  const freq = (paymentFrequency || '').toLowerCase();
  if (freq === 'monthly') stepMonths = 1;
  else if (freq === 'quarterly') stepMonths = 3;
  else if (freq === 'semi-annual') stepMonths = 6;
  else stepMonths = 12;

  // Clone date
  let nextDue = new Date(start);
  nextDue.setHours(0, 0, 0, 0);

  // If start date is in future, that is the first due date
  if (nextDue > now) {
    // start date is first due date
  } else {
    // Step forward until nextDue is on or after now
    while (nextDue <= now) {
      nextDue = new Date(nextDue.setMonth(nextDue.getMonth() + stepMonths));
    }
  }

  const diffTime = nextDue.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusLabel = '';
  if (daysRemaining === 0) {
    statusLabel = 'Due today';
  } else if (daysRemaining === 1) {
    statusLabel = 'Due tomorrow';
  } else if (daysRemaining > 1) {
    statusLabel = `Due in ${daysRemaining} days`;
  } else {
    statusLabel = `Overdue by ${Math.abs(daysRemaining)} days`;
  }

  return {
    nextDueDate: nextDue,
    daysRemaining,
    formattedDate: nextDue.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    statusLabel,
    isUrgent: daysRemaining <= 7,
  };
}

