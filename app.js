const input = document.getElementById("videoInput");
const uploadBtn = document.getElementById("uploadBtn");
const jobs = [];

let selectedFile = null;

input.addEventListener("change", () => {
  selectedFile = input.files[0];

  if (!selectedFile) return;

  if (
    !selectedFile.type.startsWith("video/") &&
    !/\.(mp4|mov|mkv|avi|webm)$/i.test(selectedFile.name)
  ) {
    alert("Please select a valid video file.");
    input.value = "";
    selectedFile = null;
    uploadBtn.disabled = true;
    return;
  }

  document.getElementById("fileText").textContent =
    selectedFile.name;

  document.getElementById("message").textContent =
    "File size: " + (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB";

  uploadBtn.disabled = false;
});

document.getElementById("format").addEventListener("change", e => {
  document.getElementById("formatStat").textContent =
    e.target.value.toUpperCase();
});

uploadBtn.addEventListener("click", () => {
  if (!selectedFile) return;

  const job = {
    id: "JOB-" + Date.now().toString().slice(-6),
    name: selectedFile.name,
    size: selectedFile.size,
    format: document.getElementById("format").value,
    status: "Queued",
    progress: 0,
    downloadUrl: null
  };

  jobs.unshift(job);
  selectedFile = null;
  input.value = "";
  uploadBtn.disabled = true;
  document.getElementById("fileText").textContent =
    "Choose a video to upload";
  document.getElementById("message").textContent =
    "Demo job submitted successfully!";

  render();
  simulate(job);
});

function simulate(job) {
  const steps = [15, 35, 58, 79, 100];
  let index = 0;

  job.status = "Processing";
  render();

  const timer = setInterval(() => {
    if (!jobs.includes(job)) {
      clearInterval(timer);
      return;
    }

    job.progress = steps[index++];

    if (job.progress === 100) {
      job.status = "Completed";

      // This is only a demo placeholder, not a converted video.
      job.downloadUrl = URL.createObjectURL(
        new Blob(
          ["Demo placeholder. Connect Flask and FFmpeg for real conversion."],
          { type: "text/plain" }
        )
      );

      clearInterval(timer);
    }

    render();
  }, 1200);
}

function render() {
  document.getElementById("total").textContent = jobs.length;

  document.getElementById("completed").textContent =
    jobs.filter(j => j.status === "Completed").length;

  document.getElementById("queued").textContent =
    jobs.filter(j => j.status === "Queued" || j.status === "Processing").length;

  const active = jobs.find(j =>
    j.status === "Queued" || j.status === "Processing"
  );

  const current = document.getElementById("currentJob");

  if (active) {
    current.innerHTML = progressHTML(active);
  } else if (jobs.length) {
    current.innerHTML = progressHTML(jobs[0]);
  } else {
    current.innerHTML = "<p>No active jobs yet.</p>";
  }

  const ongoing = jobs.filter(j =>
    j.status === "Queued" || j.status === "Processing"
  );

  document.getElementById("ongoingJobs").innerHTML = ongoing.length
    ? ongoing.map(j =>
        `<div class="ongoing-item">${progressHTML(j)}</div>`
      ).join("")
    : '<p class="empty">No active jobs. Upload another video to begin.</p>';

  renderVideos();
}

function progressHTML(job) {
  return `
    <div class="d-flex justify-content-between gap-2">
      <strong style="font-size:12px;overflow-wrap:anywhere">
        ${escapeHTML(job.name)}
      </strong>
      <span style="font-size:10px;color:#4eafff;white-space:nowrap">
        ${job.progress}% 
      </span>
    </div>
    <div class="progress">
      <div class="progress-bar" style="width:${job.progress}%"></div>
    </div>
    <div class="d-flex justify-content-between flex-wrap gap-2">
      <span class="status ${job.status}">${job.status}</span>
      <small style="color:#8196a9">ID: ${job.id}</small>
    </div>
    <p class="small-note mt-2 mb-0">
      Output: ${job.format.toUpperCase()}
    </p>`;
}

function renderVideos() {
  const query = document.getElementById("search").value.toLowerCase();

  const filtered = jobs.filter(j =>
    j.name.toLowerCase().includes(query)
  );

  document.getElementById("videoList").innerHTML = filtered.length
    ? filtered.map(j => `
      <div class="col-6 col-lg-3">
        <div class="video-card">
          <div class="video-icon">▶</div>
          <h6>${escapeHTML(j.name)}</h6>
          <p>${(j.size / (1024 * 1024)).toFixed(2)} MB · ${j.format.toUpperCase()}</p>
          <span class="status ${j.status}">${j.status}</span>
          <p class="mt-2">Job ID: ${j.id}</p>
          ${j.status === "Completed" && j.downloadUrl
            ? `<a class="btn btn-sm btn-primary w-100"
                 href="${j.downloadUrl}"
                 download="${escapeHTML(j.name.replace(/\.[^.]+$/, "") + "." + j.format)}">
                 Download
               </a>`
            : ""}
        </div>
      </div>`
    ).join("")
    : '<p class="empty">No matching videos found.</p>';
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

document.getElementById("search").addEventListener("input", renderVideos);

render();