 const isRefundProceed = (refundStatus) => {
  switch (refundStatus) {
    case "Pending":
      return false;
    case "Initiated":
      return true;
    case "Succeeded":
      return true;
    case "Failed":
      return false;
    default:
      return false;
  }
}
export default isRefundProceed
