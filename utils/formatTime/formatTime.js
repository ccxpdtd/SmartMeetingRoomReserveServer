// 格式化当前时间为 "YYYY-MM-DD HH:MM:SS" 格式
function formatTime(date) {
  const year = date.getFullYear();
  // 月份和日期不足两位补前导零
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = formatTime