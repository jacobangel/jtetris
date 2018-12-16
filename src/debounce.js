export const debounce = (fn, wait, immediate) => {
  let timeout;
  return (...args) => {
    let later = () => {
      timeout = null;
      if (!immediate) {
        fn(...args);
      }
    }
    var callNow = immediate && !timeout;
    timeout = setTimeout(later, wait);
    if (callNow) {
      fn(...args);
    }
  };
};
