const dbId = '1eKkBkgUsMM62K6Pyl04z4YOElJQHn5OJ8AevhXR-N_Y';

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

getDataSheetJSON('profesores').then((response) =>{
    console.log(response.feed.entry);
}, (error) =>{
    console.log(error);
})