var data = []; //所有區的資料
var zones = [];//給下拉選單的資料
var select = document.getElementById('zoneId');//行政區的下拉選單
var elHeaderZone = document.querySelector('.header-zone');
var imgGoTop = document.querySelector('.img-gotop'); //go top img
var travelPages = document.querySelectorAll('.travel-page');//頁碼
var zoneObj = []; //選取的行政區資料
var currentPageIndex =0;//目前頁數
var zoneName='';//已選擇的行政區名

//init
getData();

//event
select.addEventListener('change',function(){
    zoneName = select.value;
    updateView(zoneName, 0);
    initPagination();
})

elHeaderZone.addEventListener('click', function (e) {
    if(e.target.nodeName !=='BUTTON')
    {
        return;
    }
    zoneName = e.target.dataset.zone;
    updateView(zoneName, 0);
    initPagination();
})
imgGoTop.addEventListener('click',function()
{
    window.document.body.scrollTop = 0;
    window.document.documentElement.scrollTop = 0;
})

//method
function initSelect() {
    for (var i = 0; i < zones.length; i++) {
        let opt = zones[i];
        let el = document.createElement("option");
        el.textContent = opt.text;
        el.value = opt.value;
        select.appendChild(el);
    }
}
function initPagination() {
    let pageCount = Math.ceil(parseInt(zoneObj.TotalCount) / 8);
    let elPagination = document.querySelector('.travel-pagination');
    let htmlStr = '';
    elPagination.innerHTML ='';
    if(pageCount >1) //頁碼超過1頁才顯示page
    {
        htmlStr += '<li class="page-item"><a class="page-link travel-page" href="#" data-page="-1">< Prev</a></li>';
        for (let i = 0; i < pageCount; i++) {
            htmlStr += '<li class="page-item"><a class="page-link travel-page" href="#" data-page="' + i + '">' + (i + 1) + '</a></li>';
        }
        htmlStr += '<li class="page-item"><a class="page-link travel-page" href="#" data-page="+1">Next ></a></li>';
        elPagination.innerHTML = htmlStr;
        var btnPages = document.querySelectorAll('.travel-page');
        for (let i = 0; i < btnPages.length; i++) {
            btnPages[i].addEventListener('click', updatePageData);
        }
        setPageBtnStatus(0, 0);
    }    
    
    
}
//拉高雄市政府api資料回來
function getData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97', true);
    xhr.send(null); //ture非同步，不會等資料傳回來，就讓程式往下跑，等到回傳才會自動回傳
    //readystate = 4時才會觸發onload
    xhr.onload = function () {
        if (xhr.status == 200) {
            let xhrData = JSON.parse(xhr.responseText);
            if (xhrData.success) {
                //將每一個區包成一個物件
                let records = xhrData.result.records;
                records = records.sort(function (a, b) {
                    return a.Zone > b.Zone ? 1 : -1;
                });
                let zone = records[0].Zone;
                let zoneDatas = {};
                let zoneAllData = {};
                zoneAllData.Zone = '全區';
                zoneAllData.Datas = [];
                zoneAllData.TotalCount = records.length;
                data.push(zoneAllData);
                

                zoneDatas.Zone = zone;
                zoneDatas.Datas = [];
                zoneDatas.TotalCount = 0;
                zones.push({
                    text: '--請選擇行政區--',
                    value: '全區'
                });
                for (let i = 0; i < records.length; i++) {
                    let record = generateRecord(records[i]);
                    if (zone !== records[i].Zone) {
                        zoneDatas.Zone = zone;
                        zoneDatas.TotalCount = zoneDatas.Datas.length;
                        //console.log(zoneDatas);
                        data.push(zoneDatas);
                        zoneDatas = {};
                        zoneDatas.Zone = records[i].Zone;
                        zoneDatas.Datas = [];
                        zoneDatas.TotalCount = 0;
                        zones.push({
                            text: zone,
                            value: zone
                        });
                    }
                    zoneDatas.Datas.push(record);
                    data[0].Datas.push(record);
                    zone = records[i].Zone;
                }
                zoneDatas.TotalCount = zoneDatas.Datas.length;
                //console.log(zoneDatas);
                data.push(zoneDatas);
                data.TotalCount = records.length;
                //console.log(data);
                zones.push({
                    text: zone,
                    value: zone
                });
                //console.log(zones);
                initSelect();
                zoneName = select.value;
                updateView(zoneName, 0);
                initPagination();
            }
            else {
                console.log('資料取回有誤');
            }
        }
        else {
            console.log('資料連線有誤');
        }
    }
}
//產生每個旅遊景點的資料(只取回頁面所需要的欄位)
function generateRecord(record) {
    var recordData = {};
    recordData.Ticketinfo = record.Ticketinfo;
    recordData.Zone = record.Zone;
    recordData.Px = record.Px;
    recordData.Py = record.Py;
    recordData.Add = record.Add;
    recordData.Opentime = record.Opentime;
    recordData.Description = record.Description;
    recordData.Name = record.Name;
    recordData.Picture1 = record.Picture1;
    recordData.Toldescribe = record.Toldescribe;
    recordData.Tel = record.Tel;
    recordData.Picdescribe1 = record.Picdescribe1;
    recordData._id = record._id;
    return recordData;
}
//更新UI
function updateView(zoneName, page) {
    let travelList = document.getElementById('travel-list');
    let elZoneName = document.getElementById('zone-name');
    let htmlStr = '';
    let showItemNum = 8;
    zoneObj=[];
    travelList.innerHTML = '';
    elZoneName.innerHTML = zoneName;
    for (let j = 0; j < data.length; j++) {
        if (zoneName === data[j].Zone) {
            zoneObj = data[j];
            break;
        }
    }
    if (zoneObj.length == 0)
    {
        return;
    }
    let zoneObjLength = zoneObj.TotalCount;
    let startIndex = page * showItemNum ;
    let endIndex = startIndex + showItemNum;
    let zoneArray = zoneObj.Datas;
    if (endIndex > zoneObjLength)
    {
        endIndex = zoneObjLength;
    }    
    for (let i = startIndex; i < endIndex; i++) {
        htmlStr +=`<div class="col-md-6 mb-7">
           <div class="card h-100">
             <img class="img-top" src="${zoneArray[i].Picture1}">
             <div class="card-body">
                 <div class="d-flex align-items-center mb-3">
                     <div style="width:18px" class="text-center mr-2"><img src="images/icons_clock.png"></div>
                     <span>${zoneArray[i].Opentime}</span>
                 </div>
                 <div class="d-flex align-items-center mb-3">
                     <div style="width:18px" class="text-center mr-2"><img src="images/icons_pin.png"></div>
                     <span>${zoneArray[i].Add}</span>
                 </div>
                 <div class="d-flex align-items-center">
                     <div style="width:18px" class="text-center mr-2"><img src="images/icons_phone.png"></div>
                     <span>${zoneArray[i].Tel}</span>
                     <img src="images/icons_tag.png" class="travel-tag">
                     <span class="ml-auto">${zoneArray[i].Ticketinfo}</span>
                 </div>
                 <div class="travel-title">${zoneArray[i].Name}</div>
                 <div class="travel-zone">${zoneArray[i].Zone}</div>
             </div>
           </div>
        </div>`;
    }
    travelList.innerHTML = htmlStr;    
}
//選取頁碼時，更新頁面資料
function updatePageData(e)
{
     e.preventDefault();
    let newPageIndex = e.target.dataset.page;   
    switch (newPageIndex) {       
        case '+1':            
            newPageIndex = currentPageIndex + 1;
            break;
        case '-1':
            newPageIndex = currentPageIndex - 1;            
            break; 
    }
    updateView(zoneName, parseInt(newPageIndex));
    setPageBtnStatus(currentPageIndex, newPageIndex);
    currentPageIndex = parseInt(newPageIndex);
}
function setPageBtnStatus(oldPageIndex,newPageIndex)
{
    newPageIndex = parseInt(newPageIndex);
    oldPageIndex= parseInt(oldPageIndex);
    travelPages = document.querySelectorAll('.travel-page');//頁碼
    let elOldLink = travelPages[(oldPageIndex + 1)];
    let elNewLink = travelPages[(newPageIndex + 1)];
    let preItem = travelPages[0].parentNode;
    let nextItem = travelPages[travelPages.length - 1].parentNode;
    //點選的頁碼是第1頁的話，就disabled pre 按扭，反之最後一頁，disabled next按鈕
    switch (newPageIndex) {
        case 0:
            setLinkStatus(preItem, 'disabled', true);
            setLinkStatus(nextItem, 'disabled', false);
            break;       
        case (travelPages.length - 3):
            setLinkStatus(nextItem, 'disabled', true);
            setLinkStatus(preItem, 'disabled', false);
            break;
        default:
            setLinkStatus(preItem, 'disabled', false);
            setLinkStatus(nextItem, 'disabled', false);
            break;
    }
    if (newPageIndex < (travelPages.length-2))
    {
        setLinkStatus(elOldLink, 'active', false);
        setLinkStatus(elNewLink, 'active', true);
    }        
    currentPageIndex = parseInt(newPageIndex);
}
    
function setLinkStatus(el,className,isAdd) {
    
    if (isAdd) {
        if (!el.classList.contains(className)) {
            el.classList.add(className);
        }       
    }
    else {
        if (el.classList.contains(className)) {
            el.classList.remove(className);
        }        
    }   
   
}