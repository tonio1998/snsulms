export function formatPeso(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-PH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatAcad(sem, from, to) {
  if (!sem || !from || !to) return ''; // fail-safe

  let semText = '';
  switch (sem) {
    case '1':
    case '1st':
    case 'First':
      semText = '1st Sem';
      break;
    case '2':
    case '2nd':
    case 'Second':
      semText = '2nd Sem';
      break;
    case '3':
    case '3rd':
    case 'Third':
    case 'Midyear':
      semText = 'Midyear';
      break;
    default:
      semText = `${sem} Sem`;
  }

  return `${semText}, ${from}-${to}`;
}

export function formatNumber(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-PH', {
    style: 'decimal',
  }).format(num);
}


export function getFileSize(size: number) {
  if(size > 0){
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;
    while (size >= 1024) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }else{
    return 0;
  }
}

export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0 (your@email.com)',
          },
        }
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    } else {
      return 'Address not found';
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Error fetching address';
  }
};

export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h:${minutes.toString().padStart(2, "0")}m:${seconds
        .toString()
        .padStart(2, "0")}s`;
  } else {
    return `${minutes}m:${seconds.toString().padStart(2, "0")}s`;
  }
};

export const formatMMSS = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};