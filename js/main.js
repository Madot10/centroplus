const dbId = '10tU4O-yzGQL6SP8c00YtooDCghNTEfieLfy98jjNcfg';
const imgDefault = '/media/default.png';
const urlApp = 'cedeconomia.github.io/';

const timeLimit = 2 * 60 * 1000; //2min
const timeNotiLimit = 2 * 60 * 1000; //2min
const timeRegLimit = 1 * 60 * 60 * 1000; //1h

//checkAccess();


window.onload = () => {
    console.time("loadView");
    //inithashChanger();
    loadview()
}

window.onscroll = function (e) {
    if (actualView == "eventos") {
        let _windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            _scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

        if ((_windowHeight + _scrollPos) >= document.body.offsetHeight) {
            //console.log("At the bottom of CodingRepo.com page!");
            loadNotificacion("more");
        }
    }

};

function loadview() {
    console.time("checkAccess");
    checkAccess().then((rest) => {
        console.timeEnd("checkAccess");
        if (rest) {
            //Access yes
            actualView = location.hash.replace("#/", "");
            setViewTemplate(actualView).then(resp => {
                console.log("Cargando view: actualView:  ", actualView);

                console.timeEnd("loadView");
                switch (actualView) {
                    case 'profesores':
                        loadProfesores();
                        break;

                    case 'archivos':
                        loadArchivos();
                        break;

                    case 'salones':
                        loadSalones();
                        break;

                    case 'eventos':
                        docsNotiReq = null;
                        notiStatus = true;
                        loadNotificacion();
                        break;

                    case 'configuracion':
                        setVisibility(false);
                        setLoader(true);

                        setFormTopic();
                        break;

                    case '':
                        document.getElementById("mainbtn").classList.add("active-opt");
                        if (rest == "adminMode") {
                            document.getElementById("card-admin").style.display = "block";
                        }

                        if (rest == 'first') {
                            console.log("Menu 1er vez");
                            SaveRegToDB();
                            $('#notiModal').modal('show');
                        }
                        break;

                    default:
                        break;
                }
            })


        }
    });
}


function setLoader(stato) {
    if (document.getElementById('loader') != null && stato) {
        //mostrar
        document.getElementById('loader').style.display = 'inline-block';
    } else if (document.getElementById('loader') != null) {
        //ocultar
        document.getElementById('loader').style.display = 'none';
    }
}

function setVisibility(turnto) {
    let eMport = document.getElementsByTagName("m-import");
    if (turnto) {
        //Volvemos visible
        document.getElementsByClassName('container')[0].style.visibility = 'visible';
        for(let i = 0; i < eMport.length; i++){
             eMport[i].style.visibility = 'visible';
         }
        //document.body
    } else {
        //Hidden
        //document.body.style.visibility = 'hidden';
        document.getElementsByClassName('container')[0].style.visibility = 'hidden';
        for(let i = 0; i < eMport.length; i++){
             eMport[i].style.visibility = 'hidden';
         }
    }
}


function setWarnEmpty(state) {
    let warn = document.getElementById("empty-warn");
    //console.log("setWarnEmpty ",warn);
    if (state && warn) {
        warn.style.display = "block";
    } else if (warn) {
        warn.style.display = "none";
    }
}

function togglerSpiner(turnto){
    if(turnto){
        document.getElementById('check-save').style.display = "none";
        document.getElementById('spiner-save').style.display = "inline-block";
    }else{
        document.getElementById('check-save').style.display = "inline-block";
        document.getElementById('spiner-save').style.display = "none";
    }
}

//#region SW
// Check compatibility for the browser we're running this in
if ("serviceWorker" in navigator) {
    if (navigator.serviceWorker.controller) {
        console.log("[PWA Builder] active service worker found, no need to register");
    } else if(location.pathname == "/"){
        // Register the service worker
        navigator.serviceWorker
            .register("/sw-centro.js", {
                scope: "./"
            })
            .then(function (reg) {
                console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
            });
    }
}

//#endregion

//#region NAV
function descheckNavOption() {
    let navs = document.getElementsByClassName("main-nav");
    for (let i = 0; i < navs.length; i++) {
        if (!navs[i].classList.contains("opt-nav-menu") || !(actualView == "")) {
            navs[i].classList.remove("active-opt");
        }

    }
}

