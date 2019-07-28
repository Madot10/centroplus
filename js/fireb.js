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
                    swRegistration = swReg;
                    FB_CM.useServiceWorker(swReg);
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
    FB_CM.getToken()
        .then(function (refreshedToken) {
            console.log('Token', refreshedToken);
            return refreshedToken;

        }).catch(function (err) {
            console.log('Unable to retrieve refreshed token ', err);
            return false;
            //showToken('Unable to retrieve refreshed token ', err);
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
function SaveRegToDB(uid, tokU) {
    var dat = {
        susState: true,
        susDate: new Date(),
        email: FB_AUTH.currentUser.email,
        uid: uid,
        token: tokU
    };

    //No hay reg => create
    FB_DB.collection('users').add(dat)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);   
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
            msgSnack('Error de red, vuelva a intentar');
        })
}

function saveUser(){
    SaveRegToDB(FB_AUTH.currentUser.uid,  getTokenUser());
}
//#endregion msg