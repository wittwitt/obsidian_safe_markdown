import * as forge from 'node-forge';

import i18n from './lang/i18n';

// 1. node-forge ToPem都有后缀\n

// 2. node-forge，默认后有\r\n windows换行  



// Base64Br 按固定长度（64字符）分割 base64 字符串
export function Base64Br(base64: string): string {
  const lineLength = 64;
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += lineLength) {
    lines.push(base64.slice(i, i + lineLength));
  }
  return lines.join('\n');
}

export function AesCbc256Encrypt(text: string, password: string): string {
  // console.log(forge.random);
  // 加密部分（仿照 OpenSSL 的 AES-256-CBC + Salted__ 前缀）
  const salt = forge.random.getBytesSync(16);
  // console.log("salt", salt);
  const keyIv = forge.pkcs5.pbkdf2(password, salt, 100000, 32 + 16, forge.md.sha256.create()); // 32 bytes key + 16 bytes IV
  const key = keyIv.substring(0, 32);
  const iv = keyIv.substring(32, 48);

  const cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(text, 'utf8'));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  // console.log("encrypted", encrypted.toString());

  // OpenSSL-compatible prefix
  const opensslHeader = 'Salted__' + salt;
  const finalBytes = opensslHeader + encrypted;

  // base64 encode, with 64-char line wrapping
  const b64 = forge.util.encode64(finalBytes);
  // console.log("b64", b64);
  // const wrapped = b64.replace(/(.{64})/g, '$1\n');
  const wrapped = Base64Br(b64);
  return wrapped;
}

export function AesCbc256Decrypt(text: string, password: string): string {
  const encryptedBase64 = text.replace(/\n/g, '')// 64个字符换行去掉
  // console.log(encryptedBase64);
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  const bytes = forge.util.createBuffer(encryptedBytes, 'raw');

  // 读取文件头
  const saltHeader = bytes.getBytes(8);
  if (saltHeader !== 'Salted__') {
    throw new Error('Invalid encrypted file format: missing Salted__ header');
  }

  // 读取 salt
  const salt = bytes.getBytes(16);
  // console.log("salt", salt);

  // 剩下是密文
  const encrypted = bytes.getBytes();
  // console.log(encrypted.toString());

  // PBKDF2 派生 key 和 iv，100000 次迭代，key 32 字节，iv 16 字节
  const keyIvBytes = forge.pkcs5.pbkdf2(
    password,
    salt,
    100000,
    32 + 16,
    forge.md.sha256.create()
  );

  const key = keyIvBytes.slice(0, 32);
  const iv = keyIvBytes.slice(32, 48);

  // AES-CBC 解密
  const decipher = forge.cipher.createDecipher('AES-CBC', key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  const success = decipher.finish();

  if (!success) {
    throw new Error(i18n.t('utils.aestip1'));
  }

  // 关键修复：正确处理 UTF-8 编码
  const decryptedBytes = decipher.output.getBytes();
  // 方法1：使用 forge.util.decodeUtf8（推荐）
  try {
    return forge.util.decodeUtf8(decryptedBytes);
  } catch (e) {
    // 如果 UTF-8 解码失败，尝试其他方法
    console.warn(i18n.t('utils.aestip2'));
  }
  // 方法2：使用 TextDecoder（备用方案）
  try {
    const uint8Array = new Uint8Array(decryptedBytes.length);
    for (let i = 0; i < decryptedBytes.length; i++) {
      uint8Array[i] = decryptedBytes.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  } catch (e) {
    console.error('TextDecoder ' + i18n.t('utils.aestip3'), e);
  }

  // 方法3：最后的兜底方案
  return decryptedBytes;
}

// 生成rsa公私钥
export function GenRsaPirPub(): { privateKeyPemPKCS8: string, publicKeyPem: string } {
  // 1. 生成 2048 位 RSA 密钥对
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

  // 2. 转换私钥为 PKCS#8 格式 PEM
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keyPair.privateKey)); // PKCS#8
  // const privateKey = forge.pem.encode({
  //   type: 'PRIVATE KEY',
  //   body: forge.asn1.toDer(pkcs8Asn1).getBytes(),
  // });

  // 正确生成 PKCS#8 私钥 PEM
  // const privateKeyInfo = forge.pki.wrapRsaPrivateKey(keyPair.privateKey);
  const privateKeyPemPKCS8 = forge.pki.privateKeyInfoToPem(privateKeyInfo).replace(/\r\n/g, '\n');


  // 3. 导出公钥
  const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);

  // const privateKeyPemPKCS8 = privateKey.replace(/\r\n/g, '\n');// 这里注意，是windows的 \r\n
  const publicKeyPem = publicKey.replace(/\r\n/g, '\n');// 这里注意，是windows的 \r\n
  // console.log(privateKeyPemPKCS8);
  // console.log(publicKeyPem)

  return { privateKeyPemPKCS8, publicKeyPem };
}

