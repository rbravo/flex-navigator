/**
 * Configuração inicial do FlexLayout
 * Define o layout padrão e configurações globais
 */

import { getDefaultHomePage } from '../utils/userSettings';

export const getDefaultLayoutConfig = () => ({
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
    tabSetAutoSelectTab: false,
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
        weight: 100,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "Página Inicial",
            component: "browser",
            config: {
              url: getDefaultHomePage(),
              originalIndex: 0
            }
          }
        ]
      }
    ]
  }
});

// Manter compatibilidade com código existente
export const defaultLayoutConfig = getDefaultLayoutConfig();
