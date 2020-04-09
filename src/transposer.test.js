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

const songProgression = [
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
]

test("parse", () => {
  const transposer = new Transposer()

  transposer.parse(song)

  expect(transposer.lines).toEqual(songLines)
  expect(transposer.progression).toEqual(songProgression)
  expect(transposer.originalKey).toBe("D")
})

test("stringify", () => {
  const transposer = new Transposer()

  transposer.lines = songLines
  transposer.progression = songProgression

  expect(transposer.stringify()).toMatch(song)

  const newProgression = [
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
  ]

  expect(transposer.stringify(newProgression)).toMatch(transposedSong)
})

test("norewegianSong", async () => {
  const transposer = new Transposer()

  transposer.progression = [
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
  ]
  expect(transposer._guessKey()).toEqual("C")
})

test("fourChordMinor", async () => {
  const transposer = new Transposer()

  transposer.progression = ["Bbm", "Gb", "Db", "Ab", "Bbm", "Gb", "Db", "Ab"]

  expect(transposer._guessKey()).toEqual("Db")
})

test("fourChordMajor", async () => {
  const transposer = new Transposer()

  transposer.progression = ["C", "G", "Am", "F", "C", "G", "Am", "F"]

  expect(transposer._guessKey()).toEqual("C")
})

test("guessKeyMedium", async () => {
  const transposer = new Transposer()

  transposer.progression = ["Am", "F", "C", "G", "Am", "F", "C", "G", "Am"]

  expect(transposer._guessKey()).toEqual("C")
})

test("guessKeyHard", async () => {
  const transposer = new Transposer()

  transposer.progression = ["Am", "Dm", "Am", "E7", "Am", "C", "Db/F", "E7"]

  expect(transposer._guessKey()).toEqual("C")
})

test("leroyBrown", async () => {
  const transposer = new Transposer()

  transposer.progression = [
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
  ]

  expect(transposer._guessKey()).toEqual("G")
})

test("alison", async () => {
  const transposer = new Transposer()

  transposer.progression = [
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
  ]

  expect(transposer._guessKey()).toEqual("E")
})
