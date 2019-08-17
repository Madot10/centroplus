//#region AUTH
function logIn() {
    FB_AUTH.signInWithPopup(provider).then(function (result) {
        let user = result.user;

        if (true || user.email.includes('ucab.edu.ve') || user.email === adminEmail) {
            //yes
            console.log("LogIn UCAB", user);
            isRegister().then(resp =>{
                if(resp){
                    //Hay registro
                    //updateSW
                    updateSW().finally((r)=>{
                        window.location.replace('/');
                    })
                   
                 }else{
                    console.log("Need registro");
                    window.location.replace('/');
                }
            });
           

        }else {
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
            if(user){
                //Hay login
                isRegister().then((status)=>{
                    if(status){
                        //Registrado en DB ucab => TODO OK

                        if(window.location.pathname.includes('/admin') && user.email != adminEmail){
                            //No-admin intentando => menu
                            window.location.replace('/');
                        }
                        console.log("All ok");
                        setVisibility(true);
                        setLoader(false);

                        user.email == adminEmail ? resolve('adminMode') : resolve(true);

                    }else if(user.email.includes('ucab.edu.ve')){
                        //NoDB por noUCAB
                        //Rebotar/Pedir login
                        console.log("NoDB NoUCab", false, user);
                        logOut();
                        //window.location.replace('/inicio/');
                    }else{
                        //NoDB por 1er vez
                        if(window.location.pathname.includes('/')){
                            //Estamos en menu
                            console.log("NoDB 1er");
                            setVisibility(true);
                            setLoader(false);
                            resolve('first');
                        }else{
                            //Mandamos a menu
                            window.location.replace('/');
                        }    
                    }
                })
            }else{
                //No login => Rebotar/Pedir login
                console.log("No LOgin", false, user);
                if(window.location.pathname.includes('/inicio/')){
                    //Estamos en inicio => logeate por favooor boludo
                    setVisibility(true);
                    resolve(true);
                }else{
                    //Mandamos a login
                    window.location.replace('/inicio/');
                }
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
        let uemail = FB_AUTH.currentUser.email;
        if(true || uemail.includes('ucab.edu.ve') || user.email === adminEmail){
            //CorreUCAB
            FB_DB.collection("users").doc(uemail).get()
            .then(doc =>{
                if(doc.exists){
                    console.log('Have Reg');
                    resolve(true);
                    //Hay registro
                }else{
                    console.log('havent Reg');
                    resolve(false);
                    //No hay
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
                reject(false);
            });
        }else{
            resolve(false);
        }
    });
}

//#endregion AUTH