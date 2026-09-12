import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Typography } from 'antd';
import { UpOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Barra de busca na página (Ctrl+F), no estilo Chrome: campo de texto,
 * contador de resultados, navegar entre resultados e fechar. A busca em si
 * roda no processo da webview via webContents.findInPage - aqui só cuidamos
 * da UI e repassamos pra quem chamou (BrowserPanel, que tem a ref da
 * webview).
 */
const FindInPageBar = ({ visible, onClose, onFind, matches }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setText('');
    }
  }, [visible]);

  if (!visible) return null;

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    onFind(value, true, false);
  };

  const handleNext = () => {
    if (text) onFind(text, true, true);
  };

  const handlePrevious = () => {
    if (text) onFind(text, false, true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) handlePrevious();
      else handleNext();
    }
  };

  const hasMatches = matches && matches.matches > 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#2d2d30',
        border: '1px solid #3e3e42',
        borderRadius: 6,
        padding: '4px 6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}
    >
      <Input
        ref={inputRef}
        size="small"
        placeholder="Buscar na página"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ width: 180, backgroundColor: '#383838', borderColor: '#3e3e42', color: '#cccccc' }}
      />
      <Text style={{ color: '#a0a0a0', fontSize: 12, minWidth: 42, textAlign: 'center' }}>
        {text ? (hasMatches ? `${matches.activeMatchOrdinal}/${matches.matches}` : '0/0') : ''}
      </Text>
      <Button size="small" type="text" icon={<UpOutlined />} onClick={handlePrevious} disabled={!text} />
      <Button size="small" type="text" icon={<DownOutlined />} onClick={handleNext} disabled={!text} />
      <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose} />
    </div>
  );
};

export default FindInPageBar;
