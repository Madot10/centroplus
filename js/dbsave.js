window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB ||
    window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction ||
    window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange ||
    window.webkitIDBKeyRange || window.msIDBKeyRange

if (!window.indexedDB) {
    //window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

let dbrequest = indexedDB.open('db_save', 1);
let DB_GEN = null;
let DB_SAVE = null;

dbrequest.onupgradeneeded = function (event) {
    // triggers if the client had no database
    console.info("DB onupgradeneeded");
    DB_GEN = event.target.result;
    DB_SAVE = DB_GEN.createObjectStore('data-save', { keyPath: "id", autoIncrement: false });
};

dbrequest.onerror = function () {
    console.error("Error DB_SAVE", openRequest.error);
};

dbrequest.onsuccess = function () {
    console.info("DB onsuccess");

    DB_GEN = dbrequest.result;
    DB_SAVE = DB_GEN.transaction(['data-save'], "readwrite");
    // continue to work with database using db object
};

function saveData(nameData, time, objData) {
    let saveTrans = DB_GEN.transaction(['data-save'], "readwrite")
        .objectStore('data-save')
        .add({
            id: nameData,
            time: time,
            data: objData
        });

    saveTrans.onsuccess = function (event) {
        console.info("Datos guardados correctamente");
    };
}

function getSaveData(nameData) {
    let saveTrans = DB_GEN.transaction(['data-save'], "readonly")
        .objectStore('data-save')
        .get(nameData);

    return new Promise((resolve, reject) => {
        saveTrans.onerror = function (event) {
            console.error("DB error");
            reject();
        };

        saveTrans.onsuccess = function (event) {
            let data = saveTrans.result;
            if (data) {
                console.info("Data Recueperada: ", data);
                resolve(data);
            } else {
                console.error("Datos no encontrados!");
                resolve(false);
            }


        }
    });
}

function updateSavedData(nameData, time, objData) {
    let objectStore  = DB_GEN.transaction(['data-save'], "readwrite").objectStore('data-save');
    let saveTrans = objectStore.get(nameData);

    saveTrans.onerror = function (event) {
        // Handle errors!
    };

    saveTrans.onsuccess = function (event) {
        // Get the old value that we want to update
        let data = saveTrans.result;

        // update the value(s) in the object that you want to change
        data = {
            id: nameData,
            time: time,
            data: objData
        }

        // Put this updated object back into the database.
        let requestUpdate = objectStore.put(data);
        requestUpdate.onerror = function (event) {
            // Do something with the error
        };
        requestUpdate.onsuccess = function (event) {
            // Success - the data is updated!
            console.log("Datos actualizados! ", event.result);
        };
    }
}

function manageCaseData(caso, nameData, time, objData){
    switch (caso) {
        case "update":
            updateSavedData(nameData, time, objData);
            break;
    
        case "save":
            saveData(nameData, time, objData);
            break;
    }
}