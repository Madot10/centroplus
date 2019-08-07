//#region AUTH
function logIn() {
    FB_AUTH.signInWithPopup(provider).then(function (result) {
        let user = result.user;

        if (true ||user.email.includes('ucab.edu.ve')) {
            //yes
            console.log("LogIn UCAB", user);
            isRegister().then(resp =>{
                if(resp){
                    //Hay registro
                    window.location.replace('/');
        
                 }else{
                    console.log("Need registro");
                    window.location.replace('/configuracion');
                }
            });
           

        } else {
            //no 
            console.log("NoUCAB => desLogin");
            msgSnack("¡Debe utlizar correo UCAB! <br> Plataforma <b>SOLO</b> para Ucabistas")
            logOut();
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

function logOut() {
    FB_AUTH.signOut().then(function () {
        // Sign-out successful.
        console.log("BYE BYE OK");

    }).catch(function (error) {
        // An error happened.
        console.log("NOT TODAY", error);
    });
}

function checkAccess() {
    return new Promise((resolve, reject) =>{
        FB_AUTH.onAuthStateChanged(function (user) {

            if (!user && !window.location.pathname.includes('/inicio/')) {
                //No => Rechazar
                //Rebotamos a login
                console.log("No LOgin", false, user);
                window.location.replace('/inicio/');
                resolve(false);
        
           /* } else if (user && !user.email.includes('ucab.edu.ve')) {
                //Si login => No ucab
                console.log("User No-Ucab", false, user);
                logOut();
                resolve(false);
        */
            } else if (user && window.location.pathname.includes('/inicio/')) {
                //Si login ucab in /login
                console.log("User Ucab in /login", true, user);
                isRegister().then(resp =>{
                    if(resp){
                        //Hay registro => TODO OK

                        window.location.replace('/');
                        resolve(true);
                    }else{
                        console.log("Need registro");
                        window.location.replace('/configuracion');
                        resolve(false);
                    }
                });
               
                resolve(true);
        
            } else if (user && !window.location.pathname.includes('/configuracion')) {
                //Si login ucab
                console.log("User Ucab", true, user);
                isRegister().then(resp =>{
                    if(resp){
                        //Hay registro => TODO OK
                        setVisibility(true);
                        setLoader(false);

                        resolve(true);
                    }else{
                        console.log("Need registro");
                        window.location.replace('/configuracion');
                        resolve(false);
                    }
                });
        
            } else if(window.location.pathname.includes('/configuracion')){
                //Login but NoReg in /conf
                console.log("Login, NoReg in /conf", false, user);
                setVisibility(true);
                setLoader(false);

                resolve(false);
            }else{
                //No login and in /login
                console.log("NoUser in /login", true, user);
                setVisibility(true);
                setLoader(false);

                resolve(false);
            }
        });
    })
}
/*
FB_AUTH.onAuthStateChanged(function (user) {
    if (!user && !window.location.pathname.includes('/inicio/')) {
        //No => Rechazar
        //Rebotamos a login
        console.log("No LOgin", false, user);
        window.location.replace('/inicio/');
        return false;

    } else if (user && !user.email.includes('ucab.edu.ve')) {
        //Si login => No ucab
        console.log("User No-Ucab", false, user);
        LogOut();
        return false;

    } else if (user && window.location.pathname.includes('/inicio/')) {
        //Si login ucab in /login
        console.log("User Ucab in /login", true, user);
        window.location.replace('/');
        return true;

    } else if (user) {
        //Si login ucab
        console.log("User Ucab", true, user);
        return true;

    } else {
        //No login and in /login
        console.log("NoUser in /login", true, user);
    }
});*/

function isRegister(){
    console.log("Current ", FB_AUTH.currentUser);

    return new Promise((resolve, reject) =>{
        FB_DB.collection("users").doc(FB_AUTH.currentUser.email).get()
            .then(doc =>{
                if(doc.exists){
                    resolve(true);
                    //Hay registro
                }else{
                    resolve(false);
                    //No hay
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
                reject(false);
            });
    });
}

//#endregion AUTH