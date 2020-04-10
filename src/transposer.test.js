import { Transposer } from "./Transposer"

const song = `Song Title - Artist
| G | % | D | % |
G A D A D

D      A            G      A    D A G
Simple lyrics for a simple song-a-long
    D           A               G      A    {riff}
mmm This is the chorus, can you sing along?`

const transposedSong = `Song Title - Artist
| Ab| % | Eb| % |
Ab Bb Eb Bb Eb

Eb     Bb           Ab     Bb   Eb Bb Ab
Simple lyrics for a simple song-a- lo ng
    Eb          Bb              Ab     Bb   {riff}
mmm This is the chorus, can you sing along?`

const songLines = [
  { type: "other", parts: ["Song Title - Artist"] },
  {
    type: "chords",
    parts: [
      [null, "| "],
      [0, " | % | "],
      [1, " | % |"],
    ],
  },
  {
    type: "chords",
    parts: [
      [2, " "],
      [3, " "],
      [4, " "],
      [5, " "],
      [6, ""],
    ],
  },
  { type: "lyrics", parts: ["  ", "  ", "  ", "  ", " "] },
  {
    type: "chords",
    parts: [
      [7, "      "],
      [8, "            "],
      [9, "      "],
      [10, "    "],
      [11, " "],
      [12, " "],
      [13, ""],
    ],
  },
  {
    type: "lyrics",
    parts: ["Simple ", "lyrics for a ", "simple ", "song-", "a-", "lo", "ng"],
  },
  {
    type: "chords",
    parts: [
      [null, "    "],
      [14, "           "],
      [15, "               "],
      [16, "      "],
      [17, "    {riff}"],
    ],
  },
  {
    type: "lyrics",
    parts: [
      "mmm ",
      "This is the ",
      "chorus, can you ",
      "sing al",
      "ong?       ",
    ],
  },
]

// A truncated list of transpositions
const songTranspositions = {
  D: {
    progression: [
      "G",
      "D",
      "G",
      "A",
      "D",
      "A",
      "D",
      "D",
      "A",
      "G",
      "A",
      "D",
      "A",
      "G",
      "D",
      "A",
      "G",
      "A",
    ],
    chords: ["A", "D", "G"],
  },
  Db: {
    progression: [
      "Ab",
      "Eb",
      "Ab",
      "Bb",
      "Eb",
      "Bb",
      "Eb",
      "Eb",
      "Bb",
      "Ab",
      "Bb",
      "Eb",
      "Bb",
      "Ab",
      "Eb",
      "Bb",
      "Ab",
      "Bb",
    ],
    chords: ["Ab", "Bb", "Eb"],
  },
}

test("parse", () => {
  const transposer = new Transposer()

  transposer.parse(song)

  expect(transposer.lines).toEqual(songLines)
  expect(Object.keys(transposer.transpositions).length).toBe(12)
  expect(transposer.originalKeyName).toBe("D")
})

test("stringify", () => {
  const transposer = new Transposer()

  transposer.originalKeyName = "D"
  transposer.lines = songLines
  transposer.transpositions = songTranspositions

  expect(transposer.stringify()).toMatch(song)
  expect(transposer.stringify("Db")).toMatch(transposedSong)
})

test("norewegianSong", async () => {
  expect(
    Transposer.guessKey([
      "C",
      "G",
      "Dm",
      "F",
      "C",
      "G",
      "Dm",
      "Am",
      "G",
      "C",
      "Am",
      "G",
      "Fmaj7",
    ])
  ).toEqual("C")
})

test("fourChordMinor", async () => {
  expect(
    Transposer.guessKey(["Bbm", "Gb", "Db", "Ab", "Bbm", "Gb", "Db", "Ab"])
  ).toEqual("Db")
})

test("fourChordMajor", async () => {
  expect(
    Transposer.guessKey(["C", "G", "Am", "F", "C", "G", "Am", "F"])
  ).toEqual("C")
})

test("guessKeyMedium", async () => {
  expect(
    Transposer.guessKey(["Am", "F", "C", "G", "Am", "F", "C", "G", "Am"])
  ).toEqual("C")
})

test("guessKeyHard", async () => {
  expect(
    Transposer.guessKey(["Am", "Dm", "Am", "E7", "Am", "C", "Db/F", "E7"])
  ).toEqual("C")
})

test("leroyBrown", async () => {
  expect(
    Transposer.guessKey([
      "G",
      "A",
      "B",
      "C",
      "D",
      "G",
      "D",
      "G",
      "A",
      "B",
      "C",
      "D",
      "G",
      "D",
      "G",
      "A",
      "B",
      "C",
      "D",
      "G",
      "etc",
      "G",
    ])
  ).toEqual("G")
})

test("alison", async () => {
  expect(
    Transposer.guessKey([
      "A",
      "E",
      "A",
      "G#m",
      "C#m",
      "A",
      "G#m",
      "D",
      "B7sus4",
      "B7",
      "A",
      "G#m",
      "C#m",
      "A",
      "G#m",
      "C#m",
      "A",
      "G#m",
      "C#m",
      "D",
      "B7sus4",
      "B7",
      "A",
      "E",
      "A",
      "B",
      "G#m",
      "C#m",
      "A",
      "E",
      "A",
      "B",
      "E",
    ])
  ).toEqual("E")
})
