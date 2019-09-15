const logoUrl = "/media/logoOrin.png";

function textCount(){
    document.getElementById("countChar").innerText = ` ${160 - document.getElementsByTagName("textarea")[0].textLength}/160`;
}

function getTargetTopics(){
    let options = document.getElementById("targetTopics").selectedOptions;
    let values = "";

    for(let i = 0; i < options.length; i++){
        if(values != ""){
            values += " || '" + options[i].value + "' in topics";
            //values += ` || '${options[i].value}' in topics`;
        }else{
            //1er vez
            values = "'ucab' in topics && ('" + options[i].value + "' in topics";
            //values = `'${options[i].value}' in topics`;
        }
    }
    console.log(values);
    if(values != ""){
        msgSnack('<div class="spinner-border text-light spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div> Enviando...');
        return values + ")";
    }else{
        alert("Debes seleccionar un grupo destino!");
    }
       
}

function genObjNoti(){
    //Url de acction
    let urlAct = "/";
    if(document.getElementById('urlActInput').value != ""){
        urlAct = document.getElementById('urlActInput').value;
    }

    //Url imagen
    let urlImg = "";
    if(document.getElementById('ulrImgInput').value != ""){
        urlImg = linkSrcDrive(document.getElementById('ulrImgInput').value);
    }

    return nOptions = {
        webpush:{
            notification:{
                title: document.getElementById('titleInput').value,
                body: document.getElementById('cuerpoInput').value,
                click_action: urlAct,
                image: urlImg,
                icon: logoUrl,
                badge: logoUrl
            }
        },
        condition: getTargetTopics(),
        fecha: new Date()
    }
}

function testNotificacion(){
    FB_CM.requestPermission().then(() =>{
        if ('serviceWorker' in navigator) {
            //console.log("Installing");
            let noti = genObjNoti().webpush;
            navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
                .then(function (swReg) {
                    swReg.showNotification(noti.notification.title, noti.notification);
                    console.log(noti.title, noti);
                    FB_CM.useServiceWorker(swReg);
                });
        }
    })
    
}

function sendNotification(){
    FB_DB.collection('notification')
        .add(genObjNoti())
    .then(function (docRef) {
        console.log(genObjNoti());
        console.log("Notificacion enviada: ", docRef.id);
        msgSnack('¡Enviado! <i class="fas fa-check"></i>');
    })
    .catch(function (error) {
        console.error("Error adding document: ", error);
    });
}

function limitTopic(){
    if(document.getElementById("targetTopics").selectedOptions.length > 4){
        alert("¡Hasta 4 grupos puedes enviar! Vuelve a seleccionar por favor.");
        document.getElementById("targetTopics").selectedIndex = -1;
    }
    document.getElementById("groupCount").innerText = document.getElementById("targetTopics").selectedOptions.length;
}