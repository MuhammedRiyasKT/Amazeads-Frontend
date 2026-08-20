export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '₹0';
  const isNegative = amount < 0;
  const absFormatted = Math.abs(amount).toLocaleString('en-IN');
  return isNegative ? `-₹${absFormatted}` : `₹${absFormatted}`;
};