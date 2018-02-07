module.exports = (config, items) => {
  let rendered = `/* stylelint-disable */
@font-face {
  font-family: '${config.name}';
  src: url('${config.font}') format('truetype');
}
[class^='${config.prefix}'],
[class*=' ${config.prefix}'] {
  line-height: inherit;

  &:before {
    font-family: '${config.name}' !important;
    font-style: normal;
    font-weight: normal !important;
    vertical-align: middle;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
`;
  rendered += items.map((rule) => {
    if (rule.name !== '\n') {
      return `
.${config.prefix}${config.separator}${rule.name}:before {
  content: '\\${rule.unicode}';
}
`;
    }
    return '';
  }).join('') + '/* stylelint-enable */';
  return rendered;
};
