export const customTypes = {
  secondary: 'note',
  info: 'important',
  success: 'tip',
  danger: 'warning',
  note: {
    ifmClass: 'secondary',
    keyword: 'note',
    emoji: 'ℹ️', // '&#x2139;'
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 17h2.1l6-5.95l-2.15-2.15L7 14.85Zm8.8-6.65l1.05-1.1Q17 9.1 17 8.9q0-.2-.15-.35l-1.4-1.4Q15.3 7 15.1 7q-.2 0-.35.15l-1.1 1.05ZM5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h4.2q.325-.9 1.088-1.45Q11.05 1 12 1t1.713.55Q14.475 2.1 14.8 3H19q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm7-14.75q.325 0 .538-.213q.212-.212.212-.537q0-.325-.212-.538q-.213-.212-.538-.212q-.325 0-.537.212q-.213.213-.213.538q0 .325.213.537q.212.213.537.213ZM5 19V5v14Z"/></svg>',
  },
  tip: {
    ifmClass: 'success',
    keyword: 'tip',
    emoji: '💡', // '&#x1F4A1;'
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 9.5C14.5 6.47 12.03 4 9 4S3.5 6.47 3.5 9.5c0 2.47 1.49 3.89 2.35 4.5h6.3c.86-.61 2.35-2.03 2.35-4.5z" opacity=".3"/><path fill="currentColor" d="M7 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm-2-1h8v-2H5v2zm11.5-9.5c0 3.82-2.66 5.86-3.77 6.5H5.27c-1.11-.64-3.77-2.68-3.77-6.5C1.5 5.36 4.86 2 9 2s7.5 3.36 7.5 7.5zm-2 0C14.5 6.47 12.03 4 9 4S3.5 6.47 3.5 9.5c0 2.47 1.49 3.89 2.35 4.5h6.3c.86-.61 2.35-2.03 2.35-4.5zm6.87-2.13L20 8l1.37.63L22 10l.63-1.37L24 8l-1.37-.63L22 6l-.63 1.37zM19 6l.94-2.06L22 3l-2.06-.94L19 0l-.94 2.06L16 3l2.06.94L19 6z"/></svg>',

  },
  warning: {
    ifmClass: 'danger',
    keyword: 'warning',
    emoji: '🔥', // '&#x1F525;'
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 11 11"><path d="M6.62 8.5l3.11 1.55l-.45.89L5.5 9.06l-3.78 1.89l-.45-.89L4.38 8.5l-3.1-1.55l.45-.89L5.5 7.94l3.78-1.89l.44.9l-3.1 1.55zM8.5 3.21v.29l-1 1v1l-2 1l-2-1v-1l-1-1V3a2.9 2.9 0 0 1 3-3a3.09 3.09 0 0 1 3 3.21zm-3.79-.5a.79.79 0 1 0-.79.79a.79.79 0 0 0 .79-.79zM5 4.5h-.5v1H5v-1zm1.5 0H6v1h.5v-1zm1.36-1.79a.79.79 0 1 0-.79.79a.79.79 0 0 0 .79-.79z" fill="currentColor"/></svg>',
  },
  important: {
    ifmClass: 'info',
    keyword: 'important',
    emoji: '❗️', // '&#x2757;'
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 8 8"><path fill="currentColor" d="M5 0c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1zM3.5 2.5C2.67 2.5 2 3.17 2 4h1c0-.28.22-.5.5-.5s.5.22.5.5s-1 1.64-1 2.5C3 7.36 3.67 8 4.5 8S6 7.33 6 6.5H5c0 .28-.22.5-.5.5S4 6.78 4 6.5C4 6.14 5 4.66 5 4c0-.81-.67-1.5-1.5-1.5z"/></svg>',
  },
  caution: {
    ifmClass: 'warning',
    keyword: 'caution',
    emoji: '⚠️', // '&#x26A0;&#xFE0F;'
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M7 14a3 3 0 1 0 1 5.83"/><path d="M4.264 15.605a4 4 0 0 1-.874-6.636m.03-.081A2.5 2.5 0 0 1 7 5.5m5-1a2.5 2.5 0 1 0-4.762 1.065M8 20a2 2 0 1 0 4 0m5-6a3 3 0 1 1-1 5.83"/><path d="M19.736 15.605a4 4 0 0 0 .874-6.636m-.03-.081A2.5 2.5 0 0 0 17 5.5m-5-1a2.5 2.5 0 1 1 4.762 1.065M16 20a2 2 0 1 1-4 0m0-12v4m0 4.01l.01-.011"/></g></svg>',
  },
}
