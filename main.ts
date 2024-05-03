// 新規候補者が追加されたら Slack と Gmail に通知する
const main = () => {
  const candidates: Array<any> = getCandidates() as Array<any>;
  if (candidates.length === 0) {
    return;
  }
  const updateCount = updateHistory(candidates);
  if (updateCount === 0) {
    return;
  }
  console.info("the number of new candidates: ", candidates.length);

  const msg = updateCount + "件の候補者が追加されました";
  notifySlack(msg);
  sendGmail(msg);
};

/**
 * Gmailに通知する
 * @param msg 通知内容
 * @example
 * sendGmail("Hello, World!")
 * // => GmailにHello, World!というメールが送信される
 */
const sendGmail = (msg: string) => {
  let to = getProperty("EMAIL");
  let subject = getProperty("SUBJECT");
  let body = msg;

  GmailApp.sendEmail(to, subject, body);
};

/**
 * Slackに通知する
 * @param msg 通知内容
 * @example
 * notifySlack("Hello, World!")
 * // => SlackにHello, World!というメッセージが送信される
 */
const notifySlack = (msg: string) => {
  const postURL = getProperty("SLACK_WEBHOOK_URL");
  const slackNotifierName = getProperty("SLACK_NOTIFIER_NAME");
  const iconEmoji = getProperty("SLACK_ICON_EMOJI");

  let payload = {
    username: slackNotifierName,
    icon_emoji: iconEmoji,
    text: msg,
  };

  let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };
  UrlFetchApp.fetch(postURL, options);
};

/**
 * シートから候補者を取得する
 * @returns 候補者のリスト
 * @example
 * getCandidates()
 * // => [{name: "John Doe", purl: "https://example.com", curl: "https://example.com", labels: "バックエンド", priority: 1}]
 */
const getCandidates = () => {
  const DATA_BEGINNING_ROW = 2;
  let sheetUrl = getProperty("SHEET_URL");
  let sheetName = getProperty("SHEET_NAME");
  let sheet = SpreadsheetApp.openByUrl(sheetUrl).getSheetByName(sheetName);
  let values = sheet.getRange(DATA_BEGINNING_ROW, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  let candidates = [];
  const re = /(バックエンド|フロントエンド|SRE)/;
  const priorityHigh = /優先度：高/;
  const priorityMiddle = /優先度：中/;

  for (let v of values) {
    let labels = v[7];
    let done = v[9];
    let screened = v[10];
    if (v.every((value) => value === "")) break;
    if (re.test(labels) && done !== "o") {
      let priority = priorityHigh.test(labels) ? 1 : priorityMiddle.test(labels) ? 2 : 3;
      candidates.push({ name: v[2], purl: v[3], curl: v[4], labels: labels, priority: priority });
    }
  }

  return candidates;
};

/**
 * シートの履歴を更新する
 * @param candidates
 * @returns
 */
const updateHistory = (candidates: any) => {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let activeSheet = spreadsheet.getActiveSheet();
  let today = new Date();
  let count = 0;
  for (let i = 0; i < candidates.length; i++) {
    let textFinder = activeSheet.createTextFinder(candidates[i].curl);
    let cells = textFinder.findAll();
    if (cells.length === 0) {
      let lastRow = activeSheet.getLastRow();
      let lastARow = activeSheet.getRange(lastRow + 1, 1);
      let lastBRow = activeSheet.getRange(lastRow + 1, 2);
      let lastCRow = activeSheet.getRange(lastRow + 1, 3);
      lastARow.setValue(candidates[i].purl);
      lastBRow.setValue(candidates[i].curl);
      lastCRow.setValue(Utilities.formatDate(today, "JST", "yyyy/MM/dd HH:mm:ss"));
      count++;
    }
  }
  return count;
};

/**
 * プロパティを取得する
 * @param key プロパティのキー
 * @returns プロパティの値
 * @example
 * getProperty("SLACK_WEBHOOK_URL")
 * // => https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
 */
const getProperty = (key: string) => {
  return PropertiesService.getScriptProperties().getProperty(key);
};
