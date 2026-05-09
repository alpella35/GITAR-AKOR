const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

const CHORD_REGEX = /\[([A-G](?:#|b)?)([^\]]*)\]/g;

export const transposeChordRoot = (root, semitone) => {
  const normalized = FLAT_TO_SHARP[root] || root;
  const idx = SHARP_SCALE.indexOf(normalized);
  if (idx < 0) return root;
  const next = (idx + semitone + 12 * 10) % 12;
  return SHARP_SCALE[next];
};

export const transposeChordSheet = (content, semitone) =>
  content.replace(CHORD_REGEX, (_, root, suffix) => `[${transposeChordRoot(root, semitone)}${suffix}]`);
