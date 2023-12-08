// note.js
window.notes = [];

document.addEventListener("DOMContentLoaded", () => {

    const startButton = document.getElementById('start');
    if (startButton) {
        startButton.addEventListener('click', startdiscussion);
    }


    const notesContainer = document.getElementById("notesContainer");
    const gazeTimeDisplayButton = document.getElementById("gazeTimeDisplay");
    let isGazeTimeDisplayOn = false;
    let isGazeTimeDisplayOn1 = false;
    let isGazeTimeDisplayOn2 = false;
    let noteIdCounter = 1;

    const UPDATE_INTERVAL = 100;

    function updateDataText(note, newText) {
        const textArea = note.querySelector('textarea');
        textArea.value = newText;
    }

    function createStickyNote() {
        const note = document.createElement("div");
        note.classList.add("note");
        note.style.left = "100px";
        note.style.top = "100px";

        const textArea = document.createElement("textarea");
        textArea.setAttribute("rows", "3");
        textArea.setAttribute("cols", "30");
        textArea.placeholder = "テキストを入力してください...";

        textArea.addEventListener("input", () => {
            updateDataText(note, textArea.value);
        });

        note.appendChild(textArea);

        note.setAttribute('data-note-id', noteIdCounter++);
        note.setAttribute('data-gaze-time', '0');
        note.setAttribute('data-left', '100');
        note.setAttribute('data-top', '100');

        let isDragging = false;
        let prevX, prevY, prevLeft, prevTop;

        note.addEventListener("mousedown", (e) => {
            const { offsetX, offsetY } = getOffset(e, note);

            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
            prevLeft = note.style.left;
            prevTop = note.style.top;

            document.onmousemove = (e) => {
                const dx = e.clientX - prevX;
                const dy = e.clientY - prevY;
                note.style.left = parseInt(prevLeft) + dx + "px";
                note.style.top = parseInt(prevTop) + dy + "px";

                note.setAttribute('data-left', note.style.left);
                note.setAttribute('data-top', note.style.top);
            };
        });

        document.onmouseup = () => {
            isDragging = false;
            document.onmousemove = null;
        };

        return note;
    }

    function getOffset(e, element) {
        const rect = element.getBoundingClientRect();
        return {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };
    }

    function updateGazeTime() {
        const gazeDot = document.getElementById('webgazerGazeDot');

        if (!gazeDot) {
            return;
        }

        const gazeDotRect = gazeDot.getBoundingClientRect();
        const gazeDotX = gazeDotRect.left + gazeDotRect.width / 2;
        const gazeDotY = gazeDotRect.top + gazeDotRect.height / 2;

        const allNotes = document.querySelectorAll('.note');

        allNotes.forEach((note) => {
            const noteRect = note.getBoundingClientRect();
            const noteX = noteRect.left + noteRect.width / 2;
            const noteY = noteRect.top + noteRect.height / 2;

            const dx = Math.abs(noteX - gazeDotX) - noteRect.width / 2;
            const dy = Math.abs(noteY - gazeDotY) - noteRect.height / 2;

            const distance = Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);

            if (distance <= 35) {
                const gazeTime = parseInt(note.getAttribute('data-gaze-time'));
                note.setAttribute('data-gaze-time', gazeTime + 1);
            }
        });

        changeNoteColor();
    }

    function changeNoteColor() {
        const allNotes = document.querySelectorAll('.note');

        let totalGazeTime = 0;
        let noteCount = 0;

        allNotes.forEach((note) => {
            const gazeTime = parseInt(note.getAttribute('data-gaze-time'));
            totalGazeTime += gazeTime;
            noteCount += 1;
        });

        const averageGazeTime = noteCount > 0 ? totalGazeTime / noteCount : 0;

        allNotes.forEach((note) => {
            const gazeTime = parseInt(note.getAttribute('data-gaze-time'));

            if (!isGazeTimeDisplayOn) {
                const yellowIntensity = 30;
                note.style.transition = 'background-color 0.5s';
                note.style.backgroundColor = `rgba(255, 255, 0, ${yellowIntensity}%)`;
            } else {
                const colorIntensity = (gazeTime / averageGazeTime) * 50;
                const maxColorIntensity = 100;
                const finalColorIntensity = Math.min(colorIntensity, maxColorIntensity);
                note.style.backgroundColor = `rgba(255, 0, 0, ${finalColorIntensity}%)`;
            }
        });

        const DisplayButton = document.getElementById('gazeTimeDisplay');
        const gazeTimeDisplayButton = document.getElementById("gazeTimeDisplay");
        gazeTimeDisplayButton.classList.toggle('on', isGazeTimeDisplayOn);
        DisplayButton.classList.toggle('off', !isGazeTimeDisplayOn);
    }

    const gazeTimeDisplayButton1 = document.getElementById("gazeTimeDisplay1");
    gazeTimeDisplayButton1.addEventListener('click', () => {
        isGazeTimeDisplayOn1 = !isGazeTimeDisplayOn1; // ON/OFFを切り替え
        changeNoteColor1(); // 色を変更する関数を呼び出す
        gazeTimeDisplayButton1.classList.toggle('on', isGazeTimeDisplayOn1);
        gazeTimeDisplayButton1.classList.toggle('off', !isGazeTimeDisplayOn1);ïï
    });

    const gazeTimeDisplayButton2 = document.getElementById("gazeTimeDisplay2");
    gazeTimeDisplayButton2.addEventListener('click', () => {
        isGazeTimeDisplayOn2 = !isGazeTimeDisplayOn2; // ON/OFFを切り替え
        changeNoteColor2(); // 色を変更する関数を呼び出す
        gazeTimeDisplayButton2.classList.toggle('on', isGazeTimeDisplayOn2);
        gazeTimeDisplayButton2.classList.toggle('off', !isGazeTimeDisplayOn2);
    });

    function changeNoteColor1() {
        const gazeTimeArea = document.getElementById('gazetime1-area');
        const gazeTimeElements = gazeTimeArea.querySelectorAll('.gaze-time-element');

        if (!isGazeTimeDisplayOn1) {
            // isGazeTimeDisplayOn1 が false の場合、全ての要素を黄色に変更
            gazeTimeElements.forEach((element) => {
                gazeTimeArea.style.display = 'none';

                const yellowIntensity = 30;
                element.style.transition = 'background-color 0.5s';
                element.style.backgroundColor = `rgba(255, 255, 0, ${yellowIntensity}%)`;
            });
        } else {
            gazeTimeArea.style.display = 'block';

            // isGazeTimeDisplayOn1 が true の場合、Gaze Time に基づいて色を変更
            let totalGazeTime = 0;
            let noteCount = 0;

            gazeTimeElements.forEach((element) => {
                const gazeTime = parseInt(element.textContent.match(/Gaze Time: (\d+)/)[1]);
                totalGazeTime += gazeTime;
                noteCount++;
            });

            const averageGazeTime1 = noteCount > 0 ? totalGazeTime / noteCount : 0;

            gazeTimeElements.forEach((element) => {
                const gazeTime = parseInt(element.textContent.match(/Gaze Time: (\d+)/)[1]);

                const colorIntensity = (gazeTime / averageGazeTime1) * 50;
                const maxColorIntensity = 100;
                const finalColorIntensity = Math.min(colorIntensity, maxColorIntensity);

                // transition を一時的に無効にして色を変更
                element.style.transition = 'none';
                element.style.backgroundColor = `rgba(255, 0, 0, ${finalColorIntensity}%)`;

                // 色が変更された後、再び transition を有効にする
                setTimeout(() => {
                    element.style.transition = 'background-color 0.5s';
                });
            });
        }
    }


    function changeNoteColor2() {
        const gazeTimeArea = document.getElementById('gazetime2-area');
        const gazeTimeElements = gazeTimeArea.querySelectorAll('.gaze-time-element');
    
        if (!isGazeTimeDisplayOn2) {
            // isGazeTimeDisplayOn2 が false の場合、全ての要素を黄色に変更
            gazeTimeElements.forEach((element) => {
                gazeTimeArea.style.display = 'none';

                const yellowIntensity = 30;
                element.style.transition = 'background-color 0.5s';
                element.style.backgroundColor = `rgba(255, 255, 0, ${yellowIntensity}%)`;
            });
        } else {
            gazeTimeArea.style.display = 'block';

            // isGazeTimeDisplayOn2 が true の場合、Gaze Time に基づいて色を変更
            let totalGazeTime = 0;
            let noteCount = 0;
    
            gazeTimeElements.forEach((element) => {
                const gazeTime = parseInt(element.textContent.match(/Gaze Time: (\d+)/)[1]);
                totalGazeTime += gazeTime;
                noteCount++;
            });
    
            const averageGazeTime2 = noteCount > 0 ? totalGazeTime / noteCount : 0;
    
            gazeTimeElements.forEach((element) => {
                const gazeTime = parseInt(element.textContent.match(/Gaze Time: (\d+)/)[1]);
    
                const colorIntensity = (gazeTime / averageGazeTime2) * 50;
                const maxColorIntensity = 100;
                const finalColorIntensity = Math.min(colorIntensity, maxColorIntensity);
    
                // 色が一瞬だけ変わらないように transition を外す
                element.style.transition = 'background-color 0.5s';  // transition を再設定
                element.style.backgroundColor = `rgba(255, 0, 0, ${finalColorIntensity}%)`;
            });
        }
    }

    gazeTimeDisplayButton.addEventListener('click', () => {
        isGazeTimeDisplayOn = !isGazeTimeDisplayOn;
        changeNoteColor();
    });

    function startdiscussion() {
        // 付箋のgaze-timeを0に戻す
        const allNotes = document.querySelectorAll('.note');
        allNotes.forEach((note) => {
            note.setAttribute('data-gaze-time', '0');
        });
    
        // webgazerGazeDotの透明度を変更する
        const gazeDot = document.getElementById('webgazerGazeDot');
        if (gazeDot) {
            gazeDot.style.opacity = '0';
        }
    
        // startButtonを非表示にする
        const startButton = document.getElementById('start');
        if (startButton) {
            startButton.style.display = 'none';
        }
    }
    setInterval(updateGazeTime, UPDATE_INTERVAL);
    setInterval(changeNoteColor, UPDATE_INTERVAL);

    const columns = 3;
    const rows = 2;
    const noteWidth = 200;
    const noteHeight = 200;
    const gapX = 20;
    const gapY = 20;

    const initialTexts = ["あ", "い", "う", "え", "お", "か"];

    for (let i = 0; i < 6; i++) {
        const newNote = createStickyNote();
        const col = i % columns;
        const row = Math.floor(i / columns);
        const left = -150 + col * (noteWidth + gapX);
        const top = 200 + row * (noteHeight + gapY);

        newNote.style.left = `${left}px`;
        newNote.style.top = `${top}px`;

        updateDataText(newNote, initialTexts[i]);
        newNote.setAttribute('data-text', initialTexts[i]);

        notes.push(newNote);
        notesContainer.appendChild(newNote);
    }
});
