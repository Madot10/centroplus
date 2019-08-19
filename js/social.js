let toShare;

function shareWApi(data){

    if (navigator.share) {
        navigator.share(data)
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      }else{
          //no soportado
          $('#shareModal').modal('show');
          toShare = data;
      }
}

function generateLink(redS) {
    //OnClickGa('shareTo'+ redS, 'Social' , 'sharing: ' + JSON.stringify(toShare));
    switch (redS) {
        case 'tw':
            //TWitter
            linka = urlApp;
            if (toShare.url) {
                linka = toShare.url;
            }
            let contTo = toShare.title + '\n' + toShare.text + ' \n Lee más en: ' + linka;
            let newCont = encodeURIComponent(contTo);
            url = 'https://twitter.com/intent/tweet?text=' + newCont;
            //abrir en nueva ventana
            window.open(url, '_blank');
            break;

        case 'fb':
            //Facebook
            let ur = encodeURI(urlApp);
            linka = 'https://www.facebook.com/sharer/sharer.php?u=' + ur;
            window.open(linka, '_blank');
            break;

        case 'em':
            //EMAIL
            let asunto = 'Centro+ | ' + toShare.title;
            let cuerpo = toShare.text + ' \n ' + 'Fuente: ' + toShare.url + ' \n ' + 'Centro+ ' + urlApp;
            url = 'mailto:?&subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
            window.open(url, '_blank');
            break;

        case 'wp':
            //What
            let WHcont = '*'+ toShare.title + '*' + ' \n ' + toShare.text + ' \n ' + 'Link: ' + toShare.url + ' \n ' + '*Centro* ' + urlApp;
            encodeCont = encodeURI(WHcont);
            let a = document.createElement('a');
            a.style = { position: 'absolute', left: '-9999px' };
            a.href = "https://wa.me/?text=" + encodeCont;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            break;

        case 'cy':
            //COPY
            let cont = toShare.title + ' \n ' + toShare.text + ' \n ' + 'Link: ' + toShare.url + ' \n ' + 'Centro+ ' + urlApp;
            copyStringToClipboard(cont);
            msgSnack('¡Copiado!');
            break;

        default:
            break;
    }
    $('#shareModal').modal('hide');
}


function copyStringToClipboard(str) {
    // Create new element
    let el = document.createElement('input');
    el.setAttribute("type", "text");
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
}
