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

const reviewParams = new URLSearchParams(window.location.search);
const reviewMode = reviewParams.get("review") === "1";

if (reviewMode) {
  initReviewMode();
}

function initReviewMode() {
  const storageKey = "tasogare-review-notes";
  const layer = document.createElement("div");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const toolbar = document.createElement("div");
  let notes = readNotes();
  let adding = false;
  let dragging = null;

  layer.className = "review-layer";
  svg.classList.add("review-svg");
  toolbar.className = "review-toolbar";
  toolbar.innerHTML = `
    <div>
      <strong>修正メモモード</strong>
      <span>「メモ追加」→修正したい場所をクリック。メモの上部をドラッグで移動できます。</span>
    </div>
    <button type="button" data-review-add>メモ追加</button>
    <button type="button" data-review-clear>全削除</button>
  `;

  layer.appendChild(svg);
  document.body.append(layer, toolbar);
  sizeLayer();
  renderNotes();

  toolbar.querySelector("[data-review-add]").addEventListener("click", () => {
    adding = true;
    document.body.classList.add("is-adding-review");
  });

  toolbar.querySelector("[data-review-clear]").addEventListener("click", () => {
    notes = [];
    saveNotes();
    renderNotes();
  });

  document.addEventListener(
    "click",
    (event) => {
      if (!adding || event.target.closest(".review-toolbar, .review-note")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const x = event.pageX;
      const y = event.pageY;
      const noteWidth = Math.min(260, window.innerWidth - 24);
      const preferredX = window.innerWidth < 560 ? x - noteWidth / 2 : x + 36;
      const minX = window.scrollX + 12;
      const maxX = window.scrollX + window.innerWidth - noteWidth - 12;
      const noteX = Math.min(Math.max(preferredX, minX), maxX);
      const noteY = y + 42;

      notes.push({
        id: crypto.randomUUID(),
        x,
        y,
        noteX: Math.max(12, noteX),
        noteY: Math.max(window.scrollY + 12, noteY),
        text: "",
      });

      adding = false;
      document.body.classList.remove("is-adding-review");
      saveNotes();
      renderNotes();
    },
    true,
  );

  document.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }

    const note = notes.find((item) => item.id === dragging.id);
    if (!note) {
      return;
    }

    note.noteX = Math.max(8, event.pageX - dragging.offsetX);
    note.noteY = Math.max(8, event.pageY - dragging.offsetY);
    saveNotes();
    renderNotes();
  });

  document.addEventListener("pointerup", () => {
    dragging = null;
  });

  window.addEventListener("resize", () => {
    sizeLayer();
    renderLines();
  });

  function readNotes() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  }

  function saveNotes() {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }

  function sizeLayer() {
    const width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  function renderNotes() {
    sizeLayer();
    layer.querySelectorAll(".review-note").forEach((note) => note.remove());

    notes.forEach((note, index) => {
      const noteEl = document.createElement("article");
      noteEl.className = "review-note";
      noteEl.style.left = `${note.noteX}px`;
      noteEl.style.top = `${note.noteY}px`;
      noteEl.innerHTML = `
        <div class="review-note__head">
          <span>修正メモ ${index + 1}</span>
          <button type="button">削除</button>
        </div>
        <textarea placeholder="ここに修正内容を書く">${note.text}</textarea>
      `;

      noteEl.querySelector("textarea").addEventListener("input", (event) => {
        note.text = event.target.value;
        saveNotes();
      });

      noteEl.querySelector("button").addEventListener("click", () => {
        notes = notes.filter((item) => item.id !== note.id);
        saveNotes();
        renderNotes();
      });

      noteEl.querySelector(".review-note__head").addEventListener("pointerdown", (event) => {
        dragging = {
          id: note.id,
          offsetX: event.pageX - note.noteX,
          offsetY: event.pageY - note.noteY,
        };
      });

      layer.appendChild(noteEl);
    });

    renderLines();
  }

  function renderLines() {
    svg.replaceChildren();

    notes.forEach((note) => {
      const startX = note.noteX + 130;
      const startY = note.noteY + 2;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const target = document.createElementNS("http://www.w3.org/2000/svg", "circle");

      line.setAttribute("x1", startX);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", note.x);
      line.setAttribute("y2", note.y);

      target.setAttribute("cx", note.x);
      target.setAttribute("cy", note.y);
      target.setAttribute("r", "7");

      svg.append(line, target);
    });
  }
}
