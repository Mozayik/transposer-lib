import { scales, normalizeMap, notes, adornments, keys } from "./data"

const escapeRegExp = (s) => s.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

export class Transposer {
  constructor() {
    const noteRegex = notes
      .flat()
      .map(escapeRegExp)
      .sort((a, b) => a.length - b.length)
      .join("|")
    const adornmentRegex = adornments
      .flat()
      .map(escapeRegExp)
      .sort((a, b) => a.length - b.length)
      .join("|")
    const regex =
      "(?!A [a-z])(?<=^| |\\t)(?:" +
      noteRegex +
      ")(?:" +
      adornmentRegex +
      ")?(?= |\\t|$)"

    this.chordRegex = new RegExp(regex, "g")
    this.spaceRegex = new RegExp("^[ \t\n]*$")
  }

  /*
  Parse a song with chords generating:

  - The lines of the song
  - The entire chord progression for the song
  - The unique chords used in the song
  - Guessing the key the song is in

  Songs should be displayed in a fix pitch font.

  We parse 4 types of song lines:

  chords  | lines mixed chords and text
  lyrics  | lines with only text and chords above
  other   | lines with no chords
  */
  parse(song) {
    const extractChords = (s) => {
      const chords = []
      let m

      while ((m = this.chordRegex.exec(s)) !== null) {
        chords.push({ offset: m.index, name: m.toString() })
      }

      return chords
    }
    const lines = []
    const progression = []

    song.split(/\r?\n/gm).forEach((line) => {
      const chords = extractChords(line)

      if (chords.length > 0) {
        const parts = []

        if (chords[0].offset > 0) {
          parts.push([null, line.slice(0, chords[0].offset)])
        }

        chords.forEach((chord, index) => {
          progression.push(chord.name)

          const progressionIndex = progression.length - 1
          const offsetAfterChord = chord.offset + chord.name.length

          parts.push([
            progressionIndex,
            line.slice(
              offsetAfterChord,
              index === chords.length - 1 ? undefined : chords[index + 1].offset
            ),
          ])
        })

        lines.push({ type: "chords", parts })
        return
      }

      const lastLine = lines.length > 0 ? lines[lines.length - 1] : null

      if (lastLine && lastLine.type === "chords") {
        const lastLineLength = lastLine.parts.reduce(
          (sum, part) =>
            sum +
            (part[0] !== null ? progression[part[0]].length : 0) +
            part[1].length,
          0
        )

        line = line.padEnd(Math.max(line.length, lastLineLength))

        const parts = []
        let beginIndex = 0
        let endIndex = 0

        // Chop line up into same number of parts as the chords array in the last line
        lastLine.parts.forEach((part) => {
          if (part[0] !== null) {
            endIndex += progression[part[0]].length
          }
          endIndex += part[1].length
          parts.push(line.slice(beginIndex, endIndex))
          beginIndex = endIndex
        })

        lines.push({ type: "lyrics", parts })
        return
      }

      lines.push({ type: "other", parts: [line] })
    })

    this.lines = lines
    this.progression = progression

    this._guessKey()
  }

  stringify(newProgression) {
    const progression = newProgression ?? this.progression

    let newLines = this.lines.map((line) =>
      line.type === "other"
        ? line.parts[0]
        : line.type === "chords"
        ? {
            type: "chords",
            parts: line.parts.map(
              // TODO: Take spaces from part[1] if there would be at least one left
              (part) => (part[0] !== null ? progression[part[0]] : "") + part[1]
            ),
          }
        : line
    )

    newLines = newLines.map((line, lineIndex) =>
      line.type === "lyrics"
        ? line.parts
            .map((part, partIndex) =>
              part.padEnd(
                Math.max(
                  part.length,
                  newLines[lineIndex - 1].parts[partIndex].length
                )
              )
            )
            .join("")
            .trimEnd()
        : line
    )

    newLines = newLines
      .map((line) =>
        line.type === "chords" ? line.parts.join("").trimEnd() : line
      )
      .join("\n")

    return newLines
  }

  transpose(newKey) {
    let oldKeyScale = scales[this.key + "Scale"]
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

  _guessKey() {
    // before anything, process away everything that is not the root of the chord for root analysis
    const chordRootArray = this.progression.map((chord) => {
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
    if (
      likelyKeys.firstLast !== null &&
      likelyKeys.firstLast === likelyKeys.VI
    ) {
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
    const keyCount = this.progression.filter((chord) => {
      return (
        chord.substring(0, likelyKey.length) === likelyKey &&
        chord.substring(likelyKey.length, likelyKey.length + 1) !== "m"
      )
    })
    const minorKeyCount = this.progression.filter((chord) => {
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
}
