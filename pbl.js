
////////////////////////////////////////////////////////////////////////////////////////// LEKHAK - The Smart Notepad
//////////////////////////////////////////////////////////////////////////////// Complete JavaScript Functionality ke hai dono  

///////////////////////////////////////////////////////////////////////////////// Global Variables  ke liyea  optional dala hai  
let notes = [];
let currentNoteIndex = 0;
let autoSaveTimer;
let tasks = [];

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////(app ki styling yha se start hai )
document.addEventListener('DOMContentLoaded', () => {
    loadNotesFromStorage();
    if (notes.length === 0) {
        createNewNote();
    } else {
        loadNote(0);
    }
    renderNotesList();
    renderTasks();
    updateWordCount();
});


/////////////////////////////////////////////////////////////////////////////////////// ntoe making ki styling yha se start hai 


function createNewNote() {
    const newNote = {
        id: Date.now(),
        title: '',
        content: '',
        font: 'Poppins',
        color: '#000000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    currentNoteIndex = notes.length - 1;
    saveNote();
    renderNotesList();
    renderTabs();
    loadNote(currentNoteIndex);
    
    showToast('✨ New note created!');
}

function loadNote(index) {
    if (index < 0 || index >= notes.length) return;
    
    currentNoteIndex = index;
    const note = notes[index];
    
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('editor').innerHTML = note.content;
    document.getElementById('fontSelector').value = note.font;
    document.getElementById('editor').style.fontFamily = getFontFamily(note.font);
    document.getElementById('editor').style.color = note.color;
    
    renderNotesList();
    renderTabs();
    updateWordCount();
    
    document.getElementById('lastSaved').textContent = 'Not saved yet';
}

function saveNote() {
    const note = notes[currentNoteIndex];
    note.title = document.getElementById('noteTitle').value;
    note.content = document.getElementById('editor').innerHTML;
    note.font = document.getElementById('fontSelector').value;
    note.updatedAt = new Date().toISOString();
    
    localStorage.setItem('lekhak_notes', JSON.stringify(notes));
    
    const now = new Date();
    document.getElementById('lastSaved').textContent = 
        `Saved at ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    renderNotesList();
    renderTabs();
}

function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveNote();
        updateWordCount();
    }, 1000);
}

function deleteCurrentNote() {
    if (notes.length <= 1) {
        showToast('⚠️ Cannot delete the last note');
        return;
    }
    
    if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(currentNoteIndex, 1);
        
        if (currentNoteIndex >= notes.length) {
            currentNoteIndex = notes.length - 1;
        }
        
        saveNote();
        loadNote(currentNoteIndex);
        showToast('🗑️ Note deleted');
    }
}

function newNote() {
    createNewNote();
}

//////////////////////////////////////////////////////////////////////////////////////////////// TABS manag ke liyea container kin stylng 

function addNewTab() {
    createNewNote();
}

function closeTab(index, event) {
    event.stopPropagation();
    
    if (notes.length <= 1) {
        showToast('⚠️ Cannot close the last tab');
        return;
    }
    
    if (confirm('Are you sure you want to close this note?')) {
        notes.splice(index, 1);
        
        if (currentNoteIndex >= notes.length) {
            currentNoteIndex = notes.length - 1;
        }
        
        saveNote();
        loadNote(currentNoteIndex);
    }
}

function renderTabs() {
    const container = document.getElementById('tabsContainer');
    container.innerHTML = '';
    
    notes.forEach((note, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === currentNoteIndex ? 'active' : ''}`;
        tab.onclick = () => loadNote(index);
        
        const title = note.title || 'Untitled Note';
        tab.innerHTML = `
            ${title.substring(0, 15)}${title.length > 15 ? '...' : ''}
            <span class="close-tab" onclick="closeTab(${index}, event)">×</span>
        `;
        
        container.appendChild(tab);
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// NOTES LIST ka container js jo funcationality


function renderNotesList() {
    const container = document.getElementById('notesList');
    container.innerHTML = '';
    
    notes.forEach((note, index) => {
        const item = document.createElement('div');
        item.className = `note-item ${index === currentNoteIndex ? 'active' : ''}`;
        item.onclick = () => loadNote(index);
        
        const title = note.title || 'Untitled Note';
        const preview = note.content.replace(/<[^>]*>/g, '').substring(0, 50);
        
        item.innerHTML = `
            <strong>${title}</strong><br>
            <small>${preview}...</small>
        `;
        
        container.appendChild(item);
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// FONT & COLOR ye font  ko us hi color me select kr ta hai 


function getFontFamily(fontName) {
    const fonts = {
        'Poppins': 'Poppins, sans-serif',
        'Dancing Script': '"Dancing Script", cursive',
        'Pacifico': '"Pacifico", cursive',
        'Comfortaa': '"Comfortaa", cursive',
        'Shadows Into Light': '"Shadows Into Light", cursive',
        'Arial': 'Arial, sans-serif',
        'Times New Roman': '"Times New Roman", serif'
    };
    return fonts[fontName] || 'Poppins, sans-serif';
}

function changeFont(fontName) {
    document.getElementById('editor').style.fontFamily = getFontFamily(fontName);
    saveNote();
}

function changeTextColor(color) {
    document.getElementById('editor').style.color = color;
    saveNote();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////// AI ASSISTANT ki funcationality


function toggleAIAssistant() {
    const panel = document.getElementById('aiPanel');
    panel.classList.toggle('open');
}

function handleAIKeyPress(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    showToast('🤖 AI is thinking...');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "I've analyzed your note! Here's a quick summary of key points.",
            "Great writing! I've noticed some patterns in your work.",
            "I've scheduled your task. You'll be reminded at the right time!",
            "Here are some suggestions to improve your writing:",
            "Your note has been organized successfully!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        showToast(randomResponse);
    }, 1500);
}

function askAI(prompt) {
    document.getElementById('aiInput').value = prompt;
    sendAIMessage();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TASK SCHEDULER WALA HAI 


function addTask() {
    const input = document.getElementById('newTask');
    const dateInput = document.getElementById('taskDate');
    
    const taskName = input.value.trim();
    const taskDate = dateInput.value;
    
    if (!taskName) {
        showToast('⚠️ Please enter a task');
        return;
    }
    
    const task = {
        id: Date.now(),
        name: taskName,
        date: taskDate || new Date().toISOString().split('T')[0],
        completed: false
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    
    input.value = '';
    dateInput.value = '';
    
    showToast('📅 Task added successfully!');
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    showToast('Task deleted');
}

function renderTasks() {
    const container = document.getElementById('taskList');
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; color: #888;">No tasks scheduled</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px;
            background: white;
            border-radius: 5px;
            margin-bottom: 5px;
            font-size: 12px;
        `;
        
        taskItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTaskComplete(${task.id})">
                <span style="${task.completed ? 'text-decoration: line-through; color: #888;' : ''}">
                    ${task.name}
                </span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <small>${task.date}</small>
                <button onclick="deleteTask(${task.id})" style="border: none; background: none; cursor: pointer; color: red;">×</button>
            </div>
        `;
        
        container.appendChild(taskItem);
    });
}

function saveTasks() {
    localStorage.setItem('lekhak_tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('lekhak_tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// EXPORT & IMPORT WALA SYSTEM 

function exportNotes() {
    const data = {
        notes: notes,
        tasks: tasks,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `lekhak_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📤 Notes exported successfully!');
}

function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.notes) {
                notes = data.notes;
                localStorage.setItem('lekhak_notes', JSON.stringify(notes));
            }
            if (data.tasks) {
                tasks = data.tasks;
                localStorage.setItem('lekhak_tasks', JSON.stringify(tasks));
            }
            
            loadNotesFromStorage();
            renderNotesList();
            renderTabs();
            renderTasks();
            
            showToast('📥 Notes imported successfully!');
        } catch (error) {
            showToast('⚠️ Error importing file');
        }
    };
    reader.readAsText(file);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// STORAGE JSON  KI HELP SE DIRECT FILE LOCAL DISK ME SAVE HO JYEGI 


function loadNotesFromStorage() {
    const saved = localStorage.getItem('lekhak_notes');
    if (saved) {
        notes = JSON.parse(saved);
    }
    loadTasks();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////// WORD COUNT ACTUALLY WORD TYPED KITNE HAI 
 
function updateWordCount() {
    const content = document.getElementById('editor').innerText || '';
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const charCount = content.length;
    
    document.getElementById('wordCount').textContent = `${words.length} words`;
    document.getElementById('charCount').textContent = `${charCount} characters`;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TOAST NOTIFICATIONS ALERT KE LIYEAA 


function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////// KEYBOARD SHORTCUTS funcationallity problem hai thodi 



/*document.addEventListener('keydown', (e) => {
    // Ctrl + N = New Note
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewNote();
    }
    
    // Ctrl + S = Save Note
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveNote();
        showToast('💾 Note saved!');
    }
    
    // Ctrl + A = Toggle AI
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        toggleAIAssistant();
    }
});*/

window.addEventListener('beforeunload', () => {
    saveNote();
    saveTasks();
});

console.log('✅ Lekhak - The Smart Notepad loaded successfully!');