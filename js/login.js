//#region AUTH
function logIn() {
    FB_AUTH.signInWithPopup(provider).then(function (result) {
        let user = result.user;

        if (user.email.includes('ucab.edu.ve')) {
            //yes
            console.log("LogIn UCAB", user);
            window.location.replace('/centroplus/');

        } else {
            //no 
            console.log("NoUCAB => desLogin");
            msgSnack("¡Debe utlizar correo UCAB! <br> Plataforma <b>SOLO</b> para Ucabistas")
            LogOut();
        }

    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.error("ERROR LogIn: ", errorCode, errorMessage);
    });
}

function LogOut() {
    FB_AUTH.signOut().then(function () {
        // Sign-out successful.
        console.log("BYE BYE OK");

    }).catch(function (error) {
        // An error happened.
        console.log("NOT TODAY", error);
    });
}


function isLogIn() {
    let user = FB_AUTH.currentUser;

    if (user) {
        return true;
    } else {
        return false;
    }
}

function checkAccess() {
    return new Promise((resolve, reject) =>{
        FB_AUTH.onAuthStateChanged(function (user) {
            console.log('checking');
            
            if (user && user.email.includes('ucab.edu.ve')) {
                //User y UCab
                resolve(true);
            } else if (user) {
                //User NOucab
                resolve(false);
            } else {
                //NoUser
                resolve(false);
            }
        });
    })
}

FB_AUTH.onAuthStateChanged(function (user) {
    if (!user && !window.location.pathname.includes('/login/')) {
        //No => Rechazar
        //Rebotamos a login
        console.log("No LOgin", false, user);
        window.location.replace('/centroplus/login/');
        return false;

    } else if (user && !user.email.includes('ucab.edu.ve')) {
        //Si login => No ucab
        console.log("User No-Ucab", false, user);
        LogOut();
        return false;

    } else if (user && window.location.pathname.includes('/login/')) {
        //Si login ucab in /login
        console.log("User Ucab in /login", true, user);
        window.location.replace('/centroplus/');
        return true;

    } else if (user) {
        //Si login ucab
        console.log("User Ucab", true, user);
        return true;

    } else {
        //No login and in /login
        console.log("NoUser in /login", true, user);
    }
});

//#endregion AUTH