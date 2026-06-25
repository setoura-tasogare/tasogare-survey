const SUBMIT_ENDPOINT = "https://script.google.com/macros/s/AKfycbyPh28q3YYuwk1GNz0vt0x0HQUwpxE3ZxmaV9TZlXYG22Y2ifGIuHcUOtnzKp4dSLFj/exec";

const form = document.querySelector("#surveyForm");
const message = document.querySelector("#formMessage");
const maritalStatus = document.querySelector("#maritalStatus");
const subsidyEmpty = document.querySelector("#subsidyEmpty");
const marriedQuestions = document.querySelector("#marriedQuestions");
const unmarriedQuestions = document.querySelector("#unmarriedQuestions");

function updateBranch() {
  const status = maritalStatus.value;
  const branches = [marriedQuestions, unmarriedQuestions];

  branches.forEach((branch) => {
    branch.hidden = true;
    branch.setAttribute("aria-hidden", "true");
    branch.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = true;
    });
    branch.querySelectorAll("[data-branch-required]").forEach((field) => {
      field.required = false;
    });
  });

  const activeBranch =
    status === "married"
      ? marriedQuestions
      : status === "unmarried"
        ? unmarriedQuestions
        : null;

  subsidyEmpty.hidden = Boolean(activeBranch);

  if (!activeBranch) {
    return;
  }

  activeBranch.hidden = false;
  activeBranch.setAttribute("aria-hidden", "false");
  activeBranch.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = false;
  });
  activeBranch.querySelectorAll("[data-branch-required]").forEach((field) => {
    field.required = true;
  });
}

function collectFormData() {
  const data = new FormData(form);
  const payload = {};

  for (const [key, value] of data.entries()) {
    if (payload[key]) {
      payload[key] = Array.isArray(payload[key])
        ? [...payload[key], value]
        : [payload[key], value];
    } else {
      payload[key] = value;
    }
  }

  payload.submittedAt = new Date().toISOString();
  payload.userAgent = navigator.userAgent;
  return payload;
}

function markInvalidFields() {
  form.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid");
  });

  const firstInvalid = form.querySelector(":invalid");
  if (!firstInvalid) {
    return;
  }

  firstInvalid.classList.add("is-invalid");
  firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  firstInvalid.focus({ preventScroll: true });
}

async function submitPayload(payload) {
  if (!SUBMIT_ENDPOINT) {
    console.info("送信データ", payload);
    return {
      ok: true,
      demo: true,
    };
  }

  const response = await fetch(SUBMIT_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: response.ok || response.type === "opaque",
  };
}

maritalStatus.addEventListener("change", updateBranch);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  updateBranch();

  if (!form.checkValidity()) {
    message.textContent = "未入力の必須項目があります。ご確認ください。";
    markInvalidFields();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  message.textContent = "送信しています...";

  try {
    const payload = collectFormData();
    const result = await submitPayload(payload);

    if (!result.ok) {
      throw new Error("送信に失敗しました");
    }

    form.reset();
    updateBranch();
    message.textContent = result.demo
      ? "入力確認用のデモ送信が完了しました。"
      : "送信しました。ご協力ありがとうございました。";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    message.textContent =
      "送信できませんでした。少し時間をおいてもう一度お試しください。";
  } finally {
    submitButton.disabled = false;
  }
});

updateBranch();
