import { useEffect } from 'react';
import {
  editorStateFromSerializedDocument,
  exportFile,
  serializedDocumentFromEditorState
} from '@lexical/file';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  CLEAR_HISTORY_COMMAND,
} from 'lexical';

import {INITIAL_SETTINGS} from '../../appSettings';
import {docFromHash} from '../../utils/docSerialization';

const SubmitPlugin = (): JSX.Element => {
  const [editor] = useLexicalComposerContext();

  const submitAction = () => {
    const editorState = editor.getEditorState();
    const serializedState = serializedDocumentFromEditorState(editorState);
  };

  useEffect(() => {
    if (INITIAL_SETTINGS.isCollab) {
      return;
    }
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === 'Playground') {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);

  return (
    <div className="absolute bottom-0 right-0 text-right m-[10px]">
      <button
        className="bg-black text-white p-1 px-3 rounded-md cursor-pointer hover:opacity-90"
        onClick={submitAction}
      >
        SUBMIT
      </button>
    </div>
  );
}

export default SubmitPlugin;
