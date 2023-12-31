// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "console-manager" is now active!'
  );
  let disposable = vscode.commands.registerCommand(
    "extension.insertLog",
    () => {
      insertLog();
    }
  );
  context.subscriptions.push(disposable);

  // 注册命令，用于删除日志语句
  const deleteLogCommand = vscode.commands.registerCommand(
    "extension.deleteLog",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const line = editor.selection.active.line;
        const lineText = document.lineAt(line).text;

        const logTypes = ["log", "warn", "error"];
        let deleteLogType = logTypes.filter((logType) =>
          lineText.includes(`console.${logType}`)
        );
        if (!deleteLogType.length) {
          deleteLogType = logTypes;
        }

        editor.edit((editBuilder) => {
          deleteAllLogStatements(editBuilder, document, deleteLogType);
        });
      }
    }
  );
  context.subscriptions.push(deleteLogCommand);
}

function insertLog() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  if (!selectedText) {
    return;
  }
  const endPosition = selection.end;
  const line = editor.document.lineAt(endPosition);

  const indent = line.text.match(/^\s*/)?.[0] || "";

  const logType = vscode.workspace
    .getConfiguration()
    .get("consoleManager.logType", "log");
  const logPrefix = vscode.workspace
    .getConfiguration()
    .get("consoleManager.logPrefix");
  const logStatement = `console.${logType}('${logPrefix}${selectedText}:', ${selectedText});\n`;

  editor.edit((editBuilder) => {
    editBuilder.insert(
      new vscode.Position(endPosition.line + 1, 0),
      indent + logStatement
    );
  });
}

// 删除当前文件中所有指定类型的 console 命令
function deleteAllLogStatements(
  editBuilder: vscode.TextEditorEdit,
  document: vscode.TextDocument,
  logTypes: string[]
) {
  const regex = new RegExp(
    `console\\.(${logTypes.join("|")})\\([^)]*\\);?`,
    "g"
  );
  const fullDocumentRange = document.validateRange(
    new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
  );

  let match;
  while ((match = regex.exec(document.getText()))) {
    const startPosition = document.positionAt(match.index);
    const endPosition = document.positionAt(match.index + match[0].length);
    const range = document.validateRange(
      new vscode.Range(startPosition, endPosition)
    );

    if (fullDocumentRange.contains(range)) {
      editBuilder.delete(range);
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
