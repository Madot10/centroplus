// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCEcuzGwlXFZpXnpEi2HuofhfsmwKwA51E",
    authDomain: "centro-plus.firebaseapp.com",
    databaseURL: "https://centro-plus.firebaseio.com",
    projectId: "centro-plus",
    storageBucket: "",
    messagingSenderId: "818379002482",
    appId: "1:818379002482:web:117fdfd2efa6f938"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();

const FB_AUTH = firebase.auth();

const FB_DB = firebase.firestore();

const FB_CM = firebase.messaging();


//#region msg
function suscribirse() {
    FB_CM.requestPermission().then(function () {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve an Instance ID token for use with FCM.

        //INstalamos SW
        if ('serviceWorker' in navigator) {
            //console.log("Installing");
            navigator.serviceWorker.register('/centroplus/firebase-messaging-sw.js', { scope: '/centroplus/firebase-cloud-messaging-push-scope' })
                .then(function (swReg) {
                    console.log("swreg", swReg);
                    //FB_CM.useServiceWorker(swReg);
                    SaveRegToDB();
                });
        } else {
            //msgSnack('Navegador no compatible!');
            console.log("SW Dont support");

        }
    }).catch(function (err) {
        console.log('Unable to get permission to notify.', err);

    });
}

function getTokenUser() {
    return new Promise((resolve, reject) => {
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
    });
   
}

function updateSW() {
    FB_CM.requestPermission().then(function () {
        //console.log('Notification permission granted.');
        if ('serviceWorker' in navigator) {
            //console.log("Updating");
            navigator.serviceWorker.register('/centroplus/firebase-messaging-sw.js', { scope: '/centroplus/firebase-cloud-messaging-push-scope' })
                .then(function (swReg) {
                    console.log('registrado')
                    swReg.update();
                    FB_CM.useServiceWorker(swReg);
                });
        } else {
            console.log("SW Dont support");
        }
    }).catch(function (err) {
        console.log('Unable to get permission to notify.', err);
    });
}


//A la escucha en focus app
FB_CM.onMessage(function (payload) {
    var noti = payload.notification;
    console.log('payload', payload);

    if ('serviceWorker' in navigator) {
        //console.log("Installing");
        navigator.serviceWorker.register('/centroplus/firebase-messaging-sw.js', { scope: '/centroplus/firebase-cloud-messaging-push-scope' })
            .then(function (swReg) {
                swReg.showNotification(noti.title, noti);
                FB_CM.useServiceWorker(swReg);
            });
    }

    console.log('Message received. ', noti);

});

//Generamos doc para guardar en DB
function SaveRegToDB() {
    getTokenUser().then(resp => {
        if(resp){
            let dat = {
                susState: true,
                susDate: new Date(),
                email: FB_AUTH.currentUser.email,
                uid: FB_AUTH.currentUser.uid,
                token: resp,
                topics: getFormTopic()
            };
        
            console.log("DataToSave", dat);
        
            FB_DB.collection('users')
                .doc(FB_AUTH.currentUser.email).set(dat, {merge: true})
                .then(function (docRef) {
                    console.log("Document written with ID: ", docRef);   
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                    msgSnack('Error de red, vuelva a intentar');
                })
        }
    });

  
}

function getFormTopic(){
    return topic ={
        'avisosU': document.getElementById('avisosU').checked,
        'eventosU': document.getElementById('eventosU').checked,
        'acadCoor': document.getElementById('acadCoor').checked,
        'finCoor': document.getElementById('finCoor').checked,
        'socialCoor': document.getElementById('socialCoor').checked,
        'depCoor': document.getElementById('depCoor').checked
    }
}
//#endregion msg


updateSW();