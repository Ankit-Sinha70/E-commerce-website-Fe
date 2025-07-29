export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(amount);
};
