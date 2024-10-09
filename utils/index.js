exports.sanitizeElementChanges = (changes) => {
  return changes.map((change) => ({
    ...change,
    style: change.style || null,
    attributes: Object.entries(change.attributes || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value || null,
      }),
      {}
    ),
  }));
};
