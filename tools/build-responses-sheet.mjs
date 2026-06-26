import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs");
const outputPath = path.join(outputDir, "tasogare-survey-responses.xlsx");

const headers = [
  "送信日時",
  "年齢",
  "性別",
  "お住まい",
  "婚姻状況",
  "今回は誰と来ましたか",
  "このイベントを何で知りましたか",
  "イベント全体の満足度",
  "また参加したいですか",
  "特に良かったもの",
  "イベントの感想",
  "今後やってほしい企画",
  "補助金活用への感じ方",
  "既婚_Q1 取り組みへの感じ方",
  "既婚_Q2 つながりや交流のきっかけ",
  "既婚_Q3 結婚・子育て・家族との暮らし",
  "既婚_Q4 イベント全体の満足度",
  "既婚_Q5 暮らし・子育て環境への意見",
  "未婚_Q1 取り組みへの感じ方",
  "未婚_Q2 新しい出会いや交流のきっかけ",
  "未婚_Q3 将来の結婚や子育てへのイメージ",
  "未婚_Q4 イベント全体の満足度",
  "未婚_Q5 出会い・結婚・子育て支援への意見",
  "ユーザーエージェント",
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("回答");
sheet.showGridLines = false;

const headerRange = sheet.getRangeByIndexes(0, 0, 1, headers.length);
headerRange.values = [headers];
headerRange.format.fill.color = "#F6DFCF";
headerRange.format.font.bold = true;
headerRange.format.font.color = "#213845";
headerRange.format.wrapText = true;
headerRange.format.borders = {
  bottom: { style: "medium", color: "#E47852" },
};

const reservedRange = sheet.getRangeByIndexes(1, 0, 200, headers.length);
reservedRange.format.fill.color = "#FFFFFF";
reservedRange.format.borders = {
  insideHorizontal: { style: "thin", color: "#EFE4D9" },
};

sheet.freezePanes.freezeRows(1);
sheet.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm:ss");
sheet.getRangeByIndexes(0, 0, 201, headers.length).format.autofitColumns();
sheet.getRangeByIndexes(0, 0, 201, headers.length).format.autofitRows();

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const inspect = await workbook.inspect({
  kind: "sheet,table",
  tableMaxRows: 3,
  tableMaxCols: 8,
  maxChars: 3000,
});
console.log(inspect.ndjson);
console.log(outputPath);
