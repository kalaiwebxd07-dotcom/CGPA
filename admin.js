document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const loginSection = document.getElementById('login-section');
    const adminContent = document.getElementById('admin-content');
    const loginBtn = document.getElementById('login-btn');
    const adminNameInput = document.getElementById('admin-name');
    const adminPassInput = document.getElementById('admin-pass');
    const loginError = document.getElementById('login-error');

    const addSubjectBtn = document.getElementById('add-subject-btn');
    const newSubjectInput = document.getElementById('new-subject');
    const newCreditsInput = document.getElementById('new-credits');
    const adminTableBody = document.querySelector('#admin-subject-table tbody');
    const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

    // --- Constants ---
    const DEFAULT_SUBJECTS = [
        { name: "Discrete Mathematics", credits: 4 },
        { name: "Data Structures & Algorithms", credits: 3 },
        { name: "Database Management Systems", credits: 3 },
        { name: "Operating Systems", credits: 3 },
        { name: "Object-Oriented Programming", credits: 3 },
        { name: "Software Engineering (Theory)", credits: 3 },
        { name: "DSA Laboratory", credits: 2 },
        { name: "OS Laboratory", credits: 2 },
        { name: "Software Engineering Laboratory", credits: 2 }
    ];

    // --- State ---
    let subjects = loadSubjects();
    let editingIndex = -1; // Track which item is being edited

    // --- Login Logic ---
    loginBtn.addEventListener('click', () => {
        const name = adminNameInput.value.trim();
        const pass = adminPassInput.value;

        // Simple authentication check
        if (name === 'kalai' && pass === 'kalai100') {
            loginSection.classList.add('hidden');
            adminContent.classList.remove('hidden');
            renderTable();
        } else {
            loginError.style.display = 'block';
        }
    });

    // --- Subject Management ---
    function loadSubjects() {
        const stored = localStorage.getItem('subjects');
        return stored ? JSON.parse(stored) : [...DEFAULT_SUBJECTS];
    }

    function saveSubjects() {
        localStorage.setItem('subjects', JSON.stringify(subjects));
        renderTable();
    }

    function renderTable() {
        adminTableBody.innerHTML = '';
        subjects.forEach((sub, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sub.name}</td>
                <td>${sub.credits}</td>
                <td>
                    <button class="edit-btn" onclick="editSubject(${index})" style="background: rgba(118, 75, 162, 0.2); color: var(--highlight-color); border: 1px solid var(--highlight-color); border-radius: 8px; padding: 0.5rem; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                    <button class="delete-btn" onclick="deleteSubject(${index})">Delete</button>
                </td>
            `;
            adminTableBody.appendChild(tr);
        });
    }

    // Expose functions to window
    window.deleteSubject = (index) => {
        if (confirm(`Delete "${subjects[index].name}"?`)) {
            subjects.splice(index, 1);
            if (editingIndex === index) cancelEdit(); // Reset if deleting edited item
            saveSubjects();
        }
    };

    window.editSubject = (index) => {
        const sub = subjects[index];
        newSubjectInput.value = sub.name;
        newCreditsInput.value = sub.credits;
        editingIndex = index;

        addSubjectBtn.textContent = "Update Subject";
        addSubjectBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)"; // Green for update

        // Scroll to form
        document.querySelector('.admin-controls').scrollIntoView({ behavior: 'smooth' });
    };

    function cancelEdit() {
        editingIndex = -1;
        newSubjectInput.value = '';
        newCreditsInput.value = '';
        addSubjectBtn.textContent = "+ Add";
        addSubjectBtn.style.background = ""; // Reset to default
    }

    addSubjectBtn.addEventListener('click', () => {
        const name = newSubjectInput.value.trim();
        const credits = parseInt(newCreditsInput.value);

        if (name && credits > 0) {
            if (editingIndex >= 0) {
                // Update existing
                subjects[editingIndex] = { name, credits };
                cancelEdit();
            } else {
                // Add new
                subjects.push({ name, credits });
                newSubjectInput.value = '';
                newCreditsInput.value = '';
            }
            saveSubjects();
        } else {
            alert('Please enter valid Subject Name and Credits');
        }
    });

    resetDefaultsBtn.addEventListener('click', () => {
        if (confirm("Reset all subjects to Regulation 2021 defaults? This cannot be undone.")) {
            subjects = [...DEFAULT_SUBJECTS];
            cancelEdit();
            saveSubjects();
        }
    });
});
