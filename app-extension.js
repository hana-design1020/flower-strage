(function () {
  const oldTotal = 181;

  function injectStyles() {
    if (document.querySelector("#handsOnExtensionStyles")) return;

    const style = document.createElement("style");
    style.id = "handsOnExtensionStyles";
    style.textContent = `
      .implementation-section li {
        border-bottom: 1px solid #c7e0ea;
        padding: 0 0 11px 5px;
      }

      .implementation-section li:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }

      .implementation-step-title {
        display: block;
        margin-bottom: 2px;
        color: #16394d;
        font-size: 0.88rem;
      }

      .implementation-section li p {
        margin: 0;
      }
    `;
    document.head.append(style);
  }

  function extendRangeToLatestQuestions() {
    const rangeEnd = document.querySelector("#rangeEnd");
    if (!rangeEnd) return;

    const max = Number(rangeEnd.max || 0);
    const value = Number(rangeEnd.value || 0);
    if (max > oldTotal && value === oldTotal) {
      rangeEnd.value = String(max);
      rangeEnd.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function stepTitle(index) {
    return [
      "設定画面を開く",
      "基本設定を入力する",
      "関連設定を仕上げる",
      "保存して機能を確認する"
    ][index] || `設定作業 ${index + 1}`;
  }

  function currentPracticeName() {
    const numberText = document.querySelector("#questionNumber")?.textContent || "";
    const number = numberText.match(/\d+/)?.[0] || "Current";
    return `Q${number}_HandsOn`;
  }

  function currentRequirement() {
    const text = document.querySelector("#questionSummaryText")?.textContent
      || document.querySelector("#questionText")?.textContent
      || "問題文の要件";
    return text.replace(/^要するに、/, "");
  }

  function currentAnswer() {
    return (document.querySelector("#answerSummary")?.textContent || "正答の内容")
      .replace(/^正答:\s*/, "");
  }

  function makeStep(title, detail) {
    const item = document.createElement("li");
    const heading = document.createElement("strong");
    heading.className = "implementation-step-title";
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = detail;

    item.append(heading, paragraph);
    return item;
  }

  function enrichHandsOn() {
    const sections = document.querySelectorAll(".implementation-section");
    sections.forEach((section) => {
      if (section.dataset.enriched === "true") return;

      const list = section.querySelector("ol");
      if (!list) return;

      const originalSteps = [...list.querySelectorAll("li")]
        .map((item) => item.textContent.trim())
        .filter(Boolean);
      if (!originalSteps.length || list.querySelector(".implementation-step-title")) return;

      const practiceName = currentPracticeName();
      const answer = currentAnswer();
      const requirement = currentRequirement();
      list.textContent = "";

      list.append(
        makeStep(
          "完成条件を確認する",
          `${requirement} 正答「${answer}」を使って再現できれば完成です。`
        ),
        makeStep(
          "練習環境と名前を準備する",
          `本番組織ではなく、Trailhead Playground、Developer Edition、またはSandboxへシステム管理者でログインします。作成する設定やテストデータには「${practiceName}」を含めます。`
        )
      );

      originalSteps.forEach((step, index) => {
        list.append(makeStep(stepTitle(index), step));
      });

      list.append(
        makeStep(
          "正常系をテストする",
          `テストデータ「${practiceName}」を使い、問題文の条件をすべて満たす操作を行います。正答どおりの表示、権限、更新、通知、または集計結果になることを確認します。`
        ),
        makeStep(
          "条件違いと権限違いをテストする",
          "問題文の条件を1つだけ外したデータでも試します。必要に応じて一般ユーザーへログインを切り替え、許可される操作と拒否される操作が要件どおりに分かれることを確認します。"
        ),
        makeStep(
          "結果を記録して後片付けする",
          `期待結果と実際の結果、使用したテストユーザーをメモします。練習後は「${practiceName}」で検索し、不要なテストデータを削除して、作成した自動化や設定を無効化または削除します。`
        )
      );

      section.dataset.enriched = "true";
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    extendRangeToLatestQuestions();
    enrichHandsOn();

    const target = document.querySelector("#implementationSections");
    if (target) {
      new MutationObserver(enrichHandsOn).observe(target, { childList: true, subtree: true });
    }
  });
})();
