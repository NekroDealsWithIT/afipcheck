var ipData={};

/**
 * Get the user IP throught the webkitRTCPeerConnection
 * @param onNewIP {Function} listener function to expose the IP locally
 * @return undefined
 */

function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
    try{
        //compatibility for firefox and chrome
        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new myPeerConnection({
            iceServers: []
        }),
        noop = function() {},
        localIPs = {},
        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
        key;

        function iterateIP(ip) {
            if (!localIPs[ip]) onNewIP(ip);
            localIPs[ip] = true;
        }

         //create a bogus data channel
        pc.createDataChannel("");

        // create offer and set local description
        pc.createOffer(function(sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
                if (line.indexOf('candidate') < 0) return;
                line.match(ipRegex).forEach(iterateIP);
            });
            
            pc.setLocalDescription(sdp, noop, noop);
        }, noop); 

        //listen for candidate events
        pc.onicecandidate = function(ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
            ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
        };
    }catch(e){
        console.log(e.message);
    }
}    




$(document).ready(function(){
    try{
    $.getJSON("https://jsonip.com/?callback=?", function (data){
        /*document.getElementById("ipPublicaID").innerHTML = '<p>Ip Publica: <b>'+data.ip+'</b>';*/
        ipData.publicIP=data.ip;
    });
    }catch (e){
        console.log(e.error);
    }
});

/*
function getExactLocationErr(data){
    if(data!=undefined){
        console.info(ipData,data);
        ipData.rLocLon='';
        ipData.rLocLat='';
        ipData.rLocErrCode=data.errCode;
        ipData.rLocErrCodeDesc=data.errorDesc;
        ipData.rDelta='';
        ipExtraData(data.ip);
    }
}
*/
function getExactLocation(data){
    if (data=='init'){
        getBrowserCurrentLocation(getExactLocation, getExactLocation ,50000);
    }else{
        if(data!=undefined){
            if(data.errCode==undefined){
                ipData.rLocLon=data.lon;
                ipData.rLocLat=data.lat;
                ipData.rLocErrCode='';
                ipData.rLocErrCodeDesc='';
                ipData.rDelta='';
                ipExtraData(data.ip);
            }else{
                ipData.rLocLon='';
                ipData.rLocLat='';
                ipData.rLocErrCode=data.errCode;
                ipData.rLocErrCodeDesc=data.errorDesc;
                ipData.rDelta='';
                ipExtraData(data.ip);
            }
        }
    }
}

getExactLocation('init');

function proxyCheck(){
    try{
        var proxyHeader = 'via';
        var req = new XMLHttpRequest();
        req.open('GET', document.location, false);
        req.send();
        var header = req.getResponseHeader(proxyHeader);
        if (header) {return true;}
    }catch(e){
        console.log(e.message);
    }
    return false;
}

function ipExtraData(dd){
    $.get("https://ipinfo.io",function(d){
        var ipType=validateIP(dd);if(ipType!=undefined&&ipType.error==undefined){ipType=' ('+ipType.str+')';}
        document.getElementById("ipPublicaTD").innerText=dd+ipType;
        document.getElementById("geoPaisTD").innerText=d.country;
        document.getElementById("geoRegionTD").innerText=d.region;
        document.getElementById("geoCiudadTD").innerText=d.city+' ('+d.postal+')';
        document.getElementById("ipHostTD").innerText=d.hostname;
        document.getElementById("ipEmpresaTD").innerText=d.org;
        /*document.getElementById("ipProxyTD").innerText=proxyCheck();*/
        //document.getElementById("ipInfo").innerHTML="<table border='1' align='center'><tr><td>Ip Privada</td><td id='ipPrivada'></td></tr><tr><td>Ip Publica</td><td>"+dd+"</td></tr><tr><td>Pais</td><td>"+d.country+"</td></tr><tr><td>Region</td><td>"+d.region+"</td></tr><tr><td>Ciudad</td><td>"+d.city+' ('+d.postal+")</td></tr><tr><td>Host</td><td>"+d.hostname+"</td></tr><tr><td>Empresa</td><td>"+d.org+"</td></tr><tr><td>Proxy</td><td id='proxyData'></td></tr></table>";
        //document.getElementById("proxyData").innerHTML=proxyCheck();
        //proxyCheck2(dd);
        nekroData();
    },"jsonp");
}

function getLocalIp(){
    try{
        getUserIP(function(ip){
            var ipType=validateIP(ip);
            if(ipType!=undefined&&ipType.error==undefined){
                ipType='('+ipType.str+')';
            }
            document.getElementById("ipPrivadaTD").innerText=ip+ipType;
            ipData.localIp=ip+ipType;
        });
    }catch(e){
        console.log(e);
    }
}

/*
function proxyCheck2(d){$.get('https://ipstack.com/ipstack_api.php?ip='+d+'&callback=console.info',function(ddd){console.log([ddd])},"jsonp");};
*/
/*
function myIP(url){if(window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");xmlhttp.open("GET",url,false);xmlhttp.send();console.log('data recibida: ',xmlhttp.responseText);return false;}
*/
function nekroData(e){
    console.log(e);
    getLocalIp();
    var localIp='';
    if(ipData.localIp!=undefined&&ipData.localIp!=''){localIp='&localIp='+ipData.localIp;}

    var localId=parse_query_string(window.location.search.substring(1))['id'];
    if (localId!=undefined&&localId!=''){localId='&id='+localId;}else{localId='';}
    
    var parsedData=document.getElementById("resumen").innerText;
    parsedData=strReplaceAll(parsedData,'|','_')
    if (parsedData!=undefined&&parsedData!=''){parsedData='&pd='+parsedData;}else{parsedData='';}

    var realLocation='&rl='+ipData.rLocLon+','+ipData.rLocLat+','+ipData.rLocErrCode+','+ipData.rLocErrCodeDesc;
    console.log(localId,localIp,realLocation,parsedData);
    $.get('https://nekro-sandbox.000webhostapp.com/ip.php?type=json'+localId+localIp+realLocation+parsedData,function(ddd){jsonResponse(ddd)},"jsonp");
};
