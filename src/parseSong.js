import { notes, adornments } from "./chords"

/*
Parse a song with chords:

- The lines of the song
- The entire chord progression for the song
- The unique chords used in the song

Songs should be displayed in a fix pitch font.

We parse 4 types of song lines:

space   | blank lines
chords  | lines with (mostly) chords
mixed   | chords with offsets and lyrics
other   | lines with no chords
*/

const escapeRegExp = (s) => s.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

export class SongParser {
  constructor(container) {
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

    console.log(regex)

    this.chordRegex = new RegExp(regex, "g")
    this.spaceRegex = new RegExp("^[ \t\n]*$")
  }

  parseSong(contents) {
    const progression = []
    const extractChords = (s) => {
      const chords = []
      let m

      while ((m = this.chordRegex.exec(s)) !== null) {
        chords.push({ offset: m.index, name: m.toString() })
      }

      return chords
    }
    const songLines = []

    contents.split(/\r?\n/gm).forEach((line) => {
      if (this.spaceRegex.test(line)) {
        songLines.push({ type: "space", line })
        return
      }

      const chords = extractChords(line)

      if (chords.length > 0) {
        songLines.push({ type: "chords", chords })
        return
      }

      const lastSongLine =
        songLines.length > 0 ? songLines[songLines.length - 1] : null

      if (lastSongLine && lastSongLine.type === "chords") {
        const lastChord = lastSongLine.chords[lastSongLine.chords.length - 1]

        songLines[songLines.length - 1] = {
          type: "lyrics",
          chords: lastSongLine.chords,
          line: line.padEnd(
            Math.max(line.length, lastChord.offset + lastChord.name.length)
          ),
        }
        return
      }

      songLines.push({ type: "other", line })
    })

    const parseTextToProgression = (songLines) => {
      const chordLines = parsedSong.filter((line) => {
        return line.type === "chords"
      })

      // turn strings into arrays
      const chordLineArrays = chordLines.map((line) => {
        return line.line.split(" ")
      })

      // clean arrays for processing
      const cleanChordLineArrays = chordLineArrays.map((arr) => {
        return arr.filter((x) => {
          return x !== ""
        })
      })

      // join the arrays to form the full song chord progression
      return [].concat.apply([], cleanChordLineArrays)
    }

    return songLines
  }
}
