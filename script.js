```javascript
const poems = [

    {
        title: "Bir Gece Daha",
        date: "24 Eylül 2026",
        content: `Gece yine kendine döndü
ben biraz eksik kaldım.

Bazı geceler insan
kendisine fazla yaklaşır.

Sabah oldu,
ama bazı şeyler
aydınlanmadı.`
    },


    {
        title: "Unutmak",
        date: "18 Eylül 2026",
        content: `Unutmak sandığım kadar
sessiz değilmiş.

İnsan bazı şeyleri
hatırlamamak için
kendinden vazgeçiyormuş.`
    },


    {
        title: "Bir Şeyler Söyle",
        date: "12 Eylül 2026",
        content: `Bir şeyler söyle.

Sessizlik bazen
insanın söyleyebileceği
en uzun cümle.`
    }

];


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

let currentPoem = 0;


/* ŞİİR SAYISI */

poemCount.textContent = poems.length;


/* ŞİİRLERİ LİSTELE */

function renderPoems() {

    poemList.innerHTML = "";

    poems.forEach((poem, index) => {

        const item = document.createElement("div");

        item.className = "poem-item";

        item.innerHTML = `
            <h3>${poem.title}</h3>
            <span>${poem.date}</span>
        `;

        item.addEventListener("click", () => {
            openPoem(index);
        });

        poemList.appendChild(item);

    });

}


/* ŞİİRİ AÇ */

function openPoem(index) {

    currentPoem = index;

    const poem = poems[index];

    poemTitle.textContent = poem.title;
    poemDate.textContent = poem.date;
    poemContent.textContent = poem.content;

    poemSection.classList.add("hidden");
    poemView.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* GERİ DÖN */

backButton.addEventListener("click", () => {

    poemView.classList.add("hidden");
    poemSection.classList.remove("hidden");

    window.scrollTo({
        top: poemSection.offsetTop,
        behavior: "smooth"
    });

});


/* ÖNCEKİ */

previousButton.addEventListener("click", () => {

    if (currentPoem > 0) {
        openPoem(currentPoem - 1);
    }

});


/* SONRAKİ */

nextButton.addEventListener("click", () => {

    if (currentPoem < poems.length - 1) {
        openPoem(currentPoem + 1);
    }

});


/* BAŞLAT */

renderPoems();
```
