function sortByXY(array) {
  array.sort((a, b) => {
    const verticesA = a["boundingPoly"]["vertices"][0];
    const verticesB = b["boundingPoly"]["vertices"][0];
    const x1 = verticesA["x"];
    const y1 = verticesA["y"];
    const x2 = verticesB["x"];
    const y2 = verticesB["y"];

    if (x1 === x2) {
      return y1 - y2;
    } else {
      return x1 - x2;
    }
  });

  return array;
}

function getDescriptionsByY(array) {
  const descriptionsByY = new Map();

  for (const obj of array) {
    const vertices = obj["boundingPoly"]["vertices"][0];
    const y = vertices["y"];
    const description = obj["description"];

    if (descriptionsByY.has(y)) {
      descriptionsByY.get(y).push(description);
    } else {
      descriptionsByY.set(y, [description]);
    }
  }

  return Object.fromEntries(descriptionsByY);
}


module.exports = {
  sortByXY,
  getDescriptionsByY,
};

