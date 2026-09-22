import {Parser} from "@cooklang/cooklang";

const editor = document.querySelector('.editor textarea') as HTMLTextAreaElement;
const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
const measurement = document.createElement('div');

measurement.setAttribute('aria-hidden', 'true');
Object.assign(measurement.style, {
    position: 'absolute',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    pointerEvents: 'none'
});
document.body.appendChild(measurement);

function updateLineNumbers() {
    const styles = getComputedStyle(editor);
    const lineHeight = parseFloat(styles.lineHeight);
    const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const contentWidth = editor.clientWidth - horizontalPadding;

    Object.assign(measurement.style, {
        width: `${contentWidth}px`,
        font: styles.font,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        tabSize: styles.tabSize
    });

    const visualLineNumbers: number[] = [];
    editor.value.split('\n').forEach((line, index) => {
        measurement.textContent = line || '\u200b';
        const wrappedLines = Math.max(
            1,
            Math.ceil(measurement.getBoundingClientRect().height / lineHeight)
        );

        visualLineNumbers.push(...Array(wrappedLines).fill(index + 1));
    });

    lineNumbers.textContent = visualLineNumbers.join('\n');
}

editor.addEventListener('input', () => {
    updateLineNumbers();
});
new ResizeObserver(updateLineNumbers).observe(editor);

updateLineNumbers();

/* =========================================
    UPLOAD
========================================== */
const uploadButton = document.querySelector('#uploadButton') as HTMLButtonElement;
const fileInput = document.querySelector('#fileInput') as HTMLInputElement;

function handleFileUpload() {
    const file = fileInput.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload =
        function(event) {
            editor.value = event.target?.result as string;
            updateLineNumbers();
            handleParseCooklang();
        };

    // reader.onerror =
    //     function() {
    //         //clearErrors();
    //         addError({
    //             message:
    //                 "Could not read the selected file."
    //         });
    //     };

    reader.readAsText(file);
}

uploadButton?.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", handleFileUpload);

/* =========================================
    DOWNLOAD
========================================== */
const downloadButton = document.querySelector('#downloadButton') as HTMLButtonElement;

function handleFileDownload() {
    const content = editor.value;
    const blob = new Blob([content], { type: 'cook/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = fileUrl;

    const parser = new Parser();
    const title = parser.parse(content, null).recipe.raw_metadata.map.title || 'recipe';
    a.download = `${title}.cook`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
}

downloadButton.addEventListener("click", handleFileDownload);

/* =========================================
    PARSE COOKLANG
========================================== */
const outputElement = document.querySelector('#output') as HTMLElement;
const errorsElement = document.querySelector('#errors') as HTMLElement;
const errorsDetails = document.getElementById("errors-details") as HTMLDetailsElement;

function handleParseCooklang() {
    const content = editor.value;
    window.sessionStorage.setItem("recipe", content);
    try {
        const parser = new Parser();
        const {value, error} = parser.parse_render(
            content,
            null
        );
        outputElement.innerHTML = value;
        errorsElement.innerHTML = error;

    } catch (error) {
        // outputElement.textContent = `Error parsing Cooklang: ${error.message}`;
    }
    errorsDetails.open = errorsElement.childElementCount !== 0;
}

editor.addEventListener('input', () => {
    handleParseCooklang();
});

const placeholder = `---
title: 
description:
time required: 
servings: 
course: 
source: 
---`

async function run() {
    const recipe = window.sessionStorage.getItem("recipe") ?? placeholder;
    editor.value = recipe;
    updateLineNumbers();
    handleParseCooklang();
}

run();
