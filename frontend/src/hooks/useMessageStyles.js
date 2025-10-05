import { useEffect } from 'react';
import { useMessageStyleStore } from '../store/useMessageStyleStore';

export const useMessageStyles = () => {
  const { applyMessageStyles } = useMessageStyleStore();

  useEffect(() => {
    // Aplicar estilos de mensajes al cargar la aplicación
    applyMessageStyles();
  }, [applyMessageStyles]);

  return null;
};
