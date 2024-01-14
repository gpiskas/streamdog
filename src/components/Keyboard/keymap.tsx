import { KeyPress } from "./Keyboard";

export interface KeyPressData {
  label: string
  position: number[]
}

export enum K {
  // Row 0
  Escape = '⏮️',
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  PrintScreen = '🖼️',
  ScrollLock = '🔒',
  Pause = '⏸️',
  // Row 1
  BackQuote = '`',
  Num1 = '1',
  Num2 = '2',
  Num3 = '3',
  Num4 = '4',
  Num5 = '5',
  Num6 = '6',
  Num7 = '7',
  Num8 = '8',
  Num9 = '9',
  Num0 = '0',
  Minus = '-',
  Equal = '=',
  Backspace = '⏪',
  Insert = '🔌',
  Home = '🏠',
  PageUp = '📄',
  NumLock = '🔏',
  KpMinus = '➖',
  KpMultiply = '✖️',
  KpDivide = '➗',
  // Row 2
  Tab = '↪️',
  KeyQ = 'Q',
  KeyW = 'W',
  KeyE = 'E',
  KeyR = 'R',
  KeyT = 'T',
  KeyY = 'Y',
  KeyU = 'U',
  KeyI = 'I',
  KeyO = 'O',
  KeyP = 'P',
  LeftBracket = '[',
  RightBracket = ']',
  BackSlash = '\\',
  Delete = '🚮',
  End = '⏹️',
  PageDown = '📃',
  Kp7 = '7️⃣',
  Kp8 = '8️⃣',
  Kp9 = '9️⃣',
  // Row 3
  CapsLock = '🔠',
  KeyA = 'A',
  KeyS = 'S',
  KeyD = 'D',
  KeyF = 'F',
  KeyG = 'G',
  KeyH = 'H',
  KeyJ = 'J',
  KeyK = 'K',
  KeyL = 'L',
  SemiColon = ';',
  Quote = '\'',
  Return = '↩️',
  Kp4 = '4️⃣',
  Kp5 = '5️⃣',
  Kp6 = '6️⃣',
  KpPlus = '➕',
  // Row 4
  ShiftLeft = '🔀',
  IntlBackslash = '\\',
  KeyZ = 'Z',
  KeyX = 'X',
  KeyC = 'C',
  KeyV = 'V',
  KeyB = 'B',
  KeyN = 'N',
  KeyM = 'M',
  Comma = ',',
  Dot = '.',
  Slash = '/',
  ShiftRight = '🔀',
  UpArrow = '⬆️',
  Kp1 = '1️⃣',
  Kp2 = '2️⃣',
  Kp3 = '3️⃣',
  // Row 5
  ControlLeft = '🔼',
  MetaLeft = '#️⃣',
  Alt = '🔣',
  Space = '⏺️',
  AltGr = '🔣',
  MetaRight = '#️⃣',
  Function = '#️⃣',
  ControlRight = '🔼',
  LeftArrow = '⬅️',
  DownArrow = '⬇️',
  RightArrow = '➡️',
  Kp0 = '0️⃣',
  KpDelete = '🚮',
  KpReturn = '⏩',
}

const keyLayout: K[][] = [
  [K.Escape, K.F1, K.F2, K.F3, K.F4, K.F5, K.F6, K.F7, K.F8, K.F9, K.F10, K.F11, K.F12, K.PrintScreen, K.ScrollLock, K.Pause],
  [K.BackQuote, K.Num1, K.Num2, K.Num3, K.Num4, K.Num5, K.Num6, K.Num7, K.Num8, K.Num9, K.Num0, K.Minus, K.Equal, K.Backspace, K.Insert, K.Home, K.PageUp, K.NumLock, K.KpMinus, K.KpMultiply, K.KpDivide],
  [K.Tab, K.KeyQ, K.KeyW, K.KeyE, K.KeyR, K.KeyT, K.KeyY, K.KeyU, K.KeyI, K.KeyO, K.KeyP, K.LeftBracket, K.RightBracket, K.BackSlash, K.Delete, K.End, K.PageDown, K.Kp7, K.Kp8, K.Kp9],
  [K.CapsLock, K.KeyA, K.KeyS, K.KeyD, K.KeyF, K.KeyG, K.KeyH, K.KeyJ, K.KeyK, K.KeyL, K.SemiColon, K.Quote, K.Return, K.Kp4, K.Kp5, K.Kp6, K.KpPlus],
  [K.ShiftLeft, K.IntlBackslash, K.KeyZ, K.KeyX, K.KeyC, K.KeyV, K.KeyB, K.KeyN, K.KeyM, K.Comma, K.Dot, K.Slash, K.ShiftRight, K.UpArrow, K.Kp1, K.Kp2, K.Kp3],
  [K.ControlLeft, K.MetaLeft, K.Alt, K.Space, K.AltGr, K.MetaRight, K.Function, K.ControlRight, K.LeftArrow, K.DownArrow, K.RightArrow, K.Kp0, K.KpDelete, K.KpReturn]
];

const keysAsStrings = Object.keys(K);
const keyPressData = new Map<string, KeyPressData>();
let counter = 0
for (let i = 0; i < keyLayout.length; i++) {
  for (let j = 0; j < keyLayout[i].length; j++) {
    keyPressData.set(keysAsStrings[counter++], {
      label: keyLayout[i][j],
      position: [i / (keyLayout.length - 1), j / (keyLayout[i].length - 1)]
    });
  }
}

export function getKeyPressCharacter(keyPress: KeyPress): KeyPressData {
  const data = keyPressData.get(keyPress.key);
  if (data) {
    return data;
  }
  console.log('Unknown key', keyPress)
  return { label: '*', position: [0.5, 0.5] };
}