function hideAllNav() {
    descheckNavOption();
    let navs = document.getElementsByClassName("nav-op");
    for (let i = 0; i < navs.length; i++) {
        if (!navs[i].classList.contains("hide-elem"))
            navs[i].classList.add("hide-elem");
    }
}

function openSubMenu(name, ebutton) {
    //hideAllNav();
    descheckNavOption();
    let element = document.getElementById(name);

    if (element.classList.contains("hide-elem")) {
        //Mostramos
        hideAllNav();
        ebutton.classList.add("active-opt");
        element.classList.remove("hide-elem");
        element.classList.remove("oculto");
    } else {
        //Ocultamos
        //hideAllNav();
        element.classList.add("hide-elem");
    }


}
//#endregion NAV

//Devuelve JSON de la hoja pedida
function getDataSheetJSON(name) {
    let pg;

    //HORRIBLE -> ARREGLAR
    if (name == "profesores") {
        pg = 1;
    } else if (name == "salones") {
        pg = 2;
    } else if (name == "archivos") {
        pg = 3;
    }

    let url = "https://spreadsheets.google.com/feeds/list/" + dbId + "/" + pg + "/public/full?alt=json";

    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        let result;

        request.onload = function () {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                result = JSON.parse(request.responseText);
                //console.log(result);
                resolve(result);
            } else {
                reject(Error('Ha ocurrido un error \n Error code:' + request.statusText));
            }
        };

        request.onerror = function () {
            reject(Error('Error! \n No se ha podido conectar'));
        };
        request.open("GET", url, true);
        request.send();
    })
}

function hideLoadingCard() {
    let cards = document.getElementsByClassName("loading");
    for (let c in cards) {
        //console.log("C:", c, cards[c]);

        if (!isNaN(c)) {
            cards[c].classList.add('hide');
        }
    }
}

//#region PROFESORES 
function loadProfesores() {
    //Revisamos DataSave y tiempo pasado
    getSaveData('profesores').then(data => {
        if (data.data && ((data.time.getTime() + timeLimit > new Date().getTime()) || !navigator.onLine)) {
            //Data guarda y tiempo No pasado o Data guarda y offline
            console.log("Usando data salvada");
            genCardProf(data.data);
            hideLoadingCard();

        } else if (navigator.onLine) {
            //Obtenemos la data json
            getDataSheetJSON('profesores').then((response) => {
                if (data) {
                    //Tiempo paso y online => Actualizamos
                    console.log("Updating Data profe");
                    manageCaseData('update', 'profesores', new Date(), response.feed.entry);
                } else {
                    //No hay data guardada => Traemos y salvamos para la prox
                    console.log("Guardando Data profe");
                    manageCaseData('save', 'profesores', new Date(), response.feed.entry);
                }

                genCardProf(response.feed.entry);
                hideLoadingCard();

            }).catch((error) => {
                //Internet error => usar data 
                console.log("ERROR: cathc ", error);
            })
        } else {
            setWarnEmpty(true);
            hideLoadingCard();
        }
    })


}

function linkSrcDrive(urlshare) {
    if (urlshare.includes("drive.google.com/file/d/")) {
        //Drive img => obtener src
        let nurl = urlshare.replace('https://', ' ');
        let aurl = nurl.split('/');
        console.log('aurl', aurl);
        return "https://docs.google.com/uc?id=" + aurl[3];
    }else if(urlshare.includes("drive.google.com/open?id=")){
        let nurl = urlshare.replace('https://', ' ');
        let aurl = nurl.split('?id=');
        console.log('aurl', aurl);
        return "https://docs.google.com/uc?id=" + aurl[1];
    }
    return urlshare
}

