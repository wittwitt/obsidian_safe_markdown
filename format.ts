import { GetRsaPubKeyPem } from './key';
import { EncryptMarkdown, } from './encrypt';
import { Base64Br } from "./utils";

import i18n from "./lang/i18n";

export function EncryptAndFormat(keysContent: string, text: string): string {
  const publicKeyPem = GetRsaPubKeyPem(keysContent);
  const { encryptedAesKey, ciphertext } = EncryptMarkdown(text, publicKeyPem);
  // console.log('ciphertext');
  // console.log(ciphertext.replace(/\r?\n/g, ''));
  // console.log(`------`);
  // console.log(Base64Br(ciphertext));
  // console.log(`------2`);
  const encryptedFormat = `# This is encrypted content\n\n- HEAD\n\n\`\`\`pem\n-----BEGIN ENCRYTP HEAD-----\n${Base64Br(encryptedAesKey)}\n-----END ENCRYTP HEAD-----\n\`\`\`\n\n- BODY\n\n\`\`\`pem\n-----BEGIN ENCRYTP BODY-----\n${ciphertext}\n-----END ENCRYTP BODY-----\n\`\`\``;
  return encryptedFormat;
}

export function GetEncryptedKeyBody(text: string): { encryptedKey: string, encryptedBody: string } {
  const keyMatch = text.match(/```pem\n-----BEGIN ENCRYTP HEAD-----\n([\s\S]*?)\n-----END ENCRYTP HEAD-----\n```/);
  const bodyMatch = text.match(/```pem\n-----BEGIN ENCRYTP BODY-----\n([\s\S]*?)\n-----END ENCRYTP BODY-----\n```/);

  if (!keyMatch || !bodyMatch) {
    throw new Error(i18n.t('format.err1'));
  }

  const encryptedKey = keyMatch[1].replace(/\n/g, '').trim();
  const encryptedBody = bodyMatch[1].replace(/\n/g, '').trim();

  return {
    encryptedKey,
    encryptedBody,
  }
}
