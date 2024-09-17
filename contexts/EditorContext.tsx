'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface EditorStateContextProps {
  editorState: string;
  setEditorState: (state: string) => void;
}

const EditorStateContext = createContext<EditorStateContextProps | undefined>(undefined);

export const EditorStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editorState, setEditorState] = useState<string>('');

  return (
    <EditorStateContext.Provider value={{ editorState, setEditorState }}>
      {children}
    </EditorStateContext.Provider>
  );
};

export const useEditorState = (): EditorStateContextProps => {
  const context = useContext(EditorStateContext);
  if (!context) {
    throw new Error('useEditorState must be used within an EditorStateProvider');
  }
  return context;
};
