export function findLargestSmallerNumber(arr, num) {
  return arr
    .filter((value) => value < num) // Filter out numbers larger than or equal to the target
    .reduce((largest, current) => {
      return current > largest ? current : largest;
    }, -Infinity); // Initialize with a very small number
}

export function renameKeys(obj, keyMap) {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key] || key; // Use the new key if available, otherwise keep the old key
    acc[newKey] = obj[key];
    return acc;
  }, {});
}
