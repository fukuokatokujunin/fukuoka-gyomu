#!/bin/bash
# 業務管理システム：Macにログインしたら自動でブラウザで開く設定（ファイルを使わない方式）
URL="https://fukuokatokujunin.github.io/fukuoka-gyomu/"
L="jp.tokujunin.gyomu"
P="$HOME/Library/LaunchAgents/$L.plist"
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$P" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$L</string>
  <key>ProgramArguments</key><array><string>/usr/bin/open</string><string>$URL</string></array>
  <key>RunAtLoad</key><true/>
</dict></plist>
EOF
launchctl bootout "gui/$(id -u)" "$P" 2>/dev/null
launchctl bootstrap "gui/$(id -u)" "$P"
# 以前の方法（ログイン項目に webloc を登録）が残っていると確認画面が出るので外す
osascript -e 'tell application "System Events" to delete (every login item whose name contains "業務管理システム")' >/dev/null 2>&1 \
  && OLD="" || OLD="※ 以前の設定が残っている場合は「システム設定」→「一般」→「ログイン項目」の「業務管理システム.webloc」を − で外してください。"
echo ""
echo "✅ 設定しました。いまブラウザで業務管理システムが開けば成功です（次回からMacの起動時に開きます）。"
[ -n "$OLD" ] && echo "$OLD"
exit 0
