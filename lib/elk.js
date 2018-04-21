'use babel';

import ElkView from './elk-view';
import { CompositeDisposable } from 'atom';

var active = false;

function getURI() {
  let editor = atom.workspace.getActiveTextEditor();
  if(!editor) return null;

  let grammar = editor.getGrammar().name;
  if(!grammar == "Elk") return null;

  let uri = "elk://editor/" + editor.id
  return uri;
}

export default {

  elkView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.elkView = new ElkView(state.myPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.elkView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elk:toggle': () => this.toggle()
    }));

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.elkView.destroy();
  },

  serialize() {
    return {
      elkViewState: this.elkView.serialize()
    };
  },

  toggle() {
    let editor = atom.workspace.getActiveTextEditor()
    if(!editor) return;
    if(editor.getGrammar().name !== "Elk") return;

    let uri = "elk://editor/" + editor.id
    let previewPane = atom.workspace.paneForURI(uri)
    if(previewPane) {
      previewPane.destroyItem(previewPane.itemForURI(uri))
      return
    }

    let previousActivePane = atom.workspace.getActivePane()
    atom.workspace.open(uri, { split: 'right', searchAllPanes: true}).then((elkView) => {
      if(typeof elkView === "ElkView") {
        elkView.renderHTML()
        previousActivePane.activate()
      }
    });
  }

};
