import _dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

_dayjs.extend(utc);
_dayjs.extend(timezone);
_dayjs.extend(isSameOrAfter);
_dayjs.extend(relativeTime);

export const dayjs = (...param: Parameters<typeof _dayjs>) =>
  _dayjs(...param).tz('Asia/Hong_Kong');

export const dayjsWithoutTz = (...param: Parameters<typeof _dayjs>) =>
  _dayjs(...param);
