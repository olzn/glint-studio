import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HexColorPicker } from 'react-colorful';

const PICKER_SPRING = {
  type: 'spring' as const,
  visualDuration: 0.15,
  bounce: 0.1,
};

export function ColorPickerPopover({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const swatchRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!swatchRef.current) return;
    const rect = swatchRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  }, []);

  // Position popover when opening
  useEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        swatchRef.current && !swatchRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  // Close on sidebar scroll
  useEffect(() => {
    if (!open) return;
    const sidebar = swatchRef.current?.closest('.sidebar-scroll');
    if (!sidebar) return;
    const handleScroll = () => setOpen(false);
    sidebar.addEventListener('scroll', handleScroll);
    return () => sidebar.removeEventListener('scroll', handleScroll);
  }, [open]);

  return (
    <div className="color-swatch" ref={swatchRef} style={{ backgroundColor: color }} onClick={() => setOpen((v) => !v)}>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popoverRef}
              className="color-picker-popover"
              style={{ position: 'fixed', top: pos.top, left: pos.left }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={PICKER_SPRING}
            >
              <HexColorPicker color={color} onChange={onChange} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
