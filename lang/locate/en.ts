export default {
  settings: {
    title: "Plugin Settings",
    language: "Language"
  },
  i18n: {
    languageChanged: "Language has been changed",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    password: "Password",
    passTip: "Enter password",
    password2: "Confirm password",
    pass2Tip: "Enter password again",
    enterBtn: "Confirm",
    pass8Tip: "Password must be at least 8 characters",
    passeqTip: "Passwords do not match, please re-enter",

    success: "Operation successful",
    error: "Error: {{error}}",
  },
  makekey: {
    title: "Generate New Key File",
    l1: "The private key is encrypted using AES-256. Please set a complex and secure password (recommended length: at least 16 characters) to prevent cracking or forgetting.",
    l2: "Key files cannot be recovered. Be sure to back them up in multiple secure locations to prevent accidental loss.",
    l3: "Once the key file is lost, all files encrypted with it cannot be decrypted. Please keep it safe.",
    l4: "You can create multiple key files, but encryption and decryption must use the same one, otherwise decryption will fail.",
    btnLabel: "Generate",
    okTip: "Key generated and encrypted successfully",
    downTip: "Save file",
    downFailed: "Failed to save file",
    passTip: "Please enter encryption password (recommended 16+ characters)",
  },
  format: {
    err1: "The selected text is not a valid encrypted format",
  },
  key: {
    noblock: "No PEM blocks found. Is the BEGIN marker incorrect?",
  },
  main: {
    EncryptFile: "Encrypt File",
    DecryptFile: "Decrypt File",
    EncryptSelection: "Encrypt Selection",
    DecryptSelection: "Decrypt Selection",
    tip1: "Please select the text to encrypt",
    tip2: "Content encrypted",
    tip3: "Encryption failed:",
    dtip1: "Please select the text to decrypt",
    dtip2: "Content decrypted",
    dtip3: "Decryption failed:",
    ftip1: "File is empty, cannot encrypt",
    ftip2: "File encrypted",
    ftip3: "File encryption failed:",
    fdtip1: "File is empty, cannot decrypt",
    fdtip2: "File decrypted",
    fdtip3: "File decryption failed:",
    intip1: "Please select a key file",
    intip2: "Please select a key file",
    intip3: "Please enter decryption password",
  },
  share: {
    tip1: "Save file",
    tip2: "Save failed:",
    tip3: "Failed to save file",
  },
  utils: {
    aestip1: "Decryption failed: wrong password or corrupted data",
    aestip2: "UTF-8 decoding failed, trying fallback method",
    aestip3: "Fallback decoding also failed",
    aestip4: "Encrypting private key failed:",
    aestip5: "Decryption failed, password may be wrong or format incompatible"
  }
};
