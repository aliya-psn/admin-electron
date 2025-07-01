import dayjs from 'dayjs';

function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 判断是否为日期字段
function isDateKey(key: string) {
  // 支持 createTime、updateTime、xxxAt、xxxDate 等
  return /(_time|_at|_date)$/i.test(key) || /(Time|At|Date)$/.test(key);
}

// 格式化数据结果，驼峰、日期
export function formatMysqlResult<T extends Record<string, any>>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(formatMysqlResult);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        const camelKey = toCamelCase(k);
        // 日期字段自动格式化
        if (isDateKey(k) && v) {
          return [camelKey, dayjs(v).isValid() ? dayjs(v).format('YYYY.MM.DD HH:mm:ss') : v];
        }
        return [camelKey, formatMysqlResult(v)];
      })
    );
  }
  return obj;
}
