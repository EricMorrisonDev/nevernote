import { useCallback, useMemo, useReducer } from "react"

export interface HistoryEntry {
  noteId: string | null
  notebookId: string | null
  stackId?: string
}

type HistoryState = {
  entries: HistoryEntry[]
  /** Current position in `entries`, or -1 when empty */
  index: number
}

const MAX_ENTRIES = 50

type Action =
  | { type: "record"; entry: HistoryEntry }
  | { type: "back" }
  | { type: "forward" }
  | { type: "reset" }

//   check if stack id exists, if there is none set stackId to empty string
function normalizeStack(id?: string): string {
  return id ?? ""
}

// check if entries are the same note, return boolean
function entriesEqual(a: HistoryEntry, b: HistoryEntry): boolean {
  return (
    a.noteId === b.noteId &&
    a.notebookId === b.notebookId &&
    normalizeStack(a.stackId) === normalizeStack(b.stackId)
  )
}

// reduce actions into one pice of state. This will update the history array based on action
function historyReducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case "reset":
      return { entries: [], index: -1 }

    case "record": {
      const { entry } = action
      const { entries, index } = state

    //   we truncate to remove all entries to the right of the current entry
    //   we are adding an entry, so that means that anything to the right of this
    //   entry in the array gets removed, a new history path forms
      const truncated = entries.slice(0, index + 1)
      const last = truncated[truncated.length - 1]
    //   if last entry in truncated is the same as entry passed in parameters, no change needed
      if (last && entriesEqual(last, entry)) {
        return state
      }

    //   make sure that new list of entries does not exceed limit. 
    //   If it does, slice
      let nextEntries = [...truncated, entry]
      if (nextEntries.length > MAX_ENTRIES) {
        nextEntries = nextEntries.slice(nextEntries.length - MAX_ENTRIES)
      }
      return { entries: nextEntries, index: nextEntries.length - 1 }
    }

    case "back": {
      if (state.index <= 0) return state
      return { ...state, index: state.index - 1 }
    }

    case "forward": {
      if (state.index >= state.entries.length - 1) return state
      return { ...state, index: state.index + 1 }
    }

    default:
      return state
  }
}

const initialState: HistoryState = { entries: [], index: -1 }

export function useNoteHistory() {
  const [state, dispatch] = useReducer(historyReducer, initialState)

  const recordVisit = useCallback((entry: HistoryEntry) => {
    dispatch({ type: "record", entry })
  }, [])

  const goBack = useCallback((): HistoryEntry | null => {
    if (state.index <= 0) return null
    const nextIndex = state.index - 1
    const entry = state.entries[nextIndex] ?? null
    dispatch({ type: "back" })
    return entry
  }, [state.index, state.entries])

  const goForward = useCallback((): HistoryEntry | null => {
    if (state.index >= state.entries.length - 1) return null
    const nextIndex = state.index + 1
    const entry = state.entries[nextIndex] ?? null
    dispatch({ type: "forward" })
    return entry
  }, [state.index, state.entries])

  const reset = useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  const canGoBack = state.index > 0
  const canGoForward =
    state.entries.length > 0 && state.index < state.entries.length - 1

  const currentEntry = useMemo((): HistoryEntry | null => {
    if (state.index < 0 || state.index >= state.entries.length) return null
    return state.entries[state.index] ?? null
  }, [state.entries, state.index])

  return {
    entries: state.entries,
    index: state.index,
    currentEntry,
    recordVisit,
    goBack,
    goForward,
    reset,
    canGoBack,
    canGoForward,
  }
}
