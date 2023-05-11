import fs from "fs";
import path from "path";
import axios from 'axios';

import vision from "@google-cloud/vision";
import { readReceipt } from "./openai";

// TODO: mover pra pasta Google
const client = new vision.ImageAnnotatorClient({
  keyFilename: "./src/google/secrets/GoogleApiKeySecrets.json",
});


type TextAnnotations = Awaited<ReturnType<typeof client.textDetection>>[number]["textAnnotations"];

function sortByXY(array: TextAnnotations) {
  if (array) {
    array.sort((a, b) => {
      const verticesA = a["boundingPoly"]?.vertices?.[0];
      const verticesB = b["boundingPoly"]?.vertices?.[0];
      const x1 = verticesA?.x ?? 0;
      const y1 = verticesA?.y ?? 0;
      const x2 = verticesB?.x ?? 0;
      const y2 = verticesB?.y ?? 0;

      if (x1 === x2) {
        return y1 - y2;
      } else {
        return x1 - x2;
      }
    });

    return array;
  } else {
    return []
  }

}

function getDescriptionsByY(array: NonNullable<TextAnnotations>): Record<string, string> {
  const descriptionsByY = new Map();

  for (const obj of array) {
    const vertices = obj.boundingPoly?.vertices?.[0];

    if (!vertices) {
      break
    }

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


export async function detectText(filePath: string) {
  try {
    const results = await client.textDetection(filePath);
    const sortedOutput = sortByXY(results[0].textAnnotations);
    const outputSortedByY = getDescriptionsByY(sortedOutput);
    const firstKey = Object.keys(outputSortedByY)[0];
    delete outputSortedByY[firstKey!];
    const groupByKeys = groupDataByKeys(outputSortedByY, 20);
    const joinedValues = joinValues(groupByKeys);
    return getTotal(joinedValues);
  } catch (error) {
    console.error("Error in detectText: ", error);
    return null;
  }
}



function joinValues(obj: Record<string, string>): Record<string, string> | {} {
  const result: Record<string, string> = {};

  try {
    for (const key of Object.keys(obj)) {
      const value = obj[key]!;

      if (Array.isArray(value)) {
        result[key] = value.join(" ");
      } else {
        result[key] = value;
      }
    }
  } catch(e) {
    console.error(`Error in joinValues: ${e}`)
  }

  return result;
}

function groupDataByKeys(input: Record<string,string>, range: number) {
  // Convert the input object to an array of keys and values
  const keys = Object.keys(input);
  const values = Object.values(input);

  // Initialize the result object
  const result: Record<string,string> = {};

  try {

    // Loop through the keys and values
    for (let i = 0; i < keys.length; i++) {
      // Convert the key to a number
      const key = Number(keys[i]);
      const value = values[i]!;

      // If the key is within the range of the next key, concatenate the value
      // of the next key to the current value and continue looping.
      if (i < keys.length - 1 && key + range >= Number(keys[i + 1])) {
        values[i + 1] = value.concat(values[i + 1]!);
        continue;
      }

      // If the key is not within the range of the next key, add it to the result
      result[key] = value;
    }
  } catch (e) {
    console.error("Error in groupDataByKeys: ", e);
  }

  return result;
}

export async function getTotal(parsedReceipt: Record<string, string>) {
  try {
    const AIData = await readReceipt(parsedReceipt);
    const textResponse = AIData.data.choices?.[0]?.text

    return textResponse?.replace(/\n/g, '');
  } catch (error) {
    console.error("Error in getTotal:", error);
    return null;
  }
}

export async function processReceipt(imagePath: string) {
  try {
    return await detectText(imagePath);
  } catch (error) {
    console.error("Error processing receipt:", error);
    return null;
  }
}

export async function downloadImage(url: string, localPath: string) {
  try {
  const path2 = path.resolve(localPath)
  const writer = fs.createWriteStream(path2)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

