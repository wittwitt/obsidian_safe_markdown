import * as forge from 'node-forge';

import { GenRsaKeysContent, GetRsaPriKeyPem, GetRsaPubKeyPem } from "./key";
import { DecryptMarkdown, EncryptMarkdown } from "./encrypt";
import { AesCbc256Decrypt, AesCbc256Encrypt, DecryptRsaPrivateKey, EncryptRsaPrivateKey, GenRsaPirPub } from "./utils";
import { EncryptAndFormat, GetEncryptedKeyBody } from "./format";

const testPrivatePem = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDXi8VfDwzsmPB3
DMLG693L5cxxlikbQ99Gqmj4dk+nf82CJO9VgmCis+2Q+ygOYOhUlu8+XyO9DUeT
pmhxkhddtCSIz0+zPDIGcZO4iF/3MFs5SgfrTUz9wxlhhc2SKZNohJBIoXSw2ydr
zMKVyB6GRnzySC/pi2ZCIN0/pRbDy6gZR+9Y5UvgbpLDXhuBHSVAc564+EVwvvms
t63wSbz0CGsm2x587O4q4FD0xMTjW39kAOxEhahwBQudgIepIMhAFSDlTU/zF5YZ
DUi/+ZR5UZgTO4rg1X5ioisHCkYqXo+UeIBhZ0rFPdnkKFAfSyX5rvj6W5zWVDEX
/Q1p1QvPAgMBAAECggEAYgQzSpjjfavGnbx1zlNv1sq2/2gTZUyl+dKATYwviLG7
WFVHaJETNKmxfF5ZxsAWpnDEdo55B/1D8UaY9BxE9911R6lOSukyrm9zh1SsnxGk
Shb6JuxN+I+BuTFJXA//8mVl30FceRgPgxvn2IjaKKFhLCPbdc5oP+YF9m0yPvJF
XLpSv37NrIOd+eCgOgH3i7NgumOFJe00UiuoWPxpiCKk6wKMe+qSNMwTBBST2cIR
0zDsPE/h3isdnPD0hAgGGGhQ5wtmkLwtcXe/p5/J+GWBWOK6QxdMWuD0u826wKRL
N1VWW1/CGZWZYSPljTnuNZL0LErsiagY986l5jzFMQKBgQD8UH/w9Tv/G9HBwxK0
lv3J04izeYnHI6D2cBJcX/ILMweqB5xNYq3xKZHGTwUVhiRIjNQhwimXBk3ijuoF
XvA5MwiNsOOqw9ZD3Dvh4Onftovmb5s5k9zwKsy9pMSe+CVlgVewRwRr+4uX2I/2
GMOqYXYX69DJgpaC7+2W1eW86wKBgQDascejLpQs8HHp4din0LqMZDdz0GUQxBYJ
+hLASKTG3Q50fBuwHOH5dEpeUlNvIAD6+XFYKlP5g9rlkr/MGqFypg0Yqja1sYZv
YMP947AERL5tzxdUxcjrhX5T5jplOLm9uSss1bvVRpkQUeKL31QrupKCeEsUkmzt
vZ23cTDjrQKBgQCApHJ24jHywbZSeikhVhKTQnziNMdgdvPscfuKiYiY2S3BLRwu
AG/7E1y1pThMXxZEvziw9ZPK4nX3WzJKBruoDjMAOv345NxrwO/vHINhgmsV1DVq
R89PzCKTVlzBSHeYpzeUMsE4ZQopI0tTCBFK32IclCjhdOlUXQvf6bK2fQKBgQCq
8G8VU+EqRz8jCw8oDPTjq6nUcr2snziCz988QQvbDQqxbhjOTaUsMQO4Oi1RHPjn
M3au7Vb6H2BINa6JQP+U98ogz1s4JezovgA0QXZhv8IBXu/jqT1lKtEVj01xtScp
7sSapO3OxQH7SaYEoqnODGVcad511AYkxiOzMVx/eQKBgQCWv5APUcuDhmKx7qZV
CHflsv6wDOibeq9Y7OOyf4n3sz7OtKae/glm/UcMp8lbkTjr/ddKK6P4AEQZl4fZ
4Cd1OQwlpQp68OBnShKN8tDGTrkIhbn6NFam5C0LxqAxQrizxrc6cXgNRE6QTygO
siGSGp6r+Px9NwBKO+6Qfo2ezA==
-----END PRIVATE KEY-----`

const testPublicPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA14vFXw8M7JjwdwzCxuvd
y+XMcZYpG0PfRqpo+HZPp3/NgiTvVYJgorPtkPsoDmDoVJbvPl8jvQ1Hk6ZocZIX
XbQkiM9PszwyBnGTuIhf9zBbOUoH601M/cMZYYXNkimTaISQSKF0sNsna8zClcge
hkZ88kgv6YtmQiDdP6UWw8uoGUfvWOVL4G6Sw14bgR0lQHOeuPhFcL75rLet8Em8
9AhrJtsefOzuKuBQ9MTE41t/ZADsRIWocAULnYCHqSDIQBUg5U1P8xeWGQ1Iv/mU
eVGYEzuK4NV+YqIrBwpGKl6PlHiAYWdKxT3Z5ChQH0sl+a74+luc1lQxF/0NadUL
zwIDAQAB
-----END PUBLIC KEY-----`

