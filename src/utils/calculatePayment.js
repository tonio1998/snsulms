
const calculatePayment = (rateType, bidAmount, duration = {}) => {
  switch (rateType.toLowerCase()) {
    case 'fixed':
      return parseFloat(bidAmount).toFixed(2);

    case 'daily':
      if (!duration.days) throw new Error('Missing number of days.');
      return (parseFloat(bidAmount) * parseInt(duration.days)).toFixed(2);

    case 'hourly':
      if (!duration.hours) throw new Error('Missing number of hours.');
      return (parseFloat(bidAmount) * parseFloat(duration.hours)).toFixed(2);

    default:
      throw new Error(`Unknown rate type: ${rateType}`);
  }
};

export default calculatePayment;
