const adminEmail = 'migueldeolim1@gmail.com'; // ;)

function msgSnack(mesg) {
    // Get the snackbar DIV
    let x = document.getElementById("snackbar");
    if (x) {
        x.innerHTML = mesg;
        // Add the "show" class to DIV
        x.className = "show";

        // After 3 seconds, remove the show class from DIV
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    }
}
//#region AUTH
function logIn() {
    
    FB_AUTH.signInWithPopup(provider).then(function (result) {
        let user = result.user;
        console.time("logIn");
        if (user.email.includes('ucab.edu.ve') || user.email === adminEmail) {
            //yes
            console.log("LogIn UCAB", user);
            msgSnack('<div class="spinner-border text-light spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div> Cargando...');
            isRegister().then(resp =>{
                console.timeEnd("logIn");
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
        deleteDataUser();
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
                console.time("isRegister");
                isRegister().then((status)=>{
                    console.timeEnd("isRegister");  
                    if(status == 400){
                        //No conexion y cred no guardada
                        if(window.location.pathname.includes('/')){
                            //Estamos en menu
                           
                            setDataUser(user.email);

                            setVisibility(true);
                            setLoader(false);

                            resolve(true);
                        }else{
                            //Mandamos a menu
                            window.location.replace('/');
                        } 
                    }else if(status){
                        //Registrado en DB ucab => TODO OK

                        if(window.location.pathname.includes('/admin') && user.email != adminEmail){
                            //No-admin intentando => menu
                            window.location.replace('/');
                        }
                        console.log("All ok");
                        setVisibility(true);
                        setLoader(false);

                        user.email == adminEmail ? resolve('adminMode') : resolve(true);

                    }else if(!user.email.includes('ucab.edu.ve') && user.email != adminEmail){
                        //NoDB por noUCAB
                        //Rebotar/Pedir login
                        console.log("NoDB NoUCab", false, user);
                        logOut();
                        //window.location.replace('/inicio/');
                    }else{
                        //NoDB por 1er vez
                        if(window.location.pathname.includes('/')){
                            //Estamos en menu
                            console.log("NoDB 1er ", cod);
                            setDataUser(user.email);

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
        console.log("CUrrente Email", uemail);
        if(uemail.includes('ucab.edu.ve') || uemail === adminEmail){
            //CorreUCAB
            let lcdata = getData('@user_data');
            if(!lcdata || (lcdata.date + timeRegLimit <=  new Date().getTime()) ){
                //No hay reg en local o tiempo ya paso
                FB_DB.collection("users").doc(uemail).get()
                .then(doc =>{
                    if(doc.exists){
                        console.log('Have Reg');

                        setDataUser(uemail);
                        resolve(true);
                        //Hay registro
                    }else{
                        console.log('havent Reg');
                        deleteDataUser();
                        resolve(false);
                        //No hay
                    }
                }).catch(function(error) {
                    console.warn("Error getting document:", error);

                    if(error.message.indexOf("client is offline") != -1){
                        resolve(400); 
                    }
                    resolve(false);
                });
            }else{
                //Hay data => check email
                if(lcdata.user === uemail){
                    //CoreoUCab con registro local
                    resolve(true);
                }
            }
           
        }else{
            //No ucabCorreo
            deleteDataUser();
            resolve(false);
        }
    });
}

//#endregion AUTH


//#region Storage
function setData(id, obj){
    localStorage.setItem(id, JSON.stringify(obj));
}

function getData(id){
    console.log("Getting userData");
    return JSON.parse(localStorage.getItem(id));
}

function deleteDataUser(){
    console.log("Deleting userData");
    localStorage.removeItem('@user_data');
}

function setDataUser(uemail){
    console.log("Setting userData");
    setData('@user_data', 
        { user: uemail,
        date: new Date().getTime()
    });
}

//#endregion Storage