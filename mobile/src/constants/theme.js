export const COLORS = {
  cream: '#FFFBF7',
  creamDark: '#FAF7F2',
  creamCard: '#FFFFFF',
  emerald: '#1F4E3D',
  emeraldDark: '#15372B',
  emeraldSoft: '#2A6652',
  emeraldLight: '#E6F0EC',
  rosegold: '#D4AF37',
  rosegoldLight: '#F7EFCB',
  slateDark: '#1E293B',
  greyBorder: '#E2E8F0',
  greyText: '#64748B',
  white: '#FFFFFF',

  // Status colors
  status: {
    Pending: { bg: '#FEF3C7', text: '#B45309', label: 'Menunggu Payment/Verifikasi' },
    Confirmed: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Terkonfirmasi' },
    Completed: { bg: '#D1FAE5', text: '#047857', label: 'Selesai' },
    Cancelled: { bg: '#FEE2E2', text: '#B91C1C', label: 'Dibatalkan' },
  }
};

export const SHADOWS = {
  small: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1F4E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