export function test_EncryptRsaPrivateKey() {
  try {
    const { privateKeyPemPKCS8 } = GenRsaPirPub()
    // console.log(publicKeyPem);
    console.log(privateKeyPemPKCS8);

    const password = "your_password_here";
    const encryptedPem = EncryptRsaPrivateKey(privateKeyPemPKCS8, password);
    // console.log("加密后的私钥:");
    // console.log(encryptedPem);

    const privateKeyPemPKCS8_d = DecryptRsaPrivateKey(encryptedPem, password)
    console.log(privateKeyPemPKCS8_d);

    {
      const arr1 = privateKeyPemPKCS8.split('\n');
      const arr2 = privateKeyPemPKCS8_d.split('\n');
      // console.log(arr1);
      console.log(arr1.length, arr2.length);
      const arrlen = Math.min(arr1.length, arr2.length)
      for (let i = 0; i < arrlen; i++) {
        if (arr1[i] != arr2[i]) {
          console.log(arr1[i], arr1[i].length, arr2[i], arr2[i].length)
        }
      }
    }

    if (privateKeyPemPKCS8_d === privateKeyPemPKCS8) {
      console.log('✅ EncryptRsaPrivateKey OK');
    } else {
      throw new Error('❌ EncryptRsaPrivateKey');
    }
  } catch (error) {
    console.error('加密过程中发生错误:', error);
  }
}

export function test_EncryptRsaPrivateKey2() {
  try {
    const password = "123456";
    const encryptedPem = EncryptRsaPrivateKey(testPrivatePem, password);
    const privatePem_d = DecryptRsaPrivateKey(encryptedPem, password)
    // console.log(privatePem_d);
    // console.log(testPrivatePem + '\n');

    const arr1 = privatePem_d.split('\n');
    const arr2 = testPrivatePem.split('\n');
    // console.log(arr1);
    console.log(arr1.length, arr2.length);
    const arrlen = Math.min(arr1.length, arr2.length)
    for (let i = 0; i < arrlen; i++) {
      if (arr1[i] != arr2[i]) {
        console.log(arr1[i], arr1[i].length, arr2[i], arr2[i].length)
      }
    }


    if (privatePem_d === testPrivatePem + '\n') {
      console.log('✅ EncryptRsaPrivateKey2 OK');
    } else {
      throw new Error('❌ EncryptRsaPrivateKey2');
    }
  } catch (error) {
    console.error('加密过程中发生错误:', error);
  }
}

export function test_AesCbc256Encrypt() {
  const pwd = '1234567890123456';
  const plaintext = 'abc123456中文，你好，世界，hi，world'
  const ciphertext = AesCbc256Encrypt(plaintext, pwd)
  const ciphertext_d = AesCbc256Decrypt(ciphertext, pwd);
  if (plaintext === ciphertext_d) {
    console.log('✅ AesCbc256Encrypt OK');
  } else {
    console.log('ciphertext', ciphertext);
    console.log('ciphertext_d', ciphertext_d);
    throw new Error('❌ AesCbc256Encrypt Failed');
  }
}

