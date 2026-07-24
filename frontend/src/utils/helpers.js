export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const getStatusBadgeClass = (status) => {
  const map = {
    pending: 'bg-warning',
    reviewed: 'bg-info',
    shortlisted: 'bg-primary',
    interview: 'bg-secondary',
    accepted: 'bg-success',
    rejected: 'bg-danger',
    active: 'bg-success',
    closed: 'bg-secondary',
    expired: 'bg-danger',
    draft: 'bg-warning'
  };
  return map[status] || 'bg-secondary';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
