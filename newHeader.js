let dataForHeader = {};

async function getDataFromHomepage() {
    let parser = new DOMParser();
    let protocol = 'https://';
    if (/http:/.test(location.href)) {
        protocol = 'http://'
    }
    protocol = 'https://';
    console.log(protocol);
    let url = protocol + 'www.avon.com.ua' + location.pathname.substring(0,location.pathname.lastIndexOf("/")) + '/home.page';
    console.log(url);
    let response = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin'
    });
    let text = await response.text();
    console.log(text);
    console.log(parser.parseFromString(text, "text/html"));

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'phones.json', true);
    xhr.send();
    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            text = xhr.responseText;
            alert(text);
        }
    };
    console.log(parser.parseFromString(text, "text/html"));

    dataForHeader.campNumber = Number(parser.parseFromString(text, "text/html").querySelector('.campaign_All').innerText.replace('C', ''));
    dataForHeader.deadLine = parser.parseFromString(text, "text/html").querySelector('.dueby_text').children[0];
    dataForHeader.deadLineText = dataForHeader.deadLine.firstChild.textContent;
    dataForHeader.deadLineDate = dataForHeader.deadLine.childNodes[2].textContent.replace('\n', '').replace('   ' + '               ', ', ').trim() + ', ';
    dataForHeader.deadLineLeft = dataForHeader.deadLine.childNodes[3].innerText.trim();
    console.log(dataForHeader.deadLine);
    getFromArrBalance(parser.parseFromString(text, "text/html"));
    sessionStorage.setItem('dataForHeader', JSON.stringify(dataForHeader));

}

function getFromArrBalance(source) {
    Array.from(source.querySelectorAll("form")).forEach(item => {
        if (item.name === 'dashboardInformationForm') {
            let data = Array.from(item.querySelectorAll('tr')).map(tableRow => {
                if (tableRow.children[0] !== undefined && tableRow.children[0].innerText !== undefined) {
                    if (tableRow.children[0].innerText.trim() === 'Пеня:') {
                        console.log(tableRow.children[1].innerText);
                        return {debt: tableRow.children[1].innerText}
                    } else if (tableRow.children[0].innerText.trim() === 'Баланс:') {
                        return {balance: tableRow.children[1].innerText}
                    } else if (tableRow.children[0].innerText.trim() === 'Ліміт кредиту за цінами каталогу:') {
                        return {limit: tableRow.children[1].innerText}
                    }
                }
            }).filter(Boolean);
            dataForHeader.balance = data[1].balance;
            dataForHeader.limit = data[2].limit;
            document.getElementById('balance').innerText = dataForHeader.balance;
            document.getElementById('creditLimit').innerText = dataForHeader.limit;
        }
    });
}

function fillNewHeader() {
    console.log(dataForHeader);
    try {
        if (dataForHeader.campNumber.toString().length === 1) {
            Array.from(document.getElementsByClassName('textCampNumber')).forEach(item => {
                item.innerText = 'C0' + dataForHeader.campNumber;
            });
        } else {
            Array.from(document.getElementsByClassName('textCampNumber')).forEach(item => {
                item.innerText = 'C' + dataForHeader.campNumber;
            });
        }
        Array.from(document.getElementsByClassName('pasteFirstName')).forEach(item => {
            item.innerText = firstname;
        });
        document.getElementById('deadlineText').innerText = dataForHeader.deadLineText;
        document.getElementById('deadlineDate').innerText = dataForHeader.deadLineDate;
        Array.from(document.getElementsByClassName('deadlineLeft')).forEach(item => {
            item.innerText = dataForHeader.deadLineLeft;
        });
        document.getElementById('learningHubLink').href = document.getElementById('menu5').href;
        document.getElementById('serviceLink').href = document.getElementById('menu6').href;
    } catch (e) {
        console.log(e);
    }
}

window.addEventListener('load', () => {
    if (sessionStorage.getItem('dataForHeader') !== null) {
        console.log('Get from SS');
        dataForHeader = JSON.parse(sessionStorage.getItem('dataForHeader'));
        fillNewHeader();
        document.getElementById('balance').innerText = dataForHeader.balance;
        document.getElementById('creditLimit').innerText = dataForHeader.limit;
    } else if (page('home.page')){
        console.log('we on homepage');
        dataForHeader.campNumber = Number(document.querySelector('.campaign_All').innerText.replace('C', ''));
        dataForHeader.deadLine = document.querySelector('.dueby_text').children[0];
        // todo make something with these warning
        dataForHeader.deadLineText = dataForHeader.deadLine.firstChild.textContent;
        dataForHeader.deadLineDate = dataForHeader.deadLine.childNodes[2].textContent.replace('\n', '').replace('   ' + '               ', ', ').trim() + ', ';
        dataForHeader.deadLineLeft = dataForHeader.deadLine.childNodes[3].innerText.trim();
        // get info about balance
        getFromArrBalance(document);
        sessionStorage.setItem('dataForHeader', JSON.stringify(dataForHeader));
        fillNewHeader();
    } else {
        console.log('try fetch from homepage');
        getDataFromHomepage().then(()=> {
            console.log('parse begin after get data');
            fillNewHeader();
            console.log('after fi header');
            if (isTest()) {
                console.log('we parsed homepage');
            }
        });
    }
    let div = document.createElement('div');
    div.style.height = '110px';
    div.id = 'placeHolderForNewHeader';
    document.body.insertBefore(div, document.body.firstChild);



// hide default header
    /*
    document.querySelector('body > table > tbody > tr > td > table > tbody > tr:nth-child(1)').style.display = 'none';
    document.querySelector('body > table > tbody > tr > td > table > tbody > tr.topbackgroundcolor').style.display = 'none';
    */

    // svistoperdelki menu
    let inner = '.menuHeader';
    document.querySelectorAll('.headerMenu-toggle').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Add the correct active class
            if ($(this).closest(inner).hasClass('active')) {
                // Remove active classes
                $(inner).removeClass('active');
            } else {
                // Remove active classes
                $(inner).removeClass('active');
                // Add the active class
                $(this).closest(inner).addClass('active');
            }
            // Show the content
            let $content = $(this).next();
            $(this).next().slideToggle(); // old version is $content.slideToggle();
            $('.menuHeader-content').not($content).slideUp();
        });
    });

    $(".header_new_menu").click(function() {
        $('.header-global-menu_bg').addClass('visible');
        $('.header-global-menu').addClass('visible');
        $('body').css('overflow', 'hidden');
    });
    $(".close_header_menu").click(function() {
        $('.header-global-menu_bg').removeClass('visible');
        $('.header-global-menu').removeClass('visible');
        $('body').removeAttr("style");
    });
});