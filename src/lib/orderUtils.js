export function getStatusBadge(status) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Processing":
      return "bg-blue-400 text-blue-800";
    case "Shipped":
      return "bg-purple-400 text-purple-800";
    case "Delivered":
      return "bg-green-400 text-green-800";
    case "Cancelled":
      return "bg-red-400 text-red-800";
    default:
      return "bg-gray-400 text-gray-800";
  }
}

export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};