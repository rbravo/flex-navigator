/**
 * Configuração inicial do FlexLayout
 * Define o layout padrão e configurações globais
 */

export const defaultLayoutConfig = {
  global: {
    tabEnableClose: true,
    tabEnableRename: true,
    tabEnableDrag: true,
    tabDragSpeed: 0.3,
    splitterSize: 6,
    tabSetMinWidth: 150,
    tabSetMinHeight: 100,
    borderBarSize: 0,
    borderEnableDrop: false,
    tabSetClassNameTabStrip: "custom-tabstrip",
    tabSetHeaderHeight: 32,
    tabSetTabStripHeight: 32,
    tabSetEnableTabStrip: true,
    tabSetAutoSelectTab: true,
    tabSetEnableTabScrollbar: true,
    tabMinWidth: 250,
    tabSetEnableMaximize: false
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "Google",
            component: "browser",
            config: {
              url: "https://www.google.com"
            }
          },
          {
            type: "tab",
            name: "GitHub",
            component: "browser",
            config: {
              url: "https://github.com"
            }
          }
        ]
      },
      {
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "YouTube",
            component: "browser",
            config: {
              url: "https://www.youtube.com"
            }
          }
        ]
      }
    ]
  }
};
