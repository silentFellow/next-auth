'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import PlaygroundNodes from './Editor/nodes/PlaygroundNodes';

const ReadOnly = ({ content }: { content: string | undefined }) => {
  const editorConfig = {
    onError(error: any) {
      throw error;
    },
    namespace: 'blog',
    nodes: [...PlaygroundNodes],
    editable: false,
    editorState: content || null
  };

  return (
    <div className="p-3 w-full">
      <LexicalComposer initialConfig={editorConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className='pointer-events-none' />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  )
}

export default ReadOnly;
