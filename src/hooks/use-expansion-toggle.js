import { useMemo, useState } from 'react';

export const useExpansionToggle = () => {
  const [items, setItems] = useState([]);

  function reset() {
    setItems([]);
  }

  const toggle = (key) => {
    const copy = [...items];
    const index = copy.indexOf(key);
    if (index === -1) {
      copy.push(key);
      setItems(copy);
      return;
    }

    copy.splice(index, 1);
    setItems(copy);
  };

  /**
   * @description add single or multiple key to items
   * @param {string | string[]} key
   */
  const add = (key) => {
    const copy = [...items];

    const keyIsArrays = Array.isArray(key);
    if (keyIsArrays) {
      copy.push(...key);
    } else {
      copy.push(key);
    }

    const setData = new Set(copy);
    setItems([...setData]);
    // const index = copy.indexOf(key);
    // if (index === -1) {
    //   copy.push(key);
    //   setItems(copy);
    //   return;
    // }
  };

  const remove = (key) => {
    const keyIsArray = Array.isArray(key);
    if (keyIsArray) {
      setItems((prev) => prev.filter((item) => !key.includes(item)));
      return;
    }
    setItems((prev) => prev.filter((item) => item !== key));
  };

  const setData = (keys) => {
    setItems(keys);
  };

  const isIncludes = (key) => items.includes(key);
  const length = useMemo(() => items.length, [items]);

  return { toggle, isIncludes, reset, add, remove, setData, data: items, length };
};
