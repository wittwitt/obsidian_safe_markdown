# Obsidian Safe Markdown

obsidian文档加密插件。

采用RSA和AES混合加密方式。

使用方法：

1. 设置 -> 第三方插件 -> Safe Markdown -> 生成密钥文件

2. 保存密钥文件（建议放笔记目录之外, 私钥已经被加密，牢记密码，不可恢复）

3. 右键点击要加密或解密文件，选择加密/解密， 选择密钥文件位置，输入密码即可。

## 加/解密逻辑

### 加密

  1. random32 = Random(32 bytes)

      - 为每个文件生成一个32字节的随机密钥(random32)

  2. C = AES(random32, Plaintext)

      - 用随机密钥(random32)对明文(Plaintext)进行 AES 加密，得到密文(C)

  3. K = RSA_Encrypt(PubKey, random32)
  
      - 用公钥(PubKey)对随机密钥(random32)进行 RSA 加密, 得到加密后的密钥(K)

  5. Encrypted = K || C
  
      - 将加密后的密钥(K)与密文(C)拼接，作为最终加密结果（Encrypted）保存到文件

### 解密

  1. PrivKey = AES(Password, KeyFile)

      - 用用户密码（Password）解密密钥文件(KeyFile)，得到 RSA 私钥(PrivKey)

      - 注：密钥文件的生成后续有说明
  
  2. K，C = Encrypted

      - 从加密文件(Encrypted)中，拿到加密的随机密钥(K)和密文(C)

  2. random32 = RSA_Decrypt(PrivKey, K)
  
      - 用私钥(PrivKey)解密加密的随机密钥(K),得到随机密钥(random32)

  3. Plaintext = AES(random32, C)
  
      - 用解密得到的随机密钥(random32)解密密文(C)，还原明文


## RSA密钥文件

1. 生成私钥(2048, PKCS#8)

    ```sh
    openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
    ```

2. 导出公钥

    ```sh
    openssl rsa -in private.pem -pubout -out public.pem
    ```

3. 加密私钥

    ```sh
    openssl pkcs8 -in private.pem -out private_enc.pem -topk8 -v2 aes-256-cbc -v2prf hmacWithSHA256 -iter 100000
    ```

4. 合并私钥公钥

    - 默认保存方式就是 pk.pem = aes(rsa私钥)+rsa公钥

    ```sh
    cat private_enc.pem public.pem > pk.pem
    ```

5. 解密该文件

    ```sh
    openssl pkcs8 -in private_enc.pem -out private_enc.d.pem 
    ```