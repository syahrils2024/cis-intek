import { id } from 'date-fns/locale/id';
import { format, intervalToDuration } from 'date-fns';

Date.prototype.format = function (pattern) {
  return format(this, pattern, { locale: id });
};

Date.prototype.formatSummaryDate = function () {
  return this.toLocaleDateString('id-ID', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

Date.prototype.formatDateTime = function () {
  return this.toLocaleDateString('id-ID', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    minute: '2-digit',
    hour: '2-digit',
  });
};

Date.prototype.formatSummaryDateMonthYear = function () {
  return this.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
};

Date.prototype.getDistanceFormat = function () {
  let message = '';
  const now = new Date();
  const { years, months, days, hours, minutes } = intervalToDuration({
    start: this,
    end: now,
  });

  if (years) message += ` ${years} Tahun `;
  if (months) message += ` ${months} Bulan `;
  if (days) message += ` ${days} Hari `;
  if (hours) message += ` ${hours} Jam `;
  if (minutes) message += ` ${minutes} Menit `;

  return message;
};

Date.prototype.getDistanceShortFormat = function () {
  let message = '';
  const now = new Date();
  const { years, months, days, hours, minutes } = intervalToDuration({
    start: this,
    end: now,
  });

  if (years) message += ` ${years}THN `;
  if (months) message += ` ${months}BLN `;
  if (days) message += ` ${days}H `;
  if (hours) message += ` ${hours}J `;
  if (minutes) message += ` ${minutes}M `;

  return message;
};
