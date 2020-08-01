import haversine from 'haversine';

const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60
  
    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
  }

const formatDate = () => {
    var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const parseLocation = (location) => {
    const speed = location.coords.speed * 3.6;
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const alt = location.coords.altitude;
    const newCoordinate = { latitude: lat, longitude: lon };
    return [lat, lon, newCoordinate, alt, speed];
};

const calcDistance = (prevCoordinate, newCoordinate) => {
    const distance = haversine(prevCoordinate, newCoordinate, {unit: 'meter'});
    return distance;
};

module.exports = {
    toHHMMSS,
    formatDate,
    parseLocation,
    calcDistance,
}