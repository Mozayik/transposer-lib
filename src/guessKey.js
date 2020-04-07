import { scales, keys } from "../constants"

export const guessKey = (chordArray) => {
  // before anything, process away everything that is not the root of the chord for root analysis
  const chordRootArray = chordArray.map((chord) => {
    const accidentals = ["#", "b", "*", "bb", "bbb"]
    let chordRoot = ""
    if (chord.length > 1) {
      if (chord.substring(1, 3) === "bb") {
        chordRoot = chord.substring(0, 3)
      } else {
        if (chord.substring(1, 4) === "bbb") {
          chordRoot = chord.substring(0, 4)
        }

        if (!accidentals.includes(chord[1])) {
          chordRoot = chord[0]
        } else {
          chordRoot = chord.substring(0, 2)
        }
      }
    } else {
      chordRoot = chord[0]
    }
    return chordRoot
  })

  let likelyKey = ""
  let likelyKeys = {
    firstChord: chordRootArray[0],
    lastChord: chordRootArray[chordRootArray.length - 1],
    firstLast: null,
    VI: null,
    iiVI: null,
    IVI: null,
    IVIV: null,
    Vvi: null,
    viIV: null,
    iiivi: null,
  }

  // also in preprocessing, clean the chords of anything that's not a qualifier if you want to do circle of 5 analysis
  // first, check if first and last chord are the same. High likelihood this is the key
  if (chordRootArray[0] === chordRootArray[chordRootArray.length - 1]) {
    likelyKeys.firstLast = chordRootArray[0]
  }

  // next, look for V-I... for all keys
  let VIByScale = {}
  let iiVIByScale = {}
  let IVVIByScale = {}
  let IVIByScale = {}
  let IVIVByScale = {}
  let VviByScale = {}
  let IVByScale = {}
  let viIVByScale = {}
  let iiiviByScale = {}

  for (const scale in scales) {
    const currentScale = scales[scale]
    // for each scale
    let fiveOneHits = 0
    let iiVIHits = 0
    let IVVIHits = 0
    let IVIHits = 0
    let IVIVHits = 0
    let VviHits = 0
    let IVHits = 0
    let viIVHits = 0
    let iiiviHits = 0
    chordRootArray.forEach((chord, index) => {
      if (index === chordRootArray.length - 1) {
        // last chord
        return
      }

      // look at each set of 2 chords
      const previousChord = index === 0 ? null : chordRootArray[index - 1]
      const currentChord = chord
      const nextChord = chordRootArray[index + 1]
      if (currentScale[4] === currentChord && currentScale[0] === nextChord) {
        // it is a V-I in this key
        fiveOneHits++

        if (previousChord) {
          // check for ii-V-I
          if (previousChord === currentScale[1]) {
            iiVIHits++
          }
          if (previousChord === currentScale[3]) {
            IVVIHits++
          }
        }
      }
      // check IV-I
      if (currentScale[3] === currentChord && currentScale[0] === nextChord) {
        IVIHits++
        if (chordRootArray[index + 2]) {
          if (currentScale[4] === chordRootArray[index + 2]) {
            IVIVHits++
          }
        }
      }
      // check V - vi
      if (currentScale[4] === currentChord && currentScale[5] === nextChord) {
        VviHits++
      }
      // check I-V
      if (currentScale[0] === currentChord && currentScale[4] === nextChord) {
        IVHits++
      }
      // check vi-IV
      if (currentScale[5] === currentChord && currentScale[3] === nextChord) {
        viIVHits++
      }
      // check iii-vi
      if (currentScale[2] === currentChord && currentScale[5] === nextChord) {
        iiiviHits++
      }
    })
    VIByScale[scale] = fiveOneHits
    iiVIByScale[scale] = iiVIHits
    IVVIByScale[scale] = IVVIHits
    IVIByScale[scale] = IVIHits
    IVIVByScale[scale] = IVIVHits
    VviByScale[scale] = VviHits
    IVByScale[scale] = IVHits
    viIVByScale[scale] = viIVHits
    iiiviByScale[scale] = iiiviHits
  }

  likelyKeys.VI = Object.keys(VIByScale)
    .reduce((a, b) => (VIByScale[a] > VIByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.VI === "test") {
    likelyKeys.VI = null
  }
  likelyKeys.iiVI = Object.keys(iiVIByScale)
    .reduce((a, b) => (iiVIByScale[a] > iiVIByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.iiVI === "test") {
    likelyKeys.iiVI = null
  }
  likelyKeys.IVI = Object.keys(IVIByScale)
    .reduce((a, b) => (IVIByScale[a] > IVIByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.IVI === "test") {
    likelyKeys.IVI = null
  }
  likelyKeys.IVIV = Object.keys(IVIVByScale)
    .reduce((a, b) => (IVIVByScale[a] > IVIVByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.IVIV === "test") {
    likelyKeys.IVIV = null
  }
  likelyKeys.Vvi = Object.keys(VviByScale)
    .reduce((a, b) => (VviByScale[a] > VviByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.Vvi === "test") {
    likelyKeys.Vvi = null
  }

  likelyKeys.IVVI = Object.keys(IVVIByScale)
    .reduce((a, b) => (IVVIByScale[a] > IVVIByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.IVVI === "test") {
    likelyKeys.IVVI = null
  }

  likelyKeys.viIV = Object.keys(viIVByScale)
    .reduce((a, b) => (viIVByScale[a] > viIVByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.viIV === "test") {
    likelyKeys.viIV = null
  }

  likelyKeys.iiivi = Object.keys(iiiviByScale)
    .reduce((a, b) => (iiiviByScale[a] > iiiviByScale[b] ? a : b))
    .replace("Scale", "")

  if (likelyKeys.iiivi === "test") {
    likelyKeys.iiivi = null
  }

  // if firstLast and VI are the same key, we definitely have a winner
  if (likelyKeys.firstLast !== null && likelyKeys.firstLast === likelyKeys.VI) {
    likelyKey = likelyKeys.firstLast
  } else {
    // check all the likelyKeys and see which appears most frequently
    const likelyKeyArray = Object.keys(likelyKeys).map((criteria) => {
      return likelyKeys[criteria]
    })

    let sortedArray = likelyKeyArray
      .sort(
        (a, b) =>
          likelyKeyArray.filter((v) => v === a).length -
          likelyKeyArray.filter((v) => v === b).length
      )
      .reverse()
    likelyKey = sortedArray.find((k) => {
      return k !== null
    })
  }

  // if there are no standard chord movements to check, we should default to the first chord I think
  if (
    !likelyKeys.VI &&
    !likelyKeys.iiVI &&
    !likelyKeys.IVVI &&
    !likelyKeys.IVI &&
    !likelyKeys.Vvi &&
    !likelyKeys.IV &&
    !likelyKeys.viIV &&
    !likelyKeys.iiivi
  ) {
    likelyKey = likelyKeys.firstChord
  }

  // finally, check if likely key in minor or major form appears more frequently
  // as this solution develops, this is less and less likely, as the relative major will be
  // returned more often than not (which is great, as far as i'm concerned)
  const likelyKeyMinor = `${likelyKey}m`
  const keyCount = chordArray.filter((chord) => {
    return (
      chord.substring(0, likelyKey.length) === likelyKey &&
      chord.substring(likelyKey.length, likelyKey.length + 1) !== "m"
    )
  })
  const minorKeyCount = chordArray.filter((chord) => {
    return (
      chord.substring(0, likelyKeyMinor.length) === likelyKeyMinor &&
      chord.substring(likelyKey.length, 4) !== "maj"
    )
  })

  return keyCount.length >= minorKeyCount.length
    ? likelyKey
    : keys.find((k) => {
        return k.minor === likelyKeyMinor
      })?.key || likelyKey
}
