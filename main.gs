// Compiled using undefined undefined (TypeScript 4.9.5)
// 新規候補者が追加されたら Slack と Gmail に通知する
var main = function () {
    var candidates = getCandidates();
    if (candidates.length === 0) {
        return;
    }
    var updateCount = updateHistory(candidates);
    if (updateCount === 0) {
        return;
    }
    console.info("the number of new candidates: ", candidates.length);
    var msg = updateCount + "件の候補者が追加されました";
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
var sendGmail = function (msg) {
    var to = getProperty("EMAIL");
    var subject = getProperty("SUBJECT");
    var body = msg;
    GmailApp.sendEmail(to, subject, body);
};
/**
 * Slackに通知する
 * @param msg 通知内容
 * @example
 * notifySlack("Hello, World!")
 * // => SlackにHello, World!というメッセージが送信される
 */
var notifySlack = function (msg) {
    var postURL = getProperty("SLACK_WEBHOOK_URL");
    var slackNotifierName = getProperty("SLACK_NOTIFIER_NAME");
    var iconEmoji = getProperty("SLACK_ICON_EMOJI");
    var payload = {
        username: slackNotifierName,
        icon_emoji: iconEmoji,
        text: msg
    };
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
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
var getCandidates = function () {
    var DATA_BEGINNING_ROW = 2;
    var sheetUrl = getProperty("SHEET_URL");
    var sheetName = getProperty("SHEET_NAME");
    var sheet = SpreadsheetApp.openByUrl(sheetUrl).getSheetByName(sheetName);
    var values = sheet.getRange(DATA_BEGINNING_ROW, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var candidates = [];
    var re = /(バックエンド|フロントエンド|SRE)/;
    var priorityHigh = /優先度：高/;
    var priorityMiddle = /優先度：中/;
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var v = values_1[_i];
        var labels = v[7];
        var done = v[9];
        var screened = v[10];
        if (v.every(function (value) { return value === ""; }))
            break;
        if (re.test(labels) && done !== "o") {
            var priority = priorityHigh.test(labels) ? 1 : priorityMiddle.test(labels) ? 2 : 3;
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
var updateHistory = function (candidates) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = spreadsheet.getActiveSheet();
    var today = new Date();
    var count = 0;
    for (var i = 0; i < candidates.length; i++) {
        var textFinder = activeSheet.createTextFinder(candidates[i].curl);
        var cells = textFinder.findAll();
        if (cells.length === 0) {
            var lastRow = activeSheet.getLastRow();
            var lastARow = activeSheet.getRange(lastRow + 1, 1);
            var lastBRow = activeSheet.getRange(lastRow + 1, 2);
            var lastCRow = activeSheet.getRange(lastRow + 1, 3);
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
var getProperty = function (key) {
    return PropertiesService.getScriptProperties().getProperty(key);
};
