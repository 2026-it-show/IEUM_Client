import { useEffect } from 'react';
import * as S from './SuccessToast.styled';

interface SuccessToastProps {
  message: string;
  durationMs?: number;
  onDismiss: () => void;
}

function SuccessToast({
  message,
  durationMs = 2200,
  onDismiss,
}: SuccessToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [message, durationMs, onDismiss]);

  return <S.Container role="status">{message}</S.Container>;
}

export default SuccessToast;
