import { useState, useRef, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getMotionValues } from '../hooks/useMotionTuning';

/* ─────────────────────────────────────────────────────────
 * SIDEBAR SECTION
 *
 * Collapsible section with smooth height animation.
 * Spring-driven expand/collapse via Motion.
 * ───────────────────────────────────────────────────────── */

interface SidebarSectionProps {
  title: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
}

export function SidebarSection({ title, defaultCollapsed = false, children }: SidebarSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const contentRef = useRef<HTMLDivElement>(null);

  const mv = getMotionValues();
  const spring = useMemo(() => ({
    type: 'spring' as const,
    visualDuration: mv.sectionVisualDuration,
    bounce: mv.sectionBounce,
  }), [mv.sectionVisualDuration, mv.sectionBounce]);

  return (
    <div className={`sidebar-section${collapsed ? ' collapsed' : ''}`}>
      <div
        className="sidebar-section-header"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="sidebar-section-title">{title}</span>
        <motion.svg
          className="sidebar-section-chevron"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={spring}
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </motion.svg>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            className="sidebar-section-content"
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            style={{ overflow: 'hidden' }}
          >
            <div className="sidebar-section-content-inner">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
