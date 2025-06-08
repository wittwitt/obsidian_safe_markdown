export default {
  settings: {
    title: "插件设置",
    language: "语言"
  },
  i18n: {
    languageChanged: "语言已经更换",
  },
  common: {
    save: "保存",
    cancel: "取消",
    reset: "重置",
    encrypt: "加密",
    decrypt: "解密",
    password: "密码",
    passTip: "输入密码",
    password2: '确认密码',
    pass2Tip: '再次输入密码',
    enterBtn: '确定',
    pass8Tip: '密码最少8位',
    passeqTip: '两次密码不一致，请重新输入',

    success: "操作成功",
    error: "错误: {{error}}",
  },
  makekey: {
    title: '生成新的密钥文件',
    l1: '私钥已使用 AES-256 算法加密，请设置一个复杂且安全的密码（建议长度不小于 16 位），以防被破解或遗忘。',
    l2: '密钥文件无法恢复，请务必备份至多个安全位置，防止意外丢失。',
    l3: '一旦密钥文件丢失，所有使用该密钥加密的文件将无法解密，请谨慎保管。',
    l4: '可以创建多个密钥文件，但加密与解密必须使用同一个密钥文件，否则将无法成功解密。',
    btnLabel: "生成",
    okTip: '密钥生成并加密完成',
    downTip: '保存文件',
    downFailed: '保存文件失败',
    passTip: '请输入加密密码(建议16位以上)',
  },
  format: {
    err1: '选中的文本不是有效的加密格式',
  },
  key: {
    noblock: '没有找到PEM blocks,是否BEGIN标识不对?',
  },
  main: {
    EncryptFile: '加密文件',
    DecryptFile: '解密文件',
    EncryptSelection: '加密内容',
    DecryptSelection: '解密内容',
    tip1: '请先选择要加密的文本',
    tip2: '内容已加密',
    tip3: '加密失败：',
    dtip1: '请先选择要解密的文本',
    dtip2: '内容已解密',
    dtip3: `解密失败:`,
    ftip1: '文件为空，无法加密',
    ftip2: '文件已加密',
    ftip3: `文件加密失败:`,
    fdtip1: '文件为空，无法解密',
    fdtip2: '文件已解密',
    fdtip3: `文件解密失败: `,
    intip1: '请选择密钥文件',
    intip2: '请选择密钥文件',
    intip3: '请输入解密密码',
  },
  share: {
    tip1: '保存文件',
    tip2: '保存失败:',
    tip3: '保存文件失败',
  },
  utils: {
    aestip1: '解密失败：密码错误或数据损坏',
    aestip2: 'UTF-8 解码失败，尝试备用方法',
    aestip3: '解码也失败了',
    aestip4: '加密私钥失败: ',
    aestip5: '解密失败，密码可能错误或格式不兼容'
  }
};