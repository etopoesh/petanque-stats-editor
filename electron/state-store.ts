import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import type { EditorState } from "../src/types/editor";
import { EMPTY_STATE } from "../src/types/editor";

const STATE_FILE_NAME = "editor-state.json";

function getStateDir(): string {
  // В проде exe лежит в корне установки — кладём файл рядом с ним.
  // В деве (npm run electron без сборки) кладём в корень проекта.
  return app.isPackaged ? path.dirname(app.getPath("exe")) : process.cwd();
}

function getStateFilePath(): string {
  return path.join(getStateDir(), STATE_FILE_NAME);
}

export async function readState(): Promise<EditorState> {
  const filePath = getStateFilePath();

  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_STATE; // первый запуск — состояния ещё нет
    }
    throw err;
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !Array.isArray(parsed.entries)) {
      throw new Error("editor-state.json: ожидался объект { maxBackupVersion, entries }");
    }
    return {
      maxBackupVersion: typeof parsed.maxBackupVersion === "number" ? parsed.maxBackupVersion : 0,
      entries: parsed.entries,
    } as EditorState;
  } catch (err) {
    // Файл битый — не теряем данные молча: откладываем в сторону и стартуем с пустого.
    const corruptPath = `${filePath}.corrupt-${Date.now()}`;
    await fs.rename(filePath, corruptPath).catch(() => {});
    throw new Error(
      `editor-state.json повреждён и перемещён в ${corruptPath}. Начинаем с пустого состояния. (${(err as Error).message})`
    );
  }
}

export async function writeState(state: EditorState): Promise<void> {
  const filePath = getStateFilePath();
  const tmpPath = `${filePath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(state, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath); // atomic на одной ФС — исключает половинчатую запись
}
