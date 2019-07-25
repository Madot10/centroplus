const dbId = '1eKkBkgUsMM62K6Pyl04z4YOElJQHn5OJ8AevhXR-N_Y';
const imgDefault = 'https://image.flaticon.com/icons/png/512/23/23140.png';
const appName = '/centroplus/';

window.onload = ()=>{
    //loadProfesores();
    //loadSalones();
    //loadArchivos();

    //Carga de nav
    /*fetch(document.location.origin + appName + 'nav.html')
        .then(data => data.text())
        .then(html => document.getElementById('nav').innerHTML = html);*/
    
    //Footer
    /*fetch(document.location.origin + appName + 'footer.html')
        .then(data => data.text())
        .then(html => document.getElementsByTagName('footer')[0].innerHTML = html);
    */
}


function loadview(scname){
    console.log("Cargando view: ", scname);
    switch(scname){
        case 'profesores':
            loadProfesores();
            break;

        default:
            break;
    }
}

//Devuelve JSON de la hoja pedida
function getDataSheetJSON(name){
    let pg;

    //HORRIBLE -> ARREGLAR
    if(name == "profesores"){
        pg = 1;
    }else if(name == "salones"){
        pg = 2;
    }else if(name == "archivos"){
        pg = 3;
    }

    let url = "https://spreadsheets.google.com/feeds/list/" + dbId +"/"+ pg +"/public/full?alt=json";

    return new Promise((resolve, reject) => {
        let request  = new XMLHttpRequest();
        let result;

        request.onload = function(){
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                result = JSON.parse(request.responseText);
                //console.log(result);
                resolve(result);
            }else{
                reject(Error('Ha ocurrido un error \n Error code:' + request.statusText));
            }
        };
        
        request.onerror = function() {
                reject(Error('Error! \n No se ha podido conectar'));
        };
        request.open("GET", url, true);
        request.send();
    })
}

//#region PROFESORES 
function loadProfesores(){
    //Obtenemos la data json
    getDataSheetJSON('profesores').then((response) =>{
        //console.log(response.feed.entry);
        genCardProf(response.feed.entry);

    }, (error) =>{
        console.log(error);
    })
   
}

function linkSrcDrive(urlshare){
    if(urlshare.includes("drive.google.com/file/d/")){
        //Drive img => obtener src
        let nurl = urlshare.replace('https://',' ');
        let aurl = nurl.split('/');
        console.log('aurl', aurl);
        return "https://docs.google.com/uc?id=" + aurl[3];
    }
    return urlshare
}

function genCardProf(jdata){
  
    jdata.forEach(e => {
        console.log(e);
        let dCard = document.createElement('div');
        dCard.setAttribute('class', 'card shadow');

        let foto = document.createElement('img');
        //En caso de no tener foto
        if(e['gsx$linkfoto']['$t'] != ""){
            foto.setAttribute('src', linkSrcDrive(e['gsx$linkfoto']['$t']));
        }else{
            foto.setAttribute('src', imgDefault);
        }
        foto.setAttribute('class', 'card-img-top');
        foto.setAttribute('alt', 'Foto de '+e['gsx$nombre']['$t']);

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

        if(e['gsx$quehace']['$t'] != ""){
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

        e['gsx$estudios']['$t'].split(',').forEach(est =>{
            let li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            li.innerText = est;
            ul.append(li);
        });
        dCard.append(ul);
        
        //Agregamos al DOM
        document.getElementById('cardProf').appendChild(dCard);
    });
}
//#endregion

//#region SALONES
let salonesData = [];

function loadSalones(){
    //Obtenemos la data json
    getDataSheetJSON('salones').then((response) =>{
        console.log(response.feed.entry);
        buildData(response.feed.entry);
        genSalones();

    }, (error) =>{
        console.log(error);
    })
}

function ordeByKey(arr, campo){
    arr.sort((a,b)=>(a[campo] > b[campo]) ? 1 : -1);
}

function buildData(datos){
    datos.forEach(d =>{
        //Chequeamos si existe la materia
        let ref = d['gsx$materia']['$t'];
        if(salonesData[ref] == null){
            //no existe
            salonesData[ref] = [];
        }
        salonesData[ref].push({'prof': d['gsx$profesor']['$t'],
                                'dia': d['gsx$dia']['$t'],
                                'hora': d['gsx$hora']['$t'],
                                'salon': d['gsx$salon']['$t']});
    });
    console.log("salonesData: ", salonesData);
}

function genSalones(){
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
        a.setAttribute('id', 'list-' + mat.replace(/ /g,'') + '-list');
        a.setAttribute('data-toggle', 'list');
        a.setAttribute('href', '#list-' + mat.replace(/ /g,''));
        a.setAttribute('role', 'tab');
        a.innerText = mat;
        lTab.appendChild(a);

        //Creamos contenedor de horarios
        let divM = document.createElement('div');
        divM.setAttribute('class', 'tab-pane fade');
        divM.setAttribute('id', 'list-' + mat.replace(/ /g,''));
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
function loadArchivos(){
    getDataSheetJSON('archivos').then((response) =>{
        console.log(response.feed.entry);
        genCardFile(response.feed.entry);

    }, (error) =>{
        console.log(error);
    })
}

function iconByUrl(url){
    let icon = document.createElement('i');

    if(url.includes("drive")){
        icon.setAttribute('class', 'fab fa-google-drive');

    }else if(url.includes("google")){
        icon.setAttribute('class', 'fab fa-google');

    }else if(url.includes("pdf")){
        icon.setAttribute('class', 'fas fa-file-pdf');

    }else if(url.includes("wordpress")){
        icon.setAttribute('class', 'fab fa-wordpress');

    }else if(url.includes("pinterest")){
        icon.setAttribute('class', 'fab fa-pinterest');

    }else{
        icon.setAttribute('class', 'fas fa-globe');
    }

    return icon;
}

function getColor(text){
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

function genCardFile(jfiles){
    let divM = document.getElementById("cardFile");

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
            if(f['gsx$mensaje']['$t'] != ""){
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
}
//#endregion