/**
 * 修改配置后重启编辑器
 * 配置项文档：https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */

export default {
  printWidth: 120, // 每行宽度
  bracketSpacing: true, // 对象字面量中是否加空格
  arrowParens: 'avoid', // 箭头函数一个参数不加括号
  endOfLine: 'auto', // 自动根据操作系统换行符
  singleQuote: true, // 使用单引号
  semi: true, // 分号
  trailingComma: 'none', // 尾部不加逗号
  jsxSingleQuote: false,
  bracketSameLine: false // 大括号换行
};
