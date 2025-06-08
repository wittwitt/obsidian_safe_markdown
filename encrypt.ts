import * as forge from 'node-forge';
import { AesCbc256Decrypt, AesCbc256Encrypt } from './utils';

export function EncryptMarkdown(
  plaintext: string,
  publicKeyPem: string
): { encryptedAesKey: string; ciphertext: string } {

  // console.log('publicKeyPem');
  // console.log(publicKeyPem);

  // 1. 生成随机 AES_KEY
  const aesKey = forge.random.getBytesSync(32); // 32 bytes = 256 bits
  // console.log("aesKey", aesKey)

  // 2. AES加密内容
  const ciphertext = AesCbc256Encrypt(plaintext, aesKey)
  // console.log("ciphertext", ciphertext)

  // 3. RSA公钥加密 AES_KEY
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedAesKeyBytes = publicKey.encrypt(aesKey, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha1.create(),
    },
  });
  const encryptedAesKey = forge.util.encode64(encryptedAesKeyBytes);
  // console.log("encryptedAesKey", encryptedAesKey)

  return {
    encryptedAesKey,
    ciphertext,
  };
}

export function DecryptMarkdown(
  encryptedAesKey: string,
  ciphertext: string,
  privateKeyPem: string
): string {

  const privateKeyInfo = forge.asn1.fromDer(forge.pem.decode(privateKeyPem)[0].body);
  const privateKey = forge.pki.privateKeyFromAsn1(privateKeyInfo);

  // const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // 1. RSA解密AES_KEY
  const encryptedAesKeyBytes = forge.util.decode64(encryptedAesKey);
  const aesKeyBytes = privateKey.decrypt(encryptedAesKeyBytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha1.create(),
    },
  });
  const aesKey = aesKeyBytes.slice(0, 32);
  // console.log('aesKey', aesKey);

  // 2. aes解密内容
  const plaintext = AesCbc256Decrypt(ciphertext, aesKey)
  // console.log('plaintext', plaintext);

  return plaintext;
}
