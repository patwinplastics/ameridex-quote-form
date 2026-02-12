document.addEventListener("DOMContentLoaded", () => {

  // ===== ELEMENTS =====
  const form       = document.getElementById("quoteForm");
  const steps      = document.querySelectorAll(".form-step");
  const progressSteps = document.querySelectorAll(".progress-bar .step");
  const lines      = document.querySelectorAll(".step-line");
  const prevBtn    = document.getElementById("prevBtn");
  const nextBtn    = document.getElementById("nextBtn");
  const submitBtn  = document.getElementById("submitBtn");
  const uploadZone = document.getElementById("uploadZone");
  const fileInput  = document.getElementById("fileUpload");
  const fileList   = document.getElementById("fileList");

  let currentStep = 0;
  let uploadedFiles = [];

  // Set _next redirect to current page (shows custom success message)
  document.getElementById("formNext").value = window.location.href;

  // ===== STEP NAVIGATION =====
  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active-step", i === index);
    });

    // Update progress bar
    progressSteps.forEach((ps, i) => {
      ps.classList.remove("active", "completed");
      if (i < index) ps.classList.add("completed");
      if (i === index) ps.classList.add("active");
    });

    lines.forEach((line, i) => {
      line.classList.toggle("active-line", i < index);
    });

    // Toggle nav buttons
    prevBtn.disabled = index === 0;
    prevBtn.style.visibility = index === 0 ? "hidden" : "visible";

    if (index === steps.length - 1) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
    } else {
      nextBtn.style.display = "inline-block";
      submitBtn.style.display = "none";
    }
  }

  // ===== VALIDATION =====
  function validateStep(index) {
    const section = steps[index];
    const inputs  = section.querySelectorAll("input[required], select[required], textarea[required]");
    let valid = true;

    inputs.forEach(input => {
      const group = input.closest(".form-group") || input.parentElement;

      // Remove previous error state
      group.classList.remove("error");
      let errMsg = group.querySelector(".error-msg");
      if (errMsg) errMsg.remove();

      let hasError = false;

      if (input.type === "checkbox" && !input.checked) {
        hasError = true;
      } else if (input.type === "email" && input.value.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        hasError = true;
      } else if (input.type !== "checkbox" && input.value.trim() === "") {
        hasError = true;
      }

      if (hasError) {
        valid = false;
        group.classList.add("error");
        const msg = document.createElement("span");
        msg.className = "error-msg";
        msg.textContent = input.type === "checkbox" ? "You must agree to continue." : "This field is required.";
        group.appendChild(msg);
      }
    });

    return valid;
  }

  // Clear errors on input
  form.addEventListener("input", (e) => {
    const group = e.target.closest(".form-group") || e.target.parentElement;
    if (group) {
      group.classList.remove("error");
      const errMsg = group.querySelector(".error-msg");
      if (errMsg) errMsg.remove();
    }
  });

  form.addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
      const group = e.target.closest(".form-group") || e.target.parentElement;
      if (group) {
        group.classList.remove("error");
        const errMsg = group.querySelector(".error-msg");
        if (errMsg) errMsg.remove();
      }
    }
  });

  // ===== BUTTON EVENTS =====
  nextBtn.addEventListener("click", () => {
    if (validateStep(currentStep)) {
      currentStep++;
      showStep(currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // ===== FORM SUBMIT (via Formspree) =====
  form.addEventListener("submit", (e) => {

    // Validate the current step before allowing submission
    if (!validateStep(currentStep)) {
      e.preventDefault();
      return;
    }

    // Before submitting to Formspree, make all steps visible
    // so that hidden step inputs are included in the POST data.
    steps.forEach(step => {
      step.style.display = "block";
      step.style.position = "absolute";
      step.style.left = "-9999px";
    });

    // Show a loading state on the button
    submitBtn.textContent = "Submitting...";
    submitBtn.disabled = true;

    // Use AJAX submission to show custom success message
    e.preventDefault();

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    })
    .then(response => {
      if (response.ok) {
        // Show success message
        document.querySelector(".form-container").innerHTML = `
          <h1 class="brand-title">DrySpace Quote Request</h1>
          <div class="success-message">
            <div class="checkmark">&#10003;</div>
            <h2>Quote Request Submitted!</h2>
            <p>Thank you for your interest in DrySpace. We will review your project details and get back to you within 1-2 business days via your preferred contact method.</p>
          </div>
        `;
      } else {
        response.json().then(data => {
          let errorText = "There was a problem submitting the form. Please try again.";
          if (data && data.errors) {
            errorText = data.errors.map(err => err.message).join(", ");
          }
          alert(errorText);
          submitBtn.textContent = "Submit My Quote Request";
          submitBtn.disabled = false;
          // Restore step visibility
          steps.forEach((step, i) => {
            step.style.position = "";
            step.style.left = "";
            step.classList.toggle("active-step", i === currentStep);
            if (i !== currentStep) step.style.display = "none";
            else step.style.display = "block";
          });
        });
      }
    })
    .catch(() => {
      alert("Network error. Please check your connection and try again.");
      submitBtn.textContent = "Submit My Quote Request";
      submitBtn.disabled = false;
      steps.forEach((step, i) => {
        step.style.position = "";
        step.style.left = "";
        step.classList.toggle("active-step", i === currentStep);
        if (i !== currentStep) step.style.display = "none";
        else step.style.display = "block";
      });
    });
  });

  // ===== FILE UPLOAD =====
  uploadZone.addEventListener("click", () => fileInput.click());

  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "#8b1a1a";
    uploadZone.style.background = "#fef2f2";
  });

  uploadZone.addEventListener("dragleave", () => {
    uploadZone.style.borderColor = "#d1d5db";
    uploadZone.style.background = "#fff";
  });

  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "#d1d5db";
    uploadZone.style.background = "#fff";
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change", () => {
    handleFiles(fileInput.files);
  });

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      uploadedFiles.push(file);
    });
    renderFileList();
  }

  function renderFileList() {
    fileList.innerHTML = "";
    uploadedFiles.forEach((file, i) => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `
        <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
        <span class="remove-file" data-index="${i}">&times;</span>
      `;
      fileList.appendChild(item);
    });
  }

  fileList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-file")) {
      const idx = parseInt(e.target.dataset.index);
      uploadedFiles.splice(idx, 1);
      renderFileList();
    }
  });

  // ===== INIT =====
  showStep(0);

});
