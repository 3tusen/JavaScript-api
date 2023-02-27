"use strict"; //Strict mode

/*Variabler*/
const navEl = document.getElementById("mainnavlist");
const counterEl = document.getElementById("numrows");
const infoEl = document.getElementById("info");
const dropdownEl = document.getElementById("playchannel");
const playerbuttonEl = document.getElementById("playbutton");
const playerEl = document.getElementById("radioplayer");

/*URL-variabler*/
let channelUrl = "http://api.sr.se/api/v2/channels/?format=json&indent=true&size=50";

/*Initiering av sidan*/
window.addEventListener("load", function () {
    getChannels();//Anropa fetch vid uppstart
    counterEl.value = 3;
})

/*Funktion för att skapa alternativ till kanaler att spela i musikspelaren*/
function createOption(channel) {
    //Skapa option element
    let option = document.createElement("option");
    option.setAttribute("id", channel.id); //Sätt id till medskickade kanalens id
    option.textContent = channel.name; //Sätt innerhtml till kanalens namn
    dropdownEl.appendChild(option); //Fäst till dropdown elementet
}

//Fetch funktion för nav elementet, visa dom olika kanalerna
function getChannels() {
    fetch(channelUrl) //Hämta från url
        .then((res) => res.json()) //Sätt responsen till json
        .then((data) => {
            dropdownEl.textContent = "";  //Rensa Dropdown
            infoEl.textContent = ""; //Rensa info div
            for (let i = 0; i < counterEl.value; i++) {
                createChannel(data.channels[i]);
                createOption(data.channels[i]);
            }
        }
        )
}

//Funktion för att skapa kanaler
function createChannel(channel) {
    //Addera list element med anchor från dom medskickade kanalerna
    let li = document.createElement("li");
    let liAnchor = document.createElement("a");
    //Sätt attribut till anchor elementet
    liAnchor.setAttribute("id", channel.id);
    liAnchor.setAttribute("title", channel.tagline);
    liAnchor.innerText = channel.name;
    //Bakgrundfärg
    let bgColor = channel.color.match(/\w+/g); //Ta fram bakgrundfärg utan dubbelfnuttar
    li.style.backgroundColor = `#${bgColor}`;
    li.style.color = "black";

    //Fäst liAnchor till li
    li.appendChild(liAnchor);
    //Addera eventlyssnare
    li.addEventListener("click", getScheduledEpisodes);
    //Skriv ut till dom
    navEl.appendChild(li);
}

//Funktion för att få rätt id vid klick
function channelId(id) {
    return `http://api.sr.se/api/v2/scheduledepisodes?channelid=${id}&size=100&format=json`
}

//Funktion för att skriva ut tablå till info div
function getScheduledEpisodes(event) {
    event.preventDefault(); //Stoppa länkens funktion
    infoEl.textContent = ""; //Rensa info div

    //Hämta data från SR
    fetch(channelId(event.target.id)) //Ta fram program från elementets id
        .then((res) => res.json()) //Sätt responsen till JSON data
        .then((data) => {
            for (let i = 0; i < data.schedule.length; i++) {
                createSchedule(data.schedule[i]);
            }
        })
}

function createSchedule(schedule) {
    //Använd regex för att få ut siffrorna från endtimeutc och sätt till ett datumobjekt
    let time = new Date(schedule.endtimeutc.match(/(\d+)/)[0] - 0);
    let now = new Date();
//Skriv ut program om dom ej redan varit
    if (time > now) {
        let article = document.createElement("article");
        let title = document.createElement("h3");
        let subTitle = document.createElement("h4");
        let runTime = document.createElement("h5");
        let description = document.createElement("p");
        //Sätt attribut
        title.textContent = schedule.title;
        subTitle.textContent = schedule.subtitle;
        runTime.textContent = formatTime(schedule.starttimeutc, time);
        description.textContent = schedule.description;
        
        //Skapa bild
        let img = document.createElement("img");
        img.setAttribute("src", schedule.imageurl);
        img.setAttribute("alt", 'Programbild');
        img.setAttribute("width", '30%');
        img.setAttribute("height", '30%');
        
        

        //Fäst vid article
        if (schedule.imageurl) {
        article.append(title, subTitle, runTime, description, img);
        } else {
            article.append(title,subTitle,runTime,description);
        }
        //Skriv ut till DOM
        infoEl.appendChild(article);
        
    } 
}
//Funktion för att skriva ut tiden i rätt format i info
function formatTime (start, end) {
    //formattera starttimeutc och endtimeutc i detta format
    let utcTimeFormat = new Intl.DateTimeFormat("sv", {
        hour: "numeric", minute: "numeric"
    });
//Formattera tiderna, sluttiden är redan Regexpad i createSchedule
    start = utcTimeFormat.format(new Date(start.match(/(\d+)/)[0] - 0));
    end = utcTimeFormat.format(end);

    return `${start} - ${end}` 
}

//Styr numRow
counterEl.addEventListener("change", function() {
    infoEl.textContent = "";
    navEl.textContent = "";
    getChannels(counterEl.value);
})

//Börja koda spelare
playerbuttonEl.addEventListener("click", playChannel);
//Function för att få rätt id
function play(id) {
    return `https://sverigesradio.se/topsy/direkt/${id}.mp3`
}

function playChannel() {
    //Skapa element och sätt option till valt program
    let option = dropdownEl[dropdownEl.selectedIndex];
    let audio = document.createElement("audio");
    let source = document.createElement("source");
    let span = document.createElement("span");
    //Sätt attribut
    audio.setAttribute("controls", "");
    audio.setAttribute("autoplay", "true");
    audio.setAttribute("preload", "auto");
    source.setAttribute("type", 'audio/mpeg');
    source.setAttribute("src", play(option.id));
    span.textContent = option.value;
    //Fäst vid varandra
    audio.appendChild(source);
    playerEl.append(audio, span);
}