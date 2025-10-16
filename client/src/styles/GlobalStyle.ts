import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: #0D1117;
    color: #C9D1D9;
    font-family: 'Press Start 2P', monospace;
    height: 100vh;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100vh;
    width: 100vw;
  }

  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #0D1117;
  }

  ::-webkit-scrollbar-thumb {
    background: #58A6FF;
    border-radius: 0;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #3FB950;
  }

  /* 选择文本样式 */
  ::selection {
    background: #58A6FF;
    color: #0D1117;
  }

  /* 输入框样式重置 */
  input, textarea, button {
    font-family: inherit;
    outline: none;
  }

  /* 按钮样式重置 */
  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  /* 链接样式 */
  a {
    color: #58A6FF;
    text-decoration: none;
  }

  a:hover {
    color: #3FB950;
  }
`;
