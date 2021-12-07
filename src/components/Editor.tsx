import { VFC } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import * as ace from "ace-builds/src-noconflict/ace";

export type EditorProps = {
  value: string;
  onChange: (code: string) => void;
};

// FIXME: Resolve this locally
ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/"
);
ace.config.setModuleUrl(
  "ace/mode/javascript_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/worker-javascript.js"
);

export const Editor: VFC<EditorProps> = ({ value, onChange }) => {
  return (
    <AceEditor
      value={value}
      mode="javascript"
      theme="tomorrow"
      onChange={onChange}
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
      width="100%"
      height="100%"
      setOptions={{
        fontSize: "18px",
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: false,
      }}
    />
  );
};
