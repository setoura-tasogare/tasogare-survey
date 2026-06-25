const SPREADSHEET_ID = "17LkpQ3nOngEGmZFwQJXcMkbYIdd7Sx2vGDQ2lB0hdLQ";
const SHEET_NAME = "回答";

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

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const row = FIELD_ORDER.map((field) => {
      const value = payload[field] || "";
      return Array.isArray(value) ? value.join(", ") : value;
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
