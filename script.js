document.addEventListener('DOMContentLoaded', () => {
    // --- Constants & Elements ---
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    const toggleCgpaBtn = document.getElementById('toggle-cgpa');
    const cgpaFields = document.getElementById('cgpa-fields');
    const themeToggle = document.getElementById('theme-toggle');
    const subjectTableBody = document.querySelector('#subject-table tbody');
    const resultSection = document.getElementById('result-section');

    // Result Elements
    const resCredits = document.getElementById('res-credits');
    const resSgpa = document.getElementById('res-sgpa');
    const resCgpa = document.getElementById('res-cgpa');
    const resPercentage = document.getElementById('res-percentage');
    const gradeBadge = document.getElementById('grade-badge');
    const cgpaResultItem = document.getElementById('cgpa-result-item');

    // History Elements
    const saveBtn = document.getElementById('save-btn');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // --- Defaults ---
    // --- Defaults ---
    const DEFAULT_SUBJECTS = [
        { name: "Discrete Mathematics", credits: 4 },
        { name: "Data Structures & Algorithms", credits: 3 },
        { name: "Database Management Systems", credits: 3 },
        { name: "Object-Oriented Programming", credits: 3 },
        { name: "Software Engineering", credits: 3 },
        { name: "Operating Systems", credits: 3 },
        { name: "DSA Laboratory", credits: 2 },
        { name: "DBMS Laboratory", credits: 2 },
        { name: "OS Laboratory", credits: 2 }
    ];

    // Data Migration: Check if old data exists (e.g., "Software Engineering (Theory)") and reset if so
    const storedForCheck = localStorage.getItem('subjects');
    if (storedForCheck && storedForCheck.includes("Software Engineering (Theory)")) {
        localStorage.removeItem('subjects');
    }

    // --- State ---
    let isCgpaEnabled = false;

    // --- Theme Handling ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Initialization ---
    renderSubjects();
    renderHistory(); // Load history on start

    // GSAP Intro Animations
    gsap.from("header", { duration: 1, y: -50, opacity: 0, ease: "power3.out" });
    gsap.from(".semester-info", { duration: 1, x: -30, opacity: 0, delay: 0.3, ease: "power3.out" });

    // Stagger table rows animation is handled in renderSubjects now

    function renderSubjects() {
        if (!subjectTableBody) return;

        // Load from storage or default
        const stored = localStorage.getItem('subjects');
        const subjects = stored ? JSON.parse(stored) : DEFAULT_SUBJECTS;

        if (!stored) {
            localStorage.setItem('subjects', JSON.stringify(DEFAULT_SUBJECTS));
        }

        subjectTableBody.innerHTML = '';
        subjects.forEach(sub => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-credits', sub.credits);
            tr.classList.add('subject-row'); // Add class for animation
            tr.innerHTML = `
                <td>${sub.name}</td>
                <td class="credit-cell">${sub.credits}</td>
                <td>
                    <select class="grade-select" required>
                        <option value="" disabled selected>Select Grade</option>
                        <option value="10">O</option>
                        <option value="9">A+</option>
                        <option value="8">A</option>
                        <option value="7">B+</option>
                        <option value="6">B</option>
                        <option value="5">C</option>
                        <option value="0">U</option>
                    </select>
                </td>
            `;
            subjectTableBody.appendChild(tr);
        });

        // GSAP Animation for rows
        gsap.from("tr", {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.5
        });
    }

    // --- UI Interactions ---
    if (toggleCgpaBtn) {
        toggleCgpaBtn.addEventListener('click', () => {
            isCgpaEnabled = !isCgpaEnabled;
            if (cgpaFields) cgpaFields.classList.toggle('hidden');
            toggleCgpaBtn.innerHTML = isCgpaEnabled
                ? '<span class="icon">-</span> Disable Previous Semesters'
                : '<span class="icon">+</span> Enable Previous Semesters (For CGPA)';

            if (cgpaResultItem) cgpaResultItem.style.display = isCgpaEnabled ? 'flex' : 'none';

            if (!isCgpaEnabled) {
                const pCredits = document.getElementById('prev-credits');
                const pCgpa = document.getElementById('prev-cgpa');
                if (pCredits) pCredits.value = '';
                if (pCgpa) pCgpa.value = '';
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
            const pCredits = document.getElementById('prev-credits');
            const pCgpa = document.getElementById('prev-cgpa');
            if (pCredits) pCredits.value = '';
            if (pCgpa) pCgpa.value = '';
            resultSection.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateResults);
    }

    // --- Download Modal Logic ---
    const downloadModal = document.getElementById('download-modal');
    const studentNameInput = document.getElementById('student-name');
    const studentRollInput = document.getElementById('student-roll');
    const confirmDownloadBtn = document.getElementById('confirm-download');
    const cancelDownloadBtn = document.getElementById('cancel-download');

    const printName = document.getElementById('print-name');
    const printRoll = document.getElementById('print-roll');
    const printDate = document.getElementById('print-date');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            // Check if result calculated
            if (resSgpa.textContent === "0.00") {
                alert("Please calculate the result first!");
                return;
            }
            // Open Modal
            downloadModal.classList.remove('hidden');
        });
    }

    if (cancelDownloadBtn) {
        cancelDownloadBtn.addEventListener('click', () => {
            downloadModal.classList.add('hidden');
        });
    }

    if (confirmDownloadBtn) {
        confirmDownloadBtn.addEventListener('click', () => {
            const name = studentNameInput.value.trim() || "Student";
            const roll = studentRollInput.value.trim() || "N/A";

            // 1. Update Print Header
            printName.textContent = name;
            printRoll.textContent = roll;
            printDate.textContent = new Date().toLocaleDateString();

            // 2. Change Document Title for Filename
            const originalTitle = document.title;
            const safeName = name.replace(/[^a-z0-9]/gi, '_');
            const safeRoll = roll.replace(/[^a-z0-9]/gi, '_');
            document.title = `${safeName}_${safeRoll}_Result`;

            // 3. Print
            window.print();

            // 4. Cleanup
            document.title = originalTitle;
            downloadModal.classList.add('hidden');
        });
    }

    // --- History Logic ---
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            // Validate if result is actually there
            if (resSgpa.textContent === "0.00" && resCredits.textContent === "0") {
                alert("Please calculate a result first!");
                return;
            }

            const resultData = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                sgpa: resSgpa.textContent,
                cgpa: isCgpaEnabled ? resCgpa.textContent : null,
                percentage: resPercentage.textContent,
                credits: resCredits.textContent
            };

            const history = getHistory();
            history.unshift(resultData); // Add to top
            localStorage.setItem('grade_history', JSON.stringify(history));

            // Visual feedback
            const originalText = '<span class="icon">💾</span> Save to History';
            saveBtn.textContent = "Saved!";
            saveBtn.disabled = true;

            renderHistory();

            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 2000);
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm("Clear all your saved history?")) {
                localStorage.removeItem('grade_history');
                renderHistory();
            }
        });
    }

    function getHistory() {
        const stored = localStorage.getItem('grade_history');
        return stored ? JSON.parse(stored) : [];
    }

    function renderHistory() {
        if (!historySection || !historyList) return;

        const history = getHistory();

        if (history.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-card';
            div.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${item.date}</span>
                    <button class="history-delete" onclick="deleteHistory(${item.id})" aria-label="Delete entry">×</button>
                </div>
                <div class="history-result">
                    ${item.cgpa ? `CGPA: ${item.cgpa}` : `SGPA: ${item.sgpa}`}
                </div>
                <div class="history-meta">
                    <span>${item.credits} Credits</span>
                    <span>${item.percentage}</span>
                </div>
            `;
            historyList.appendChild(div);
        });
    }

    // Expose delete to window for onclick attribute
    window.deleteHistory = (id) => {
        if (confirm("Delete this entry?")) {
            let history = getHistory();
            history = history.filter(item => item.id !== id);
            localStorage.setItem('grade_history', JSON.stringify(history));
            renderHistory();
        }
    };

    // --- Calculation Logic ---
    function calculateResults() {
        let totalCredits = 0;
        let totalPoints = 0;
        let allSelected = true;

        const rows = subjectTableBody.querySelectorAll('tr');

        for (const row of rows) {
            const credits = parseFloat(row.dataset.credits);
            const select = row.querySelector('.grade-select');

            if (!select) continue;

            const gradePoint = parseFloat(select.value);

            if (isNaN(gradePoint)) {
                allSelected = false;
                select.parentElement.style.borderBottom = "2px solid red";
            } else {
                select.parentElement.style.borderBottom = "1px solid var(--glass-border)";
                totalCredits += credits;
                totalPoints += (credits * gradePoint);
            }
        }

        if (!allSelected) {
            alert("Please select grades for all subjects.");
            return;
        }

        if (totalCredits === 0) {
            alert("Total credits cannot be zero.");
            return;
        }

        const sgpa = totalPoints / totalCredits;

        // CGPA
        let cgpa = sgpa;
        let overallCredits = totalCredits;

        if (isCgpaEnabled) {
            const pCredits = document.getElementById('prev-credits');
            const pCgpa = document.getElementById('prev-cgpa');

            const prevCredits = pCredits ? parseFloat(pCredits.value) : NaN;
            const prevCgpaVal = pCgpa ? parseFloat(pCgpa.value) : NaN;

            if (!isNaN(prevCredits) && !isNaN(prevCgpaVal)) {
                const prevPoints = prevCgpaVal * prevCredits;
                const grandTotalPoints = prevPoints + totalPoints;
                overallCredits = prevCredits + totalCredits;
                cgpa = grandTotalPoints / overallCredits;
            } else {
                alert("Please enter valid Previous Semester data or disable the option.");
                return;
            }
        }

        // Percentage
        const percentage = (cgpa - 0.5) * 10;

        displayResults(sgpa, cgpa, overallCredits, percentage);
    }

    function displayResults(sgpa, cgpa, totalCredits, percentage) {
        resSgpa.textContent = sgpa.toFixed(2);
        resCredits.textContent = totalCredits;

        if (isCgpaEnabled && cgpaResultItem) {
            resCgpa.textContent = cgpa.toFixed(2);
        }

        resPercentage.textContent = percentage.toFixed(2) + '%';

        const mainScore = isCgpaEnabled ? cgpa : sgpa;

        let gradeText = "";
        let gradeColor = "";

        if (mainScore >= 9.0) { gradeText = "Outstanding"; gradeColor = "#10b981"; }
        else if (mainScore >= 8.0) { gradeText = "Excellent"; gradeColor = "#3b82f6"; }
        else if (mainScore >= 7.0) { gradeText = "Very Good"; gradeColor = "#8b5cf6"; }
        else if (mainScore >= 6.0) { gradeText = "Good"; gradeColor = "#f59e0b"; }
        else if (mainScore >= 5.0) { gradeText = "Average"; gradeColor = "#f97316"; }
        else { gradeText = "Reappear"; gradeColor = "#ef4444"; }

        gradeBadge.textContent = gradeText;
        gradeBadge.style.background = gradeColor;

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // GSAP Result Animation
        gsap.fromTo("#result-section",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
        );

        gsap.from(".result-item", {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            delay: 0.2,
            ease: "power2.out"
        });
    }
});
