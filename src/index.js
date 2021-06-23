import React, { Fragment } from "react";
import { render } from "react-dom";
import "./styles.css";
import { Editor, EditorState, AtomicBlockUtils } from "draft-js";

const MyComponent = ({ blockProps, block, contentState }) => {
  const entity = block.getEntityAt(0);

  if (!entity) {
    return null;
  }

  const { provider, mention } = contentState.getEntity(entity).getData();
  return (
    <div editable="false">
      <b>{provider}</b>
      <span>{mention}</span>
    </div>
  );
};

const blockRenderer = (block) => {
  const type = block.getType();
  console.log("block", block);
  if (type === "atomic") {
    return {
      component: MyComponent,
      editable: false
    };
  }
  return null;
};

class App extends React.Component {
  state = {
    editorState: EditorState.createEmpty()
  };

  render() {
    const { editorState } = this.state;

    return (
      <Fragment>
        <button onClick={this.insertBlock}>Insert block</button>
        <Editor
          editorState={editorState}
          blockRendererFn={blockRenderer}
          onChange={this.onChange}
        />
      </Fragment>
    );
  }

  onChange = (editorState) => this.setState({ editorState });

  insertBlock = () => {
    const { editorState } = this.state;

    const contentState = editorState.getCurrentContent();

    const contentStateWithEntity = contentState.createEntity(
      "TOKEN",
      "IMMUTABLE",
      {
        provider: "Magento",
        mention: "{{bobn}}"
      }
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });

    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        " "
      )
    });
  };
}

render(<App />, document.getElementById("root"));
