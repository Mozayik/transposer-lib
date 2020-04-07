import { scales, normalizeMap } from "../constants"

export const transposeProgression = ({ progression, key, newKey }) => {
  let oldKeyScale = scales[key + "Scale"]
  let newKeyScale = scales[newKey + "Scale"]

  if (!oldKeyScale) {
    oldKeyScale = scales[`${normalizeMap[key]}Scale`]
  }

  const newProgression = progression.map((chord) =>
    chord.replace(
      /(([CDEFGAB]#\*)|([CDEFGAB]#)|([CDEFGAB]b+)|([CDEFGAB]\**))/g,
      (match) => newKeyScale[oldKeyScale.indexOf(match)]
    )
  )

  return newProgression
}
