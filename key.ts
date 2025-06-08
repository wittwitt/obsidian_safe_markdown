import { GenRsaPirPub, EncryptRsaPrivateKey, DecryptRsaPrivateKey } from './utils';

import i18n from './lang/i18n';

export function GetRsaPriKeyPem(
  keysContent: string,
  password: string
): string {
  const encryptedPrivateKeyMatch = keysContent.match(
    /-----BEGIN ENCRYPTED PRIVATE KEY-----[\s\S]+?-----END ENCRYPTED PRIVATE KEY-----/
    // /-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/
  );
  if (!encryptedPrivateKeyMatch) {
    throw new Error(i18n.t('key.noblock'));
  }

  const encryptedPrivateKeyPem = encryptedPrivateKeyMatch[0];

  const privateKeyPem = DecryptRsaPrivateKey(encryptedPrivateKeyPem, password);//+ '\n'

  // 解析 PEM
  // const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  // const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  return privateKeyPem;
}

export function GetRsaPubKeyPem(
  keysContent: string
): string {
  const publicKeyMatch = keysContent.match(
    /-----BEGIN PUBLIC KEY-----[\s\S]+?-----END PUBLIC KEY-----/
  );

  if (!publicKeyMatch) {
    throw new Error(i18n.t('key.noblock'));
  }
  const publicKeyPem = publicKeyMatch[0];
  return publicKeyPem + '\n';
}

// 生成RSA密钥文件
export function GenRsaKeysContent(password: string): string {
  const { privateKeyPemPKCS8, publicKeyPem } = GenRsaPirPub();

  // 加密公钥
  const encryptedPri = EncryptRsaPrivateKey(privateKeyPemPKCS8, password)

  // 合并到 一个文件
  const keysContent = encryptedPri + publicKeyPem;
  // console.log("keysContent", keysContent);
  return keysContent
}
