import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function EventLog() {
  const { logs, suggestions, completeSuggestion } = useGameStore();

  const activeSuggestions = suggestions.filter(s => s.unlocked && !s.completed).slice(0, 3);

  return (
    <div className="w-80 glass-panel border-l border-y-0 border-r-0 flex flex-col z-10 shrink-0 h-full">
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <h3 className="text-lg font-bold text-accent mb-4 shrink-0">⭐ event log</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth">
          {logs.map((log) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm bg-black/20 p-2 rounded border border-white/5"
            >
              <span className="text-muted-foreground text-xs block mb-1">{log.time}</span>
              <span className="text-foreground/90">{log.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20 shrink-0 max-h-[50%] overflow-y-auto">
        <h3 className="text-lg font-bold text-primary glow-text mb-4">💡 suggestions</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {activeSuggestions.map(suggestion => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0 }}
                className="p-3 rounded-lg border border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(124,58,237,0.1)] relative group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">{suggestion.icon}</span>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-primary">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {suggestion.description}
                    </p>
                    <button
                      onClick={() => completeSuggestion(suggestion.id)}
                      className="mt-2 w-full py-1.5 rounded-md bg-primary/20 hover:bg-primary/40 text-primary-foreground text-xs font-medium border border-primary/50 transition-colors"
                    >
                      do it ✨
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {activeSuggestions.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-4 italic">
                waiting for the right moment...
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
