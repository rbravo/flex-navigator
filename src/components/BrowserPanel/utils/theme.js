import { theme } from 'antd';

// Configuração do tema escuro para Ant Design
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: '#2d2d30',
    colorBgElevated: '#383838',
    colorBorder: '#3e3e42',
    colorPrimary: '#1677ff',
    colorText: '#cccccc',
    colorTextSecondary: '#999999',
    colorBgLayout: '#1e1e1e',
    controlHeight: 32,
    borderRadius: 4,
  },
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 4,
      colorBgContainer: '#383838',
      colorBorder: '#3e3e42',
    },
    Input: {
      controlHeight: 32,
      borderRadius: 4,
      colorBgContainer: '#383838',
      colorBorder: '#3e3e42',
      activeBorderColor: '#aaaaaa',
      hoverBorderColor: '#aaaaaa',
    },
  },
};

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#d9d9d9',
    colorPrimary: '#1677ff',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
    colorBgLayout: '#f5f5f5',
    controlHeight: 32,
    borderRadius: 4,
  },
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 4,
    },
    Input: {
      controlHeight: 32,
      borderRadius: 4,
    },
  },
};
