export function getAllParamsFromEntries(searchParamsEntity) {
  const finalValues = {};
  const entries = searchParamsEntity.entries();
  let isDone = false;

  while (!isDone) {
    const iteratorElement = entries.next();
    if (iteratorElement.value) {
      finalValues[iteratorElement.value[0]] = iteratorElement.value[1];
    }
    isDone = iteratorElement.done;
  }

  return finalValues;
}
