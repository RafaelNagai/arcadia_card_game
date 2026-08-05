import { useState } from 'react';

export interface SettingsMenuProps {
  onSurrender: () => void;
}

type PanelState = 'closed' | 'menu' | 'confirm';

/** The in-battle settings button — today, just a single "Surrender" option behind a confirm
 *  step, since conceding immediately ends the match. Purely local UI state (open/closed);
 *  the actual surrender goes through the normal dispatch -> reducer path once confirmed. */
export function SettingsMenu({ onSurrender }: SettingsMenuProps) {
  const [panel, setPanel] = useState<PanelState>('closed');

  return (
    <div className="settings-menu">
      <button
        type="button"
        className="settings-gear"
        aria-label="Settings"
        onClick={() => setPanel(panel === 'closed' ? 'menu' : 'closed')}
      >
        ⚙
      </button>

      {panel !== 'closed' && (
        <>
          <div className="settings-backdrop" onClick={() => setPanel('closed')} />
          <div className="settings-popover">
            {panel === 'menu' ? (
              <button type="button" className="danger" onClick={() => setPanel('confirm')}>
                Surrender
              </button>
            ) : (
              <div className="settings-confirm">
                <p>Surrender the match? Your opponent wins immediately.</p>
                <div className="settings-confirm-actions">
                  <button type="button" onClick={() => setPanel('closed')}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      setPanel('closed');
                      onSurrender();
                    }}
                  >
                    Yes, surrender
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
