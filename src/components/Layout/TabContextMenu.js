import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Copy, Volume2, VolumeX, X } from 'lucide-react';
import './TabContextMenu.css';

/**
 * Menu de contexto para tabs do FlexLayout
 * Fornece opções para administrar as abas do navegador
 */
const TabContextMenu = ({ 
  isVisible, 
  position, 
  onClose, 
  onRefresh, 
  onDuplicate, 
  onToggleMute, 
  onCloseTab,
  isMuted = false 
}) => {
  const [menuPosition, setMenuPosition] = useState(position);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      // Ajustar posição do menu se estiver muito próximo das bordas
      const adjustedPosition = { ...position };
      
      // Verificar se o menu sai da tela horizontalmente
      if (position.x + 200 > window.innerWidth) {
        adjustedPosition.x = window.innerWidth - 200;
      }
      
      // Verificar se o menu sai da tela verticalmente
      if (position.y + 120 > window.innerHeight) {
        adjustedPosition.y = window.innerHeight - 120;
      }
      
      setMenuPosition(adjustedPosition);
    }
  }, [isVisible, position]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    // Função para detectar quando o foco sai do menu (especialmente para webviews)
    const handleFocusChange = () => {
      if (isVisible) {
        // Pequeno delay para permitir que o novo foco seja estabelecido
        setTimeout(() => {
          const activeElement = document.activeElement;
          
          // Se o foco foi para uma webview ou iframe, fechar o menu
          if (activeElement && (
            activeElement.tagName === 'WEBVIEW' || 
            activeElement.tagName === 'IFRAME' ||
            activeElement.closest('webview') ||
            activeElement.closest('iframe')
          )) {
            onClose();
          }
        }, 10);
      }
    };

    // Função para detectar blur da janela (quando clica em webview)
    const handleWindowBlur = () => {
      if (isVisible) {
        // Delay maior para webviews pois elas podem causar blur temporário
        setTimeout(() => {
          // Verificar se ainda estamos na mesma janela
          if (document.hasFocus() && isVisible) {
            // Se o documento tem foco mas o menu ainda está visível,
            // provavelmente clicaram em uma webview
            const activeElement = document.activeElement;
            if (activeElement && (
              activeElement.tagName === 'WEBVIEW' || 
              activeElement.tagName === 'IFRAME'
            )) {
              onClose();
            }
          }
        }, 50);
      }
    };

    // Função para detectar mudanças no elemento ativo
    const handleVisibilityChange = () => {
      if (isVisible && document.hidden) {
        onClose();
      }
    };

    if (isVisible) {
      // Listeners existentes
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      // Novos listeners para detectar webviews
      document.addEventListener('focusin', handleFocusChange);
      document.addEventListener('focusout', handleFocusChange);
      window.addEventListener('blur', handleWindowBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Listener específico para webviews (se existirem)
      const webviews = document.querySelectorAll('webview');
      const handleWebviewFocus = () => onClose();
      
      webviews.forEach(webview => {
        webview.addEventListener('focus', handleWebviewFocus);
      });

      // Estratégia adicional: detectar movimento do mouse para webviews
      /* 
      const handleMouseMove = (event) => {
        if (isVisible && menuRef.current) {
          const menuRect = menuRef.current.getBoundingClientRect();
          const mouseX = event.clientX;
          const mouseY = event.clientY;
          
          // Se o mouse está fora do menu
          if (mouseX < menuRect.left || mouseX > menuRect.right || 
              mouseY < menuRect.top || mouseY > menuRect.bottom) {
            
            // Verificar se está sobre uma webview
            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
            if (elementUnderMouse && (
              elementUnderMouse.tagName === 'WEBVIEW' ||
              elementUnderMouse.closest('webview') ||
              elementUnderMouse.tagName === 'IFRAME' ||
              elementUnderMouse.closest('iframe')
            )) {
              // Delay pequeno para evitar fechamento acidental
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => {
                onClose();
              }, 100);
            } else {
              // Cancelar timeout se voltou para área segura
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }
          }
        }
      };

      // Detectar quando o mouse entra na área de uma webview
      const handleMouseEnterWebview = () => {
        if (isVisible) {
          setTimeout(() => onClose(), 50);
        }
      };
      */

      // Adicionar listeners de mouse em webviews existentes
      webviews.forEach(webview => {
        //webview.addEventListener('mouseenter', handleMouseEnterWebview);
      });

      //document.addEventListener('mousemove', handleMouseMove);

      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('focusin', handleFocusChange);
        document.removeEventListener('focusout', handleFocusChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        //document.removeEventListener('mousemove', handleMouseMove);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        webviews.forEach(webview => {
          webview.removeEventListener('focus', handleWebviewFocus);
          //webview.removeEventListener('mouseenter', handleMouseEnterWebview);
        });
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  const menuItems = [
    {
      icon: <RefreshCw size={16} />,
      label: 'Atualizar',
      action: onRefresh,
      className: 'refresh'
    },
    {
      icon: <Copy size={16} />,
      label: 'Duplicar aba',
      action: onDuplicate,
      className: 'duplicate'
    },
    {
      icon: isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />,
      label: isMuted ? 'Ativar som' : 'Silenciar aba',
      action: onToggleMute,
      className: 'mute'
    },
    {
      type: 'separator'
    },
    {
      icon: <X size={16} />,
      label: 'Fechar aba',
      action: onCloseTab,
      className: 'close'
    }
  ];

  return (
    <div 
      ref={menuRef}
      className="tab-context-menu"
      style={{
        position: 'fixed',
        left: menuPosition.x,
        top: menuPosition.y,
        zIndex: 10000
      }}
      onClick={handleMenuClick}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="menu-separator" />;
        }

        return (
          <div
            key={index}
            className={`menu-item ${item.className}`}
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TabContextMenu;
