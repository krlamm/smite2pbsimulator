import { renderHook, act } from '@testing-library/react';
import { useDraft } from '../features/draft/hooks/useDraft';
import { gods } from '../constants/gods';

describe('useDraft', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDraft('standard'));

    expect(result.current.phase).toBe('BAN');
    expect(result.current.currentTeam).toBe('A');
    expect(result.current.picks.A).toEqual([]);
    expect(result.current.picks.B).toEqual([]);
    expect(result.current.bans.A).toEqual(Array(3).fill(null));
    expect(result.current.bans.B).toEqual(Array(3).fill(null));
  });

  it('should handle character selection in BAN phase', () => {
    const { result } = renderHook(() => useDraft('standard'));
    const character = gods[0];

    act(() => {
      result.current.handleCharacterSelect(character);
    });

    expect(result.current.bans.A[0]).toBe(character);
    expect(result.current.currentTeam).toBe('B');
  });

  it('should transition to PICK phase after 6 bans', () => {
    const { result } = renderHook(() => useDraft('standard'));

    for (let i = 0; i < 6; i++) {
      act(() => {
        result.current.handleCharacterSelect(gods[i]);
      });
    }

    expect(result.current.phase).toBe('PICK');
    expect(result.current.currentTeam).toBe('A');
  });

  it('should handle character selection in PICK phase', () => {
    const { result } = renderHook(() => useDraft('standard'));

    for (let i = 0; i < 6; i++) {
      act(() => {
        result.current.handleCharacterSelect(gods[i]);
      });
    }

    const character = gods[6];
    act(() => {
      result.current.handleCharacterSelect(character);
    });

    expect(result.current.picks.A[0]).toBe(character);
    expect(result.current.currentTeam).toBe('B');
  });

  it('should handle undo', () => {
    const { result } = renderHook(() => useDraft('standard'));
    const character = gods[0];

    act(() => {
      result.current.handleCharacterSelect(character);
    });

    expect(result.current.bans.A[0]).toBe(character);

    act(() => {
      result.current.handleUndo();
    });

    expect(result.current.bans.A[0]).toBe(null);
    expect(result.current.currentTeam).toBe('A');
  });
});
