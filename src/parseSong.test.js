import { parseSong } from "./parseSong"

test("parseSong", async () => {
  const song = `Song Title - Artist
| G | % | D | % |
G A D A D

D      A            G      A
Simple lyrics for a simple song
D           A               G      A
This is the chorus, can you sing along?`

  expect(parseSong(song)).toEqual([
    { type: "lyrics", line: "Song Title - Artist" },
    { type: "chords", line: "| G | % | D | % |" },
    { type: "chords", line: "G A D A D" },
    { type: "space", line: "" },
    { type: "chords", line: "D      A            G      A" },
    { type: "lyrics", line: "Simple lyrics for a simple song" },
    { type: "chords", line: "D           A               G      A" },
    { type: "lyrics", line: "This is the chorus, can you sing along?" },
  ])
})
