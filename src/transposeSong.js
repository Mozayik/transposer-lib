export const transposeSong = (parsedSong) => {
  let song = ""

  for (const line in parsedSong) {
    const currentLine = parsedSong[line]
    if (currentLine.type === "chords") {
      let chordLineArray = currentLine.line.split(" ")
      let mappedArray = chordLineArray.map((entry) => {
        if (entry && entry !== " ") {
          return transposedProgression.shift()
        }
        return entry
      })
      song += `${mappedArray.join(" ")}\n`
    } else {
      song += `${currentLine.line}\n`
    }
  }

  return song
}
