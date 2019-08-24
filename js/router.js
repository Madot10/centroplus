let mainContainer;
let actualView = '';


window.addEventListener("hashchange", ()=>{
    console.time("loadView");
    loadview();
}, false);

window.addEventListener("load", inithashChanger, false);

function inithashChanger() {
    mainContainer = document.getElementById('mainContainer');
}

function getTemplate(nameView) {
    nameView = nameView ? nameView : 'menu';
    return new Promise((resolve, reject) => {
        fetch(`/templates/${nameView}.html`)
            .then(data => data.text())
            .then(html => {
                if (html.includes("entry not found")) {
                    reject("Not found");
                } else {
                    resolve(html);
                }
            })
            .catch(reason => {
                reject(reason);
            })
    })

}

function setViewTemplate(nameView = "") {
    return new Promise((resolve, reject) => {
        //setLoader(true);
        titleChanger();
        setWarnEmpty(false);
        //setVisibility(false);
        getTemplate(nameView).then(html => {
            console.log("Agregando template ", nameView);
            hideAllNav();
            //loadview();

            mainContainer.innerHTML = html;
            resolve(true);

        }).catch(err => {

            console.error("Error obteniendo Template! ", err);
            if (err == "Not found") {
                mainContainer.innerHTML = '';
                //setLoader(false);
                setVisibility(true);
                setWarnEmpty(true);

                resolve(false);
            }
            reject(err);
        })

    })

}

function titleChanger(){
    if(actualView != ""){
        document.title = `${actualView.toUpperCase()} | Centro+`
    }else{
        document.title = `Centro+`
    }
    
}