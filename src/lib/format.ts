export function formatRupiah(value: number): string {
  const rounded = Math.round(value);
  return 'Rp' + rounded.toLocaleString('id-ID');
}

export function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000) {
    return 'Rp' + (value / 1_000_000_000).toFixed(1).replace('.0', '') + ' M';
  }
  if (value >= 1_000_000) {
    return 'Rp' + (value / 1_000_000).toFixed(1).replace('.0', '') + ' jt';
  }
  if (value >= 1_000) {
    return 'Rp' + (value / 1_000).toFixed(0) + ' rb';
  }
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}

export function formatNumber(value: number): string {
  return Math.ceil(value).toLocaleString('id-ID');
}

export function parseRupiahInput(text: string): number {
  const cleaned = text.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function formatInputRupiah(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('id-ID');
}
