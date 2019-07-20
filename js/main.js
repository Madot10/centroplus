const dbId = '1eKkBkgUsMM62K6Pyl04z4YOElJQHn5OJ8AevhXR-N_Y';
const imgDefault = 'https://image.flaticon.com/icons/png/512/23/23140.png';

window.onload = ()=>{
    //loadProfesores();
    loadSalones();
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

// PROFESORES 
function loadProfesores(){
    //Obtenemos la data json
    getDataSheetJSON('profesores').then((response) =>{
        //console.log(response.feed.entry);
        genCardProf(response.feed.entry);

    }, (error) =>{
        console.log(error);
    })
   
}

function genCardProf(jdata){
  
    jdata.forEach(e => {
        console.log(e);
        let dCard = document.createElement('div');
        dCard.setAttribute('class', 'card shadow');

        let foto = document.createElement('img');
        //En caso de no tener foto
        if(e['gsx$linkfoto']['$t'] != ""){
            foto.setAttribute('src', e['gsx$linkfoto']['$t']);
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

//SALONES
let salonesData = [];

function loadSalones(){
    //Obtenemos la data json
    getDataSheetJSON('salones').then((response) =>{
        console.log(response.feed.entry);
        buildData(response.feed.entry);
        genSalone();

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

function genSalone(){
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