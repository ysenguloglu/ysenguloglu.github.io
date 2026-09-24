const REPO_OWNER = "ysenguloglu";
const REPO_NAME = "ysenguloglu.github.io";
const POEMS_PATH = "poems";

const poemList = document.getElementById("poem-list");
const poemCount = document.getElementById("poem-count");

const poemSection = document.getElementById("siirler");
const poemView = document.getElementById("poem-view");

const poemTitle = document.getElementById("poem-title");
const poemDate = document.getElementById("poem-date");
const poemContent = document.getElementById("poem-content");

const backButton = document.getElementById("back-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

let poems = [];
let currentPoem = 0;


/* --------------------------------
   MARKDOWN OKUMA
-------------------------------- */

function parseMarkdown(markdown) {

    const frontMatterMatch = markdown.match(
        /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/
    );

    let metadata = {};
    let content = markdown;

    if (frontMatterMatch) {

        const frontMatter = frontMatterMatch[1];
        content = frontMatterMatch[2].trim();

        frontMatter.split("\n").forEach(line => {

            const separator = line.indexOf(":");

            if (separator === -1) return;

            const key = line
                .substring(0, separator)
                .trim();

            const value = line
                .substring(separator + 1)
                .trim();

            metadata[key] = value;

        });
    }

    return {
        title: metadata.title || "Başlıksız",
        date: metadata.date || "",
        content: content
    };
}


/* --------------------------------
   GITHUB'DAN ŞİİRLERİ GETİR
-------------------------------- */

async function loadPoems() {

    try {

        const apiUrl =
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POEMS_PATH}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Şiir klasörü okunamadı.");
        }

        const files = await response.json();

        const markdownFiles = files
            .filter(file =>
                file.type === "file" &&
                file.name.toLowerCase().endsWith(".md")
            );


        const loadedPoems = await Promise.all(

            markdownFiles.map(async file => {

                const poemResponse = await fetch(file.download_url);

                if (!poemResponse.ok) {
                    throw new Error(`${file.name} okunamadı.`);
                }

                const markdown = await poemResponse.text();

                const poem = parseMarkdown(markdown);

                return {
                    ...poem,
                    filename: file.name
                };

            })

        );


        /* Tarihe göre yeni → eski */

        loadedPoems.sort((a, b) => {

            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return dateB - dateA;

        });


        poems = loadedPoems;

        renderPoems();

    } catch (error) {

        console.error(error);

        poemList.innerHTML = `
            <p style="color: #858078;">
                Şiirler yüklenirken bir hata oluştu.
            </p>
        `;

    }

}


/* --------------------------------
   ŞİİRLERİ LİSTELE
-------------------------------- */

function renderPoems() {

    poemList.innerHTML = "";

    poemCount.textContent = poems.length;


    if (poems.length === 0) {

        poemList.innerHTML = `
            <p style="color: #858078;">
                Henüz şiir yok.
            </p>
        `;

        return;
    }


    poems.forEach((poem, index) => {

        const item = document.createElement("div");

        item.className = "poem-item";

        item.innerHTML = `
            <h3>${escapeHtml(poem.title)}</h3>
            <span>${escapeHtml(poem.date)}</span>
        `;

        item.addEventListener("click", () => {
            openPoem(index);
        });

        poemList.appendChild(item);

    });

}


/* --------------------------------
   ŞİİRİ AÇ
-------------------------------- */

function openPoem(index) {

    currentPoem = index;

    const poem = poems[index];

    poemTitle.textContent = poem.title;
    poemDate.textContent = poem.date;
    poemContent.textContent = poem.content;


    previousButton.style.visibility =
        index > 0 ? "visible" : "hidden";

    nextButton.style.visibility =
        index < poems.length - 1 ? "visible" : "hidden";


    poemSection.classList.add("hidden");
    poemView.classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* --------------------------------
   GERİ DÖN
-------------------------------- */

backButton.addEventListener("click", () => {

    poemView.classList.add("hidden");
    poemSection.classList.remove("hidden");

    window.scrollTo({
        top: poemSection.offsetTop,
        behavior: "smooth"
    });

});


/* --------------------------------
   ÖNCEKİ
-------------------------------- */

previousButton.addEventListener("click", () => {

    if (currentPoem > 0) {
        openPoem(currentPoem - 1);
    }

});


/* --------------------------------
   SONRAKİ
-------------------------------- */

nextButton.addEventListener("click", () => {

    if (currentPoem < poems.length - 1) {
        openPoem(currentPoem + 1);
    }

});


/* --------------------------------
   HTML GÜVENLİĞİ
-------------------------------- */

function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* --------------------------------
   BAŞLAT
-------------------------------- */

loadPoems();