function genCardProf(jdata) {
    if (jdata) {
        jdata.forEach(e => {
            console.log(e);
            let dCard = document.createElement('div');
            dCard.setAttribute('class', 'card shadow');

            let foto = document.createElement('img');
            //En caso de no tener foto
            if (e['gsx$linkfoto']['$t'] != "") {
                foto.setAttribute('src', linkSrcDrive(e['gsx$linkfoto']['$t']));
            } else {
                foto.setAttribute('src', imgDefault);
            }
            foto.setAttribute('class', 'card-img-top');
            foto.setAttribute('alt', 'Foto de ' + e['gsx$nombre']['$t']);

            dCard.appendChild(foto);

            let dBody = document.createElement('div');
            dBody.setAttribute('class', 'card-body');

            let cTitle = document.createElement('h5');
            cTitle.setAttribute('class', 'card-title');
            cTitle.innerText = e['gsx$nombre']['$t'];
            dBody.appendChild(cTitle);

            let cSub = document.createElement('h6');
            cSub.setAttribute('class', 'card-subtitle mb-2 text-muted');
            cSub.innerText = e['gsx$materia']['$t'];
            dBody.appendChild(cSub);

            if (e['gsx$quehace']['$t'] != "") {
                cDo = document.createElement('p');
                cDo.setAttribute('class', 'card-text');
                cDo.innerText = e['gsx$quehace']['$t'];
                dBody.appendChild(cDo);
            }

            let cText = document.createElement('p');
            cText.setAttribute('class', 'card-text');
            cText.innerText = "Estudios:";
            dBody.appendChild(cText);

            dCard.append(dBody);

            let ul = document.createElement('ul');
            ul.setAttribute('class', 'list-group list-group-flush');

            e['gsx$estudios']['$t'].split(',').forEach(est => {
                let li = document.createElement('li');
                li.setAttribute('class', 'list-group-item');
                li.innerText = est;
                ul.append(li);
            });
            dCard.append(ul);

            //Agregamos al DOM
            document.getElementById('cardProf').appendChild(dCard);
        });
    } else {
        setWarnEmpty(true);
    }



}
//#endregion

//#region SALONES
let salonesData = [];

function loadSalones() {
    getSaveData('salones').then(data => {
        if (data.data && ((data.time.getTime() + timeLimit > new Date().getTime()) || !navigator.onLine)) {
            //Data guarda y tiempo No pasado o Data guarda y offline
            console.log("Usando data salvada");
            buildData(data.data);
            genSalones();
            hideLoadingCard();

        } else if (navigator.onLine) {
            //Obtenemos la data json
            getDataSheetJSON('salones').then((response) => {
                if (data) {
                    //Tiempo paso y online => Actualizamos
                    console.log("Updating Data salones");
                    manageCaseData('update', 'salones', new Date(), response.feed.entry);
                } else {
                    //No hay data guardada => Traemos y salvamos para la prox
                    console.log("Guardando Data salones");
                    manageCaseData('save', 'salones', new Date(), response.feed.entry);
                }

                buildData(response.feed.entry);
                genSalones();
                hideLoadingCard();

            }).catch((error) => {
                //Internet error => usar data 
                console.log("ERROR: cathc ", error);
            })
        } else {
            setWarnEmpty(true);
            hideLoadingCard();
        }
    });
}

function ordeByKey(arr, campo) {
    arr.sort((a, b) => (a[campo] > b[campo]) ? 1 : -1);
}

function buildData(datos) {
    if (datos) {
        datos.forEach(d => {
            //Chequeamos si existe la materia
            let ref = d['gsx$materia']['$t'];
            if (salonesData[ref] == null) {
                //no existe
                salonesData[ref] = [];
            }
            salonesData[ref].push({
                'prof': d['gsx$profesor']['$t'],
                'dia': d['gsx$dia']['$t'],
                'hora': d['gsx$hora']['$t'],
                'salon': d['gsx$salon']['$t']
            });
        });
        console.log("salonesData: ", salonesData);
    } else {
        setWarnEmpty(true);
    }

}

function genSalones() {
    //Iteramos sobre cada materia
    let lTab = document.getElementById("list-tab");
    let navCont = document.getElementById("nav-tabContent");


    for (let mat in salonesData) {
        //Ordenar alfabeticamente por nombre de prof
        ordeByKey(salonesData[mat], 'prof');
        //var horarios = salonesData[mat];
        //console.log(mat, horarios);

        //Creamos opcion en barra lateral
        let a = document.createElement('a');
        a.setAttribute('class', 'list-group-item list-group-item-action');
        a.setAttribute('id', 'list-' + mat.replace(/ /g, '') + '-list');
        a.setAttribute('data-toggle', 'list');
        a.setAttribute('href', '#list-' + mat.replace(/ /g, ''));
        a.setAttribute('role', 'tab');
        a.innerText = mat;
        lTab.appendChild(a);

        //Creamos contenedor de horarios
        let divM = document.createElement('div');
        divM.setAttribute('class', 'tab-pane fade');
        divM.setAttribute('id', 'list-' + mat.replace(/ /g, ''));
        divM.setAttribute('role', 'tabpanel');

        //Contenedor de lista
        let divList = document.createElement('div');
        divList.setAttribute('class', 'list-group list-group-horizontal-md cardSalones');

        //Iteramos por cada materia
        salonesData[mat].forEach(hor => {
            let li = document.createElement('li');
            li.setAttribute('class', 'list-group-item shadow-sm');

            let dTitle = document.createElement('div');
            dTitle.setAttribute('class', 'd-flex w-100 justify-content-between');

            let title = document.createElement('h5');
            title.setAttribute('class', 'mb-1');
            title.innerText = hor['prof'];
            dTitle.appendChild(title);

            li.appendChild(dTitle);

            let text = document.createElement('p');
            text.setAttribute('class', 'mb-1');
            text.innerHTML = `<b>Dia: </b> ${hor['dia']} <br> <b>Hora: </b> ${hor['hora']} <br> <b>Salón: </b> ${hor['salon']}`;

            li.appendChild(text);
            divList.appendChild(li);

        });

        divM.appendChild(divList);
        navCont.appendChild(divM);
    }

}
//#endregion

