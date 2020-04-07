import { guessKey } from "./guessKey"

test("simpleSong", async () => {
  const chordArray = ["D", "A", "G", "A", "D", "A", "G", "A"]
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("D")
})

test("norewegianSong", async () => {
  const chordArray = [
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
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("C")
})

test("fourChordMinor", async () => {
  const chordArray = ["Bbm", "Gb", "Db", "Ab", "Bbm", "Gb", "Db", "Ab"]
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("Db")
})

test("fourChordMajor", async () => {
  const chordArray = ["C", "G", "Am", "F", "C", "G", "Am", "F"]
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("C")
})

test("guessKeyMedium", async () => {
  const chordArray = ["Am", "F", "C", "G", "Am", "F", "C", "G", "Am"]
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("C")
})

test("guessKeyHard", async () => {
  const chordArray = ["Am", "Dm", "Am", "E7", "Am", "C", "Db/F", "E7"]
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("C")
})

test("leroyBrown", async () => {
  const chordArray = [
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
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("G")
})

test("alison", async () => {
  const chordArray = [
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
  const guessedChord = guessKey(chordArray)
  expect(guessedChord).toEqual("E")
})