export function test_EncryptMarkdown() {
  try {
    const plaintext = "abcedgaldkjlcvlzxcvjl";
    const { encryptedAesKey, ciphertext } = EncryptMarkdown(plaintext, testPublicPem)
    const plaintext_d = DecryptMarkdown(encryptedAesKey, ciphertext, testPrivatePem);
    if (plaintext_d === plaintext) {
      console.log('✅ EncryptMarkdown OK');
    } else {
      console.log('plaintext', plaintext);
      console.log('plaintext_d', plaintext_d)
      throw new Error('❌ EncryptMarkdown Failed');
    }
  } catch (error) {
    console.error('加密过程中发生错误:', error);
  }
}

export function test_GetRsaKey() {
  try {
    const password = '123feafasdfasfdfvczar';
    const { privateKeyPemPKCS8, publicKeyPem } = GenRsaPirPub();

    if (!verifyRsaKeyPair(publicKeyPem, privateKeyPemPKCS8)) {
      throw new Error('❌ GetRsaKey verifyRsaKeyPair');
      return
    }

    const encryptedPri = EncryptRsaPrivateKey(privateKeyPemPKCS8, password)
    const combined = encryptedPri + publicKeyPem;
    console.log("combinedPem", combined);

    {
      const privateKeyPemPKCS8_d = GetRsaPriKeyPem(combined, password)
      if (privateKeyPemPKCS8_d === privateKeyPemPKCS8) {
        console.log('✅ GetRsaKey OK');
      } else {
        console.log('privateKeyPemPKCS8')
        console.log(privateKeyPemPKCS8);
        console.log('privateKeyPemPKCS8_d')
        console.log(privateKeyPemPKCS8_d)
        throw new Error('❌ GetRsaKey  GetRsaPriKeyFailed');
      }
    }

    {
      const publicKeyPem_d = GetRsaPubKeyPem(combined)
      if (publicKeyPem_d === publicKeyPem) {
        console.log('✅ GetRsaKey OK');
      } else {
        console.log('publicKeyPem')
        console.log(publicKeyPem);
        console.log('publicKeyPem_d')
        console.log(publicKeyPem_d)
        throw new Error('❌ GetRsaKey GetRsaPubKey Failed');
      }
    }


  } catch (error) {
    console.error('加密过程中发生错误:', error);
  }
}

function verifyRsaKeyPair(publicKeyPem: string, privateKeyPem: string): boolean {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // 对于PKCS#8格式的私钥，需要先解析privateKeyInfo，然后提取私钥
    const privateKeyInfo = forge.asn1.fromDer(forge.pem.decode(privateKeyPem)[0].body);
    const privateKey = forge.pki.privateKeyFromAsn1(privateKeyInfo);

    const testMessage = 'rsa-key-test';
    const buffer = forge.util.createBuffer(testMessage, 'utf8');
    const binaryString = buffer.getBytes();

    // 公钥加密
    const encrypted = publicKey.encrypt(binaryString, 'RSAES-PKCS1-V1_5');
    // 私钥解密
    const decrypted = privateKey.decrypt(encrypted, 'RSAES-PKCS1-V1_5');

    return decrypted === testMessage;
  } catch (err) {
    console.error('验证失败:', err);
    return false;
  }
}

export function test_Format() {
  try {
    const password = '123feafasdfasfdfvczar';
    const plaintext = '12232中文，英文，141412141241241212e144'
    const keysContent = GenRsaKeysContent(password)

    const ciphertext = EncryptAndFormat(keysContent, plaintext)
    console.log('ciphertext');
    console.log(ciphertext);

    const { encryptedKey, encryptedBody } = GetEncryptedKeyBody(ciphertext);

    const privateKeyPem = GetRsaPriKeyPem(keysContent, password);
    const plaintext_d = DecryptMarkdown(encryptedKey, encryptedBody, privateKeyPem);

    {
      if (plaintext_d === plaintext) {
        console.log('✅ Format OK');
      } else {
        console.log('plaintext', plaintext);
        console.log('plaintext_d', plaintext_d)
        throw new Error('❌ Format Failed');
      }
    }


  } catch (error) {
    console.error('加密过程中发生错误:', error);
  }
}

test_AesCbc256Encrypt();
test_EncryptRsaPrivateKey();
test_EncryptRsaPrivateKey2();
test_EncryptMarkdown();
test_GetRsaKey();
test_Format();