//#region ARCHIVOS
function loadArchivos() {
    //Revisamos DataSave y tiempo pasado
    getSaveData('archivos').then(data => {
        if (data.data && ((data.time.getTime() + timeLimit > new Date().getTime()) || !navigator.onLine)) {
            //Data guarda y tiempo No pasado o Data guarda y offline
            console.log("Usando data salvada");
            genCardFile(data.data);
            hideLoadingCard();

        } else if (navigator.onLine) {
            //Obtenemos la data json
            getDataSheetJSON('archivos').then((response) => {
                if (data) {
                    //Tiempo paso y online => Actualizamos
                    console.log("Updating Data profe");
                    manageCaseData('update', 'archivos', new Date(), response.feed.entry);
                } else {
                    //No hay data guardada => Traemos y salvamos para la prox
                    console.log("Guardando Data profe");
                    manageCaseData('save', 'archivos', new Date(), response.feed.entry);
                }

                genCardFile(response.feed.entry);
                hideLoadingCard();

            }).catch((error) => {
                //Internet error => usar data 
                console.log("ERROR: cathc ", error);
            })
        } else {
            hideLoadingCard();
            setWarnEmpty(true);
        }
    })

}

function iconByUrl(url) {
    let icon = document.createElement('i');

    if (url.includes("drive")) {
        icon.setAttribute('class', 'fab fa-google-drive');

    } else if (url.includes("google")) {
        icon.setAttribute('class', 'fab fa-google');

    } else if (url.includes("pdf")) {
        icon.setAttribute('class', 'fas fa-file-pdf');

    } else if (url.includes("wordpress")) {
        icon.setAttribute('class', 'fab fa-wordpress');

    } else if (url.includes("pinterest")) {
        icon.setAttribute('class', 'fab fa-pinterest');

    } else {
        icon.setAttribute('class', 'fas fa-globe');
    }

    return icon;
}

function getColor(text) {
    switch (text.toLowerCase()) {
        case "nuevo":
            return "badge-success";

        case "importante":
            return "badge-danger";

        case "destacado":
            return "badge-warning";

        default:
            return "badge-info";
    }
}

function genCardFile(jfiles) {
    let divM = document.getElementById("cardFile");

    if (jfiles) {
        jfiles.forEach(f => {
            let divCard = document.createElement('div');
            divCard.setAttribute('class', 'card');

            let cBody = document.createElement('div');
            cBody.setAttribute('class', 'card-body');

            let title = document.createElement('h5');
            title.setAttribute('class', 'card-title');
            title.innerText = f['gsx$titulodematerial']['$t'] + ' ';
            title.appendChild(iconByUrl(f['gsx$linkmaterial']['$t']));
            cBody.appendChild(title);

            let sub = document.createElement('h6');
            sub.setAttribute('class', 'card-subtitle mb-2 text-muted');
            if (f['gsx$mensaje']['$t'] != "") {
                let newAv = document.createElement('span');
                newAv.setAttribute('class', 'badge ' + getColor(f['gsx$mensaje']['$t']));
                newAv.innerText = f['gsx$mensaje']['$t'];
                sub.appendChild(newAv);
            }
            cBody.appendChild(sub);

            let txt = document.createElement('p');
            txt.setAttribute('class', 'card-text');
            txt.innerText = f['gsx$brevedescripcion']['$t'];
            cBody.appendChild(txt);

            let a = document.createElement('a');
            a.setAttribute('class', 'card-link stretched-link');
            a.setAttribute('href', f['gsx$linkmaterial']['$t']);
            a.innerText = "Link";
            cBody.appendChild(a);

            divCard.appendChild(cBody);
            divM.appendChild(divCard);

        });
    } else {
        setWarnEmpty(true);
    }

}
//#endregion


