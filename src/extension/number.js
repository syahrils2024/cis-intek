import { terbilang } from 'src/utils/terbilang';

Number.prototype.formatCurrency = function formatCurrency() {
  return new Intl.NumberFormat('id-ID').format(this);
};

// Short month format (Jan, Feb, Mar...)
Number.prototype.toIndonesianMonthShort = function () {
  const monthsShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  return monthsShort[this - 1] || 'Invalid month';
};

// Medium month format (Janu, Febr, Maret...)
Number.prototype.toIndonesianMonthMedium = function () {
  const monthsMedium = [
    'Janu',
    'Febr',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agust',
    'Sept',
    'Okt',
    'Nov',
    'Des',
  ];
  return monthsMedium[this - 1] || 'Invalid month';
};

// Long month format (Januari, Februari, Maret...)
Number.prototype.toIndonesianMonthLong = function () {
  const monthsLong = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return monthsLong[this - 1] || 'Invalid month';
};

Number.prototype.terbilang = function () {
  return terbilang(this);
};

Number.prototype.summarySLAFormat = function(){
  const ms = this;
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const days = totalDays;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (seconds > 0) result += `${seconds}s `;

  return result.trim() || '0 Seconds';
}
