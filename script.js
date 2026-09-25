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


/* ========================================
   MARKDOWN OKUMA
======================================== */

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
        date: metadata.poem_date || "",
        content: content
    };

}


/* ========================================
   SLUG OLUŞTUR
======================================== */

function createSlug(filename) {

    return filename
        .replace(/\.md$/i, "")
        .toLowerCase()
        .trim();

}


/* ========================================
   GITHUB'DAN ŞİİRLERİ GETİR
======================================== */

async function loadPoems() {

    try {

        const apiUrl =
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POEMS_PATH}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Şiir klasörü okunamadı.");
        }

        const files = await response.json();


        const markdownFiles = files.filter(file =>
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

                    filename: file.name,

                    slug: createSlug(file.name)
                };

            })

        );


        /* ========================================
           TARİHE GÖRE YENİ → ESKİ
        ======================================== */

        loadedPoems.sort((a, b) => {

            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return dateB - dateA;

        });


        poems = loadedPoems;


        /* ŞİİRLERİ LİSTELE */

        renderPoems();


        /* ========================================
           URL'DE ŞİİR VAR MI?
           
           Örnek:
           ?poem=bir-cift-goz
        ======================================== */

        const urlParams =
            new URLSearchParams(window.location.search);

        const poemSlug =
            urlParams.get("poem");


        if (poemSlug) {

            const poemIndex = poems.findIndex(
                poem => poem.slug === poemSlug
            );


            if (poemIndex !== -1) {

                openPoem(poemIndex, false);

            }

        }


    } catch (error) {

        console.error(error);

        poemList.innerHTML = `
            <p style="color: #858078;">
                Şiirler yüklenirken bir hata oluştu.
            </p>
        `;

    }

}


/* ========================================
   ŞİİRLERİ LİSTELE
======================================== */

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

        const item =
            document.createElement("div");

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


/* ========================================
   ŞİİRİ AÇ
======================================== */

function openPoem(index, updateUrl = true) {

    if (!poems[index]) return;


    currentPoem = index;

    const poem = poems[index];


    /* ŞİİR BİLGİLERİ */

    poemTitle.textContent = poem.title;

    poemDate.textContent = poem.date;

    poemContent.textContent = poem.content;


    /* ========================================
       ÖNCEKİ / SONRAKİ BUTONLAR
    ======================================== */

    previousButton.style.visibility =
        index > 0 ? "visible" : "hidden";

    nextButton.style.visibility =
        index < poems.length - 1
            ? "visible"
            : "hidden";


    /* ========================================
       GÖRÜNÜMÜ DEĞİŞTİR
    ======================================== */

    poemSection.classList.add("hidden");

    poemView.classList.remove("hidden");


    /* ========================================
       URL'Yİ GÜNCELLE
       
       Örnek:
       https://ysenguloglu.github.io/?poem=bir-cift-goz
    ======================================== */

    if (updateUrl) {

        const url =
            new URL(window.location.href);

        url.searchParams.set(
            "poem",
            poem.slug
        );


        window.history.pushState(
            {
                poem: poem.slug
            },
            "",
            url
        );

    }


    /* ========================================
       SAYFANIN BAŞINA GİT
    ======================================== */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ========================================
   ANA SAYFAYA DÖN
======================================== */

backButton.addEventListener("click", () => {

    poemView.classList.add("hidden");

    poemSection.classList.remove("hidden");


    /* URL'DEKİ ?poem=... KISMINI SİL */

    const url =
        new URL(window.location.href);

    url.searchParams.delete("poem");


    window.history.pushState(
        {},
        "",
        url
    );


    window.scrollTo({
        top: poemSection.offsetTop,
        behavior: "smooth"
    });

});


/* ========================================
   ÖNCEKİ ŞİİR
======================================== */

previousButton.addEventListener("click", () => {

    if (currentPoem > 0) {

        openPoem(currentPoem - 1);

    }

});


/* ========================================
   SONRAKİ ŞİİR
======================================== */

nextButton.addEventListener("click", () => {

    if (currentPoem < poems.length - 1) {

        openPoem(currentPoem + 1);

    }

});


/* ========================================
   TARAYICI GERİ / İLERİ BUTONLARI
======================================== */

window.addEventListener("popstate", () => {

    const urlParams =
        new URLSearchParams(window.location.search);

    const poemSlug =
        urlParams.get("poem");


    /* URL'DE ŞİİR YOKSA ANA SAYFAYA DÖN */

    if (!poemSlug) {

        poemView.classList.add("hidden");

        poemSection.classList.remove("hidden");

        return;

    }


    /* ŞİİRİ BUL */

    const poemIndex =
        poems.findIndex(
            poem => poem.slug === poemSlug
        );


    /* BULUNDUYSA AÇ */

    if (poemIndex !== -1) {

        openPoem(poemIndex, false);

    }

});


/* ========================================
   HTML GÜVENLİĞİ
======================================== */

function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ========================================
   BAŞLAT
======================================== */

loadPoems();
