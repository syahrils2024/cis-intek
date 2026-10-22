export const labelHelper = {
  billingCategory,
  billingStatus,
};

function billingCategory(category) {
  switch (category) {
    case 'upgrade_plan':
      return 'Perubahan Service';
    case 'internet':
      return 'Internet';
    case 'addons':
      return 'Addons';
    case 'half_internet':
      return 'Pembayaran Awal';
    case 'installation_charge':
      return 'Biaya Instalasi';
    case 'activate_customer':
      return 'Aktivasi Pelanggan';
    case 'fee':
      return 'Biaya Lain';
    default:
      return category;
  }
}

function billingStatus(status) {
  switch (status) {
    case 'paid':
      return 'Lunas';
    case 'unpaid':
      return 'Belum dibayar';
    case 'partially_paid':
      return 'Dibayar sebagian';
    case 'canceled':
      return 'Batal';
    default:
      return status;
  }
}
