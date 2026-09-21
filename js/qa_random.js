document.addEventListener("DOMContentLoaded", function () {
    var csvPath = "data/Laputa_ROCKiT_QA_random.csv";
    var question = document.getElementById("qa-question");
    var answer = document.getElementById("qa-answer");
    var source = document.getElementById("qa-source");

    if (!question || !answer || !source) {
        return;
    }

    fetch(csvPath)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("CSVを読み込めませんでした: " + response.status);
            }
            return response.text();
        })
        .then(function (text) {
            var rows = parseCSV(text);

            if (rows.length < 2) {
                throw new Error("CSVにQ&Aデータがありません。");
            }

            // 1行目は見出しなので除外
            var data = rows.slice(1).filter(function (row) {
                return row.length >= 3 && row[0].trim() !== "";
            });

            if (data.length === 0) {
                throw new Error("有効なQ&Aデータがありません。");
            }

            // ページを開くたびにランダムで1問選択
            var index = Math.floor(Math.random() * data.length);
            var row = data[index];

            // A列：質問
            question.textContent = row[0];

            // B列：メンバー4人の回答
            answer.innerHTML = "";

            var members = row[1].split(/\s*\/\s*/);

            members.forEach(function (member) {
                var line = document.createElement("div");
                line.textContent = member.trim();
                answer.appendChild(line);
            });

            // C列：参照先雑誌
            source.textContent = row[2];
        })
        .catch(function (error) {
            console.error("今日のQ&A:", error);
            question.textContent = "Q&Aを読み込めませんでした。";
            answer.textContent = "";
            source.textContent = "";
        });
});


// CSVを読み込むための簡易パーサー
// カンマを含むセル、ダブルクォーテーション、改行を含むセルに対応
function parseCSV(text) {
    var rows = [];
    var row = [];
    var cell = "";
    var quoted = false;

    // UTF-8 BOMを除去
    text = text.replace(/^\uFEFF/, "");

    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        var next = text[i + 1];

        if (ch === '"') {
            if (quoted && next === '"') {
                cell += '"';
                i++;
            } else {
                quoted = !quoted;
            }
        } else if (ch === "," && !quoted) {
            row.push(cell);
            cell = "";
        } else if ((ch === "\r" || ch === "\n") && !quoted) {
            if (ch === "\r" && next === "\n") {
                i++;
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
        } else {
            cell += ch;
        }
    }

    if (cell !== "" || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}