//#region NOTIFICACIONES
let docsNotiReq = null;
let notiStatus = true;
const limitNoti = 10;


function loadNotificacion(mode = '') {
    //Optimizacion => Cuando ya no haya mas hacia abajo!
    if (notiStatus) {
        if (mode == "more") {
            //animation button
            document.getElementById('spin-load').style.display = "inline-block";
            document.getElementById('down-load').style.display = "none";

            setTimeout(() => {
                document.getElementById('spin-load').style.display = "none";
                document.getElementById('down-load').style.display = "block";
            }, 2000)
        }
        genCardNotis(mode);
    }

}

function getNotificaciones(mode) {
    return new Promise((resolve, reject) => {
        if (!docsNotiReq) {
            console.info("Definiendo docsNotiReq");
            docsNotiReq = FB_DB.collection("notification").orderBy("fecha", "desc").limit(limitNoti);
        }

        //Revisamos DataSave y tiempo pasado
        getSaveData('notificacion').then(data => {
            if ((mode != "more") && data.data && !navigator.onLine) {
                //Data guarda y tiempo No pasado o Data guarda y offline
                console.log("Usando data salvada");
                resolve(data.data);

            } else if (navigator.onLine) {

                docsNotiReq.get().then(function (documentSnapshots) {
                    // Get the last visible document
                    let lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

                    //console.log("last", lastVisible);
                    console.log("REAL documentSnapshots", documentSnapshots);

                    //construimos array de notificaciones
                    let notis = [];
                    documentSnapshots.forEach(doc => {
                        /* if (mode == "more") {
                             data.data.push(doc.data());
                         }*/
                        notis.push(doc.data());

                    });

                    if (data && (mode != "more")) {
                        //Tiempo paso y online => Actualizamos
                        console.log("Updating Data notificacion");
                        manageCaseData('update', 'notificacion', new Date(), notis);

                    } else if (mode == "more") {
                        //Tiempo paso y online + Carga mas => Actualizamos
                        /*console.log("Updating Data MORE notificacion");
                        manageCaseData('update', 'notificacion', new Date(), data.data);*/

                    } else {
                        //No hay data guardada => Traemos y salvamos para la prox
                        console.log("Guardando Data notificacion", notis);
                        manageCaseData('save', 'notificacion', new Date(), notis);
                    }


                    // Construct a new query starting at this document,
                    if (lastVisible) {
                        //Hay mas doc
                        docsNotiReq = FB_DB.collection("notification")
                            .orderBy("fecha", "desc")
                            .startAfter(lastVisible)
                            .limit(limitNoti);
                        console.log("Nottis :", notis);
                        resolve(notis);

                    } else {
                        notiStatus = false;
                        resolve(false);
                        console.log("No mas docs!")
                    }
                })

            } else {
                hideLoadingCard();
                setWarnEmpty(true);
            }
        })


    })

}