// 加密rsa私钥 openssl pkcs8 -in private.pem -out private_enc.pem -topk8 -v2 aes-256-cbc -v2prf hmacWithSHA256 -iter 100000
export function EncryptRsaPrivateKey(
  privateKeyPem: string,
  password: string,
): string {
  try {
    const iterations = 100000;
    // 解析PEM格式的私钥
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // 将私钥转换为PKCS#8 DER格式
    const pkcs8Der = forge.pki.privateKeyInfoToPem(
      forge.pki.wrapRsaPrivateKey(
        forge.pki.privateKeyToAsn1(privateKey)
      )
    );

    // 重新解析为ASN.1格式以便加密
    const pkcs8Asn1 = forge.pki.privateKeyFromPem(pkcs8Der);
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(
      forge.pki.privateKeyToAsn1(pkcs8Asn1)
    );

    // 生成随机盐值（16字节）
    const salt = forge.random.getBytesSync(16);

    // 使用PBKDF2派生密钥，PRF为HMAC-SHA256
    const derivedKey = forge.pkcs5.pbkdf2(
      password,
      salt,
      iterations,
      32, // AES-256需要32字节密钥
      'sha256' // 使用SHA-256作为PRF
    );

    // 生成随机IV（16字节，AES-CBC块大小）
    const iv = forge.random.getBytesSync(16);

    // 创建AES-256-CBC加密器
    const cipher = forge.cipher.createCipher('AES-CBC', derivedKey);
    cipher.start({ iv: iv });

    // 将私钥信息转换为DER字节
    const privateKeyDer = forge.asn1.toDer(privateKeyInfo).getBytes();
    cipher.update(forge.util.createBuffer(privateKeyDer));
    cipher.finish();

    const encryptedData = cipher.output.getBytes();

    // 构建PKCS#8 EncryptedPrivateKeyInfo结构
    const encryptedPrivateKeyInfo = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.SEQUENCE,
      true,
      [
        // encryptionAlgorithm
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.SEQUENCE,
          true,
          [
            // algorithm: PBES2
            forge.asn1.create(
              forge.asn1.Class.UNIVERSAL,
              forge.asn1.Type.OID,
              false,
              forge.asn1.oidToDer('1.2.840.113549.1.5.13').getBytes() // PBES2
            ),
            // parameters
            forge.asn1.create(
              forge.asn1.Class.UNIVERSAL,
              forge.asn1.Type.SEQUENCE,
              true,
              [
                // keyDerivationFunc (PBKDF2)
                forge.asn1.create(
                  forge.asn1.Class.UNIVERSAL,
                  forge.asn1.Type.SEQUENCE,
                  true,
                  [
                    forge.asn1.create(
                      forge.asn1.Class.UNIVERSAL,
                      forge.asn1.Type.OID,
                      false,
                      forge.asn1.oidToDer('1.2.840.113549.1.5.12').getBytes() // PBKDF2
                    ),
                    forge.asn1.create(
                      forge.asn1.Class.UNIVERSAL,
                      forge.asn1.Type.SEQUENCE,
                      true,
                      [
                        // salt
                        forge.asn1.create(
                          forge.asn1.Class.UNIVERSAL,
                          forge.asn1.Type.OCTETSTRING,
                          false,
                          salt
                        ),
                        // iteration count
                        forge.asn1.create(
                          forge.asn1.Class.UNIVERSAL,
                          forge.asn1.Type.INTEGER,
                          false,
                          forge.asn1.integerToDer(iterations).getBytes()
                        ),
                        // key length
                        forge.asn1.create(
                          forge.asn1.Class.UNIVERSAL,
                          forge.asn1.Type.INTEGER,
                          false,
                          forge.asn1.integerToDer(32).getBytes() // AES-256 = 32 bytes
                        ),
                        // PRF (HMAC-SHA256)
                        forge.asn1.create(
                          forge.asn1.Class.UNIVERSAL,
                          forge.asn1.Type.SEQUENCE,
                          true,
                          [
                            forge.asn1.create(
                              forge.asn1.Class.UNIVERSAL,
                              forge.asn1.Type.OID,
                              false,
                              forge.asn1.oidToDer('1.2.840.113549.2.9').getBytes() // HMAC-SHA256
                            )
                          ]
                        )
                      ]
                    )
                  ]
                ),
                // encryptionScheme (AES-256-CBC)
                forge.asn1.create(
                  forge.asn1.Class.UNIVERSAL,
                  forge.asn1.Type.SEQUENCE,
                  true,
                  [
                    forge.asn1.create(
                      forge.asn1.Class.UNIVERSAL,
                      forge.asn1.Type.OID,
                      false,
                      forge.asn1.oidToDer('2.16.840.1.101.3.4.1.42').getBytes() // AES-256-CBC
                    ),
                    // IV
                    forge.asn1.create(
                      forge.asn1.Class.UNIVERSAL,
                      forge.asn1.Type.OCTETSTRING,
                      false,
                      iv
                    )
                  ]
                )
              ]
            )
          ]
        ),
        // encryptedData
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.OCTETSTRING,
          false,
          encryptedData
        )
      ]
    );

    // 转换为DER格式
    const encryptedDer = forge.asn1.toDer(encryptedPrivateKeyInfo).getBytes();

    // 转换为PEM格式
    const encryptedPem = forge.util.encode64(encryptedDer);
    const pemFormatted = '-----BEGIN ENCRYPTED PRIVATE KEY-----\n' +
      encryptedPem.match(/.{1,64}/g)?.join('\n') +
      '\n-----END ENCRYPTED PRIVATE KEY-----\n';

    return pemFormatted.replace(/\r\n/g, '\n');// 这里注意，是windows的 \r\n
    // return pemFormatted;

  } catch (error) {
    throw new Error(i18n.t('utils.aestip4') + ` ${error}`);
  }
}

// 解密ras私钥 openssl pkcs8 -in private_enc.pem -out private_enc.d.pem 
export function DecryptRsaPrivateKey(pemEncrypted: string, password: string): string {
  // 解析加密的 PKCS#8 PEM
  const encryptedPrivateKeyInfo = forge.pki.encryptedPrivateKeyFromPem(pemEncrypted);

  // 解密得到 PKCS#8 PrivateKeyInfo (ASN.1 格式)
  const privateKeyInfo = forge.pki.decryptPrivateKeyInfo(encryptedPrivateKeyInfo, password);

  if (!privateKeyInfo) {
    throw new Error(i18n.t('utils.aestip5'));
  }

  // 直接输出为 PKCS#8 PEM
  const pem = forge.pki.privateKeyInfoToPem(privateKeyInfo);

  return pem.replace(/\r\n/g, '\n');// 这里注意，是windows的 \r\n
}
