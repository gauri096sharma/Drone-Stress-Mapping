export const formatPercent = (value) => `${value}%`;

export const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};
