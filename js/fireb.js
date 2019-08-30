// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZXR-1V1nFldVV0oqPkSnls1SkErH0w-8",
    authDomain: "centro-eco.firebaseapp.com",
    databaseURL: "https://centro-eco.firebaseio.com",
    projectId: "centro-eco",
    storageBucket: "centro-eco.appspot.com",
    messagingSenderId: "23828139838",
    appId: "1:23828139838:web:b6626f2f3d76f5ee"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();

const FB_AUTH = firebase.auth();

const FB_DB = firebase.firestore();

const FB_CM = firebase.messaging();

let perf = firebase.performance();

//#region msg
function suscribirse() {
    FB_CM.requestPermission().then(function () {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve an Instance ID token for use with FCM.

        //INstalamos SW
        if ('serviceWorker' in navigator) {
            //console.log("Installing");
            navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
                .then(function (swReg) {
                    console.log("swreg", swReg);

                    if(window.location.pathname.includes('/configuracion/')){
                        SaveRegToDB('form');
                    }else{
                        SaveRegToDB();
                        $('#notiModal').modal('hide');
                    }
                    FB_CM.useServiceWorker(swReg);

                });
        } else {
            //msgSnack('Navegador no compatible!');
            console.log("SW Dont support");

        }
    }).catch(function (err) {
        SaveRegToDB();
        console.log('Unable to get permission to notify.', err);

    });
}

function getTokenUser() {
    return new Promise((resolve, reject) => {
        if (Notification.permission === "granted") {
            FB_CM.requestPermission().then(function () {
                FB_CM.getToken()
                    .then(function (refreshedToken) {
                        console.log('Token', refreshedToken);
                        resolve(refreshedToken);

                    }).catch(function (err) {
                        console.log('Unable to retrieve refreshed token ', err);
                        reject(false)
                        //showToken('Unable to retrieve refreshed token ', err);
                    });
            })
        } else if (Notification.permission === "denied") {
            reject(false);
        } else {
            //No se ha preguntado
            reject(false);
        }

    });

}

function updateSW() {
    return new Promise((resolve, reject) => {
        if (Notification.permission === "granted") {
            //Se tiene permiso
            FB_CM.requestPermission().then(function () {
                //console.log('Notification permission granted.');
                if ('serviceWorker' in navigator) {
                    //console.log("Updating");
                    navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
                        .then(function (swReg) {
                            console.log('Updating')
                            swReg.update();
                            FB_CM.useServiceWorker(swReg);
                            resolve();
                        });
                } else {
                    reject('support');
                    console.log("SW Dont support");
                }
            }).catch(function (err) {
                reject('permission');
                console.log('Unable to get permission to notify.', err);
            });
        }else{
            reject('permission def/den');
        }
    })

}


//A la escucha en focus app
FB_CM.onMessage(function (payload) {
    var noti = payload.notification;
    console.log('payload', payload);

    if ('serviceWorker' in navigator) {
        //console.log("Installing");
        navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
            .then(function (swReg) {
                swReg.showNotification(noti.title, noti);
                //console.log(noti.title, options, noti);
                FB_CM.useServiceWorker(swReg);
            });
    }

    console.log('Message received. ', noti);

});

FB_CM.onTokenRefresh(() => {
    FB_CM.getToken().then((refreshedToken) => {
        console.log('Token refreshed.');

        let dat = { token: refreshedToken };

        FB_DB.collection('users')
            .doc(FB_AUTH.currentUser.email).set(dat, { merge: true })
            .then(function (docRef) {
                console.log("Document written with ID: ", docRef);
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
                msgSnack('Error de red, vuelva a intentar');
            })
    }).catch((err) => {
        console.log('Unable to retrieve refreshed token ', err);
    });
});


//Generamos doc para guardar en DB
function SaveRegToDB(mode = '') {
    let dat = {};
    togglerSpiner(true);
    getTokenUser().then(resp => {
        //Noti aceptadaas
        console.log("RUN SAVE-REG ACEPT");
        if (resp) {
            if (mode == 'form') {
                dat = {
                    susState:  document.getElementById('notiState').checked,
                    email: FB_AUTH.currentUser.email,
                    uid: FB_AUTH.currentUser.uid,
                    token: resp,
                    topics: getFormTopic()
                };
            } else {
                togglerSpiner(false); //no le toca
                dat = {
                    susState: true,
                    susDate: new Date(),
                    email: FB_AUTH.currentUser.email,
                    uid: FB_AUTH.currentUser.uid,
                    token: resp,
                    topics: {
                        'ucab': true,
                        'avisosU': true,
                        'eventosU': true,
                        'acadCoor': true,
                        'finCoor': true,
                        'socialCoor': true,
                        'depCoor': true,
                        'centroEst': true
                    }
                };
            }


        }
    }).catch(rejec => {
        //Notificaciones rechazadas
        console.log("RUN SAVE-REG RECH/1er");
        dat = {
            susState: false,
            susDate: new Date(),
            email: FB_AUTH.currentUser.email,
            uid: FB_AUTH.currentUser.uid
        };

    }).finally(() => {
        console.log("DataToSave", dat);

        FB_DB.collection('users')
            .doc(FB_AUTH.currentUser.email).set(dat, { merge: true })
            .then(function (docRef) {
                togglerSpiner(false);
                console.log("Document written with ID: ", docRef);
                msgSnack('¡Guardado! <i class="fas fa-check"></i>');
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
                msgSnack('Error de red, vuelva a intentar');
            })
    });


}

function getFormTopic() {
    return topic = {
        'avisosU': document.getElementById('avisosU').checked,
        'eventosU': document.getElementById('eventosU').checked,
        'acadCoor': document.getElementById('acadCoor').checked,
        'finCoor': document.getElementById('finCoor').checked,
        'socialCoor': document.getElementById('socialCoor').checked,
        'depCoor': document.getElementById('depCoor').checked,
        'centroEst': document.getElementById('centroEst').checked,
        'ucab': document.getElementById('notiState').checked
    }
}

function setFormTopic(){
    FB_DB.collection('users').doc(FB_AUTH.currentUser.email)
        .get().then(doc=>{
            let userData = doc.data();
            let topics = userData.topics;

            for(let ntopic in topics){
                if(ntopic != 'ucab'){
                    document.getElementById(ntopic).checked = topics[ntopic];
                }else if(ntopic == 'ucab'){
                    document.getElementById('notiState').checked = topics[ntopic];
                }
                    
            }

            //SusState
            //document.getElementById('notiState').checked = userData.susState;
            setLoader(false);
            setVisibility(true);
        });
}

function toggleNoti(){
    let opCheck = document.getElementsByClassName('opt');
    if(document.getElementById('notiState').checked){
        //Activada noti
        for(let check in opCheck){
            opCheck[check].checked = true;
        }
    }else{
        //desactivadas
        for(let check in opCheck){
            opCheck[check].checked = false;
        }
    }
}
//#endregion msg