function timeAgoGen(sgOld) {
    let sgNow = new Date().getTime() / 1000;
    let timeDif = Math.floor(sgNow - sgOld);
    let stResult = '';
    //console.log('TIme dif start', timeDif);
    //Seg de diferencia hasta 59sg
    if ((timeDif >= 0) && (timeDif <= 59)) {
        //seg
        if (timeDif <= 0) {
            stResult = 'Hace instantes';
        } else {
            stResult = 'Hace ' + Math.floor(timeDif) + ' seg';
        }

    } else {
        timeDif = Math.floor(timeDif / 60);
        //console.log('TIme dif min', timeDif);
        //Min de diferencia hasta 59
        if ((timeDif >= 1) && (timeDif <= 59)) {
            //Min
            if (timeDif == 1) {
                stResult = 'Hace 1 min';
            } else {
                stResult = 'Hace ' + Math.floor(timeDif) + ' mins';
            }
        } else {
            timeDif = Math.floor(timeDif / 60);
            // console.log('TIme dif hrs', timeDif);
            //Hr diferencia hasta 23
            if ((timeDif >= 1) && (timeDif <= 23)) {
                //hrs
                if (timeDif == 1) {
                    stResult = 'Hace 1 hr';
                } else {
                    stResult = 'Hace ' + Math.floor(timeDif) + ' hrs';
                }
            } else {
                timeDif = Math.floor(timeDif / 24);
                //console.log('TIme dif days', timeDif);
                //Dias diferencia
                if ((timeDif >= 1) && (timeDif <= 29)) {
                    //dias
                    if (timeDif == 1) {
                        stResult = 'Hace un dia';
                    } else {
                        stResult = 'Hace ' + Math.floor(timeDif) + ' dias';
                    }
                } else {
                    timeDif = Math.floor(timeDif / 30);
                    //console.log('TIme dif mes', timeDif);
                    //Meses de diferencia
                    if ((timeDif >= 1) && (timeDif <= 11)) {
                        //month
                        if (timeDif == 1) {
                            stResult = 'Hace un mes';
                        } else {
                            stResult = 'Hace ' + Math.floor(timeDif) + ' meses';
                        }
                    } else {
                        //Anos diferencia
                        timeDif = Math.floor(timeDif / 12);
                        //console.log('TIme dif ano', timeDif);
                        if ((timeDif >= 1) && (timeDif <= 11)) {
                            //years
                            if (timeDif == 1) {
                                stResult = 'Hace un año';
                            } else {
                                stResult = 'Hace ' + Math.floor(timeDif) + ' años';
                            }
                        }
                    }
                }
            }
        }
    }

    return stResult;
}

function genCardNotis(mode) {
    getNotificaciones(mode).then(docs => {
        if (docs) {
            docs.forEach(doc => {
                let noti = doc;
                //console.log("DOC: ", doc.data());

                let divMain = document.createElement("div");
                divMain.setAttribute("class", "card");

                //Hay imagen?
                if (noti.webpush.notification.image) {
                    let imgCard = document.createElement("img");
                    imgCard.setAttribute("class", "card-img-top");
                    imgCard.setAttribute("src", noti.webpush.notification.image);

                    divMain.appendChild(imgCard);
                }

                let divBody = document.createElement("div");
                divBody.setAttribute("class", "card-body");

                let hTitle = document.createElement("h5");
                hTitle.setAttribute("class", "card-title");
                hTitle.innerText = noti.webpush.notification.title;
                divBody.appendChild(hTitle);

                let pText = document.createElement("p");
                pText.setAttribute("class", "card-text");
                pText.innerText = noti.webpush.notification.body;
                divBody.appendChild(pText);



                //Time TO-DO
                let pTime = document.createElement("p");
                pTime.setAttribute("class", "card-text time-update");

                let spTime = document.createElement("span");
                spTime.setAttribute("class", "text-muted");
                spTime.innerText = timeAgoGen(noti.fecha.seconds);

                pTime.appendChild(spTime);
                divBody.appendChild(pTime);


                divMain.appendChild(divBody);

                //Footer => Buttons
                let divFooter = document.createElement("div");
                divFooter.setAttribute("class", ".card-footer");

                let divButton = document.createElement("div");
                divButton.setAttribute("class", "btn-group btn-block");
                divButton.setAttribute("role", "group");

                //link action
                if (noti.webpush.notification.click_action) {

                    let aLink = document.createElement("a");
                    aLink.setAttribute("class", "btn btn-outline-info woborder");
                    aLink.setAttribute("role", "button");
                    aLink.setAttribute("href", noti.webpush.notification.click_action);
                    aLink.innerHTML = '<i class="fas fa-link"></i>';

                    divButton.appendChild(aLink);
                }

                let btnShare = document.createElement("button");
                btnShare.setAttribute("class", "btn btn-outline-info woborder");
                btnShare.setAttribute("type", "button");
                let daat = JSON
                    .stringify(
                        {
                            "title": noti.webpush.notification.title,
                            "text": noti.webpush.notification.body,
                            "url": noti.webpush.notification.click_action ? noti.webpush.notification.click_action : urlApp
                        });
                btnShare.setAttribute("onclick", 'shareWApi(' + daat + ');');
                btnShare.innerHTML = '<i class="fas fa-share-alt"></i>';

                divButton.appendChild(btnShare);

                divFooter.appendChild(divButton);
                divMain.appendChild(divFooter);

                document.getElementById("notis").appendChild(divMain);
            })
        } else if (mode != "more") {
            console.log("else genCard");
            setWarnEmpty(true);
        }

        hideLoadingCard();
    })
}
//#endregion