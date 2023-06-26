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

  const logType = vscode.workspace
    .getConfiguration()
    .get("consoleManager.logType", "log");
  const logPrefix = vscode.workspace
    .getConfiguration()
    .get("consoleManager.logPrefix", `${selectedText}:`);
  const logStatement = `console.${logType}('${logPrefix}${selectedText}:', ${selectedText});\n`;

  // 获取选中行的行号和起始位置
  const selectedLineNumber = selection.active.line;
  const insertPosition = new vscode.Position(selectedLineNumber + 1, 0);
  editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, logStatement);
  });
}

// 获取当前行中所有 console.log、console.warn、console.error 语句的范围
function getLogStatements(editor: vscode.TextEditor): vscode.Range[] {
  const logStatements: vscode.Range[] = [];
  const line = editor.selection.active.line;
  const logTypes = ["log", "warn", "error"];
  const regex = new RegExp(
    `console\\.(${logTypes.join("|")})\\([^)]*\\);?`,
    "g"
  );
  const document = editor.document;
  const lineCount = document.lineCount;
  let match;

  while ((match = regex.exec(document.lineAt(line).text))) {
    const startPosition = new vscode.Position(line, match.index);
    const endPosition = new vscode.Position(
      line,
      match.index + match[0].length
    );
    const range = new vscode.Range(startPosition, endPosition);
    logStatements.push(range);
  }

  return logStatements;
}

// 检查当前文件中是否存在指定类型的 console 命令
function checkLogTypeExists(
  document: vscode.TextDocument,
  logTypes: string[]
): boolean {
  const regex = new RegExp(
    `console\\.(${logTypes.join("|")})\\([^)]*\\);?`,
    "g"
  );
  const fullDocumentRange = document.validateRange(
    new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
  );
  return document.getText().match(regex) !== null;
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
      console.log("hello-->range:", range);
      console.log("hello-->range:", range);
      console.log("hello-->range:", range);
      console.log("hello-->range:", range);
      console.log("hello-->range:", range);
      console.log("hello-->range:", range);
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
