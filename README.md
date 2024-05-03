# lapras_new_candidate_notifier

LAPRASのスカウトメモを作成する候補者が追加されたらお知らせしてくれるプログラムです。
SlackとGmail宛に通知を送ります。
通知は件数のみです。候補者名や候補者URLなどは送りません。
新規候補者は GAS が有効化されたスプレッドシート上に記録していくため、一度通知された候補者が再度通知されることはありません。

# How to use

### スプレッドシート上で Google Apps Script を有効にし、スクリプトプロパティを設定する。

| Key                 | Value                                                           |
| ------------------- | --------------------------------------------------------------- |
| SHEET_NAME          | 候補者を抽出するシートの名前                                    |
| SHEET_URL           | 候補者を抽出するシートのURL                                     |
| SLACK_ICON_EMOJI    | Slack通知する際のスタンプ名(e.g., :memo:)                       |
| SLACK_NOTIFIER_NAME | Slack通知する際の名前（e.g., 通知くん）                         |
| SLACK_WEBHOOK_URL   | Slack Webhook URL（e.g., https://hooks.slack.com/services/...） |
| SUBJECT             | 送信するメールのタイトル                                        |

![script_properties](https://private-user-images.githubusercontent.com/37182298/327659897-1316d279-47bb-4aff-8340-0cbfe1da2cc3.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTQ3MTc1MDAsIm5iZiI6MTcxNDcxNzIwMCwicGF0aCI6Ii8zNzE4MjI5OC8zMjc2NTk4OTctMTMxNmQyNzktNDdiYi00YWZmLTgzNDAtMGNiZmUxZGEyY2MzLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNTAzVDA2MjAwMFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTZhYjBkZWIwOGI1NzlhN2I1ZDAzMmE5YzI4MzM1NDdiMDk4OTJiY2I4NTJlNWIwMzY5OWE2NzA2ODliZjFkYjgmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.iQ6yAvzKrEQLWznOX_vLp3XC60EGZLLxo1iBpeauuus)

### Gmail サービスを有効化する

Gmail APIを利用するため、GAS 画面上で Gmail サービスを追加する。

![gmail_service](https://private-user-images.githubusercontent.com/37182298/327660869-285f5c98-2489-44b3-9a54-4607595e5631.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTQ3MTc3OTUsIm5iZiI6MTcxNDcxNzQ5NSwicGF0aCI6Ii8zNzE4MjI5OC8zMjc2NjA4NjktMjg1ZjVjOTgtMjQ4OS00NGIzLTlhNTQtNDYwNzU5NWU1NjMxLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNTAzVDA2MjQ1NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTM5YWFkOWMxY2FjODI4NmMwMmIxYWExN2E5NmYwZjc3NzFkNDNmODc4Njk2NjU2NjVmMjZhZmM3NWJhNzExNzkmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.kFGTSIMOHoryI7CueMJmYsvkSLSGbDcFTfN3o8itgXU)

### clasp を使って GAS にコードを push する

```bash
$ clasp login
Logging in globally…
🔑 Authorize clasp by visiting this url:
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https...
...
Authorization successful.

Default credentials saved to: /path/to/current/directory/.clasprc.json.

$ clasp push
└─ /path/to/current/directory/appsscript.json
└─ /path/to/current/directory/main.ts
Pushed 2 files.
```

### GAS のトリガーを有効にする

最も短い1分間隔のトリガーであっても、スプレッドシート・GASどちらの制限も意識する必要がないため、最短である1分に設定しておく。

![trigger](https://private-user-images.githubusercontent.com/37182298/327659988-f8c613b5-cd22-4bdc-8ee5-9f9b28c163c5.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTQ3MTc1MDAsIm5iZiI6MTcxNDcxNzIwMCwicGF0aCI6Ii8zNzE4MjI5OC8zMjc2NTk5ODgtZjhjNjEzYjUtY2QyMi00YmRjLThlZTUtOWY5YjI4YzE2M2M1LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA1MDMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNTAzVDA2MjAwMFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWE4YTdjODhmODMyMGM5NTAwY2VjOWZjOWE0YmRiNjg3OTMxNTZkYWU1MDAxNGQxMGJiOTAzZWI1ZWYxMDdkN2EmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.uI7JofNKHtGmRMwWS7gKOeMxOsL2vnCX64FVTR-rZto)