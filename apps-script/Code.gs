const SPREADSHEET_ID = "1HaVKTDuLSGlPOewWF3tcza1X79Zp-X32Y0oIQ3eTxYA";
const SHEET_NAME = "シート1";

const FIELD_ORDER = [
  "submittedAt",
  "age",
  "gender",
  "area",
  "maritalStatus",
  "companion",
  "referrer",
  "overallSatisfaction",
  "joinAgain",
  "goodPoints",
  "positiveFeeling",
  "positiveReason",
  "newConnection",
  "localInterestByConnection",
  "setouraInterest",
  "setouraJoinAgain",
  "eventComment",
  "futureIdeas",
  "subsidyUseFeeling",
  "marriedSupportFeeling",
  "marriedConnectionSupport",
  "marriedFamilyPositive",
  "marriedSubsidySatisfaction",
  "marriedSubsidyComment",
  "unmarriedSupportFeeling",
  "unmarriedConnectionSupport",
  "unmarriedMarriagePositive",
  "unmarriedSubsidySatisfaction",
  "unmarriedSubsidyComment",
  "userAgent",
];

const HEADERS = [
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
  "前向きな気持ちになりましたか",
  "前向きになった理由",
  "新しい人との出会いや交流",
  "交流を通じた地域への関心",
  "瀬戸浦への興味",
  "今後も瀬戸浦のイベントに参加したいですか",
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

function ensureHeaderRow(sheet) {
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell === HEADERS[0]) {
    return;
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function doGet() {
  try {
    const sheet = getSheet();
    ensureHeaderRow(sheet);
    return jsonResponse({
      ok: true,
      sheet: sheet.getName(),
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error),
    });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = getSheet();
    ensureHeaderRow(sheet);

    const row = FIELD_ORDER.map((field) => {
      const value = payload[field] || "";
      return Array.isArray(value) ? value.join(", ") : value;
    });

    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error),
    });
  }
}
