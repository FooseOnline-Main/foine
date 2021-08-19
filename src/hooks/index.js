import { useState } from 'react';

export function useJWT() {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      let item = '';
      if (process.browser) item = window.localStorage.getItem('_fu_jwt');
      return item ? item : '';
    } catch (error) {
      return '';
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (process.browser) window.localStorage.setItem('_fu_jwt', valueToStore);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
