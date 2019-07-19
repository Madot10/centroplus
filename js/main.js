const dbId = '1eKkBkgUsMM62K6Pyl04z4YOElJQHn5OJ8AevhXR-N_Y';
const imgDefault = 'https://image.flaticon.com/icons/png/512/23/23140.png';

window.onload = ()=>{
    loadProfesores();
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
        dCard.setAttribute('class', 'card');

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

