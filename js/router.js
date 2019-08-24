let mainContainer;
let actualView = '';


window.addEventListener("hashchange", hashChange, false);

function hashChange() {
    mainContainer = document.getElementById('mainContainer');
    console.info("HASH CAMBIO ", location.hash.replace("#/", ""));
    actualView = location.hash.replace("#/", "")
    setViewTemplate(actualView);
}

function getTemplate(nameView) {
    nameView = nameView ? nameView : 'menu';
    return new Promise((resolve, reject)=>{
        fetch(`/templates/${nameView}.html`)
            .then(data => data.text())
            .then(html => {
                if(html.includes("entry not found")){
                    reject("Not found");
                }else{
                    resolve(html);
                }
            })
            .catch(reason =>{
                reject(reason);
            })
    })
    
}

function setViewTemplate(nameView = ""){
    //setLoader(true);
    setWarnEmpty(false);
    setVisibility(false);
    getTemplate(nameView).then(html =>{
        console.log("Agregando template ", nameView);
        console.time("loadView");
        loadview();
        mainContainer.innerHTML = html;
        

    }).catch(err =>{
        
        console.error("Error obteniendo Template! ", err);
        if(err == "Not found"){
            mainContainer.innerHTML = '';
            
            //setLoader(false);
            setVisibility(true);
            setWarnEmpty(true);
        }
    })
    
}

