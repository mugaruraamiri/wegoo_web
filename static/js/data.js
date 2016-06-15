$(function(){

	$("<div id='tooltip'></div>").css({
	    position: "absolute",
	    display: "none",
	    border: "1px solid #95a4b8",
	    padding: "4px",
	    "font-size": "12px",
	    color: "#fff",
	    "border-radius": "4px",
	    "background-color": "#95a4b8",
	    opacity: 0.90
    }).appendTo("body");

	$(".chart-placeholder").bind("plothover", function (event, pos, item) {
	    var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
	    $("#hoverdata").text(str);
	  
	    if (item) {
	      var x = item.datapoint[0],
	        y = item.datapoint[1];
	      
	        $("#tooltip").html(item.series.label+ " : " + y)
	        .css({top: item.pageY+5, left: item.pageX+5})
	        .fadeIn(200);
	    } else {
	      $("#tooltip").hide();
	    }
	});
	get_all_users();
});

function get_all_users(){

	$.ajax({
		type: 'POST',
		url: '/userinfo',
	}).done(function(data){
		var items ="";
		var count = 0;
		var iteminfo ="";
		var temp = '<ul class="dropdown-menu new-users-list dropdown-animated pop-effect dropdown-lg list-group-dropdown">'
		$.each(data, function(key, val){
			if (val.active == 0){
				count++;
			}
			items += '<li><a href="#">'+
			           '<div class="user-list-wrap">' +
			           '<div class="profile-pic"><img src="../static/img/profile2.jpg" alt=""></div>' +
			           '<div class="detail"><span class="text-normal">'+val.name+'</span>' +
			           '<span class="time">2 mins ago</span>' +
			           '<p class="font-11 no-m-b text-overflow">Doctor at CHUK</p>' +
			           '</div></div></a></li>';
		    });
		//update user count badge
		$(".user-count").html(count);
		temp += '<li class="no-link font-12">You have '+count+' new registered users</li>';
		temp += items;
		temp += '<li><a href="#" class="text-center">See all</a></li>';

		temp +='</ul>';

		$(temp).insertAfter("#new-user");


	});
}

function _getsensored(){

	var output = "";
	var count = 0;
	var defoult_time = "";
	$.ajax({
		type: 'POST',
		url : '/data',
	}).done(function(data){
		console.log(data);
		$.each(data, function(key, val){
			count = count +1;
			if (data.hasOwnProperty("last_updated")) {
				defoult_time = val.last_updated;
			}else {
				defoult_time = "10, Feb 2016 14:45";
			}
			output += '<li class="p-lr-10 ptnt'+ count +'" data-idwraper="'+val._id.$oid+'">' +
                      '<a href="#" data-id="'+val._id.$oid+'" class="pt-records">' +
                      '<div class="user-wrapper">' +
                      '<div class="profile-pic">' +
                      '<img src="../static/img/profile7.jpg" alt="" class="img-circle">'+
                      '</div><div class="p-t-5">'+
                      '<div class="font-12 text-dark">'+val.name+'</div>'+
                      '<div class="font-10 text-ellipsis">'+val.IDnumber+'</div>'+
                      '</div></div>'+
                      '<div class="activity-time font-11 text-muted">'+ defoult_time +'</div>'+
                      '</a></li>';
		});
		$(".list-active-patients").html(output);

		//get data of the fistchild in the list
        var fisrtItemId =$(".ptnt1").attr("data-idwraper");
        console.log("First Item id :"+fisrtItemId)
        getItemDetails(fisrtItemId);
	});
}
// Click handler for patient item in the list
$(document).on('click', "a.pt-records", function(ev){
	var itemId = $(this).attr("data-id");
	getItemDetails(itemId);
});

function generateOxyChart(averOxy){
	var template = "";
	if (averOxy <= 50 && averOxy === 100) {
		template += '<div class="oxychart-ex" id="oxychart" ' +
	                 'data-dimension="240" data-text="'+averOxy+'%"' +
	                 'data-info="Oxygen levels" data-width="30" ' +
	                 'data-fontsize="38" data-percent="'+averOxy+'" ' +
	                 'data-fgcolor="#D32F2F" data-bgcolor="#eee"' +
	                 'data-fill="#ddd" style="margin:0 auto;"></div>';
 	}else {

 		template += '<div class="oxychart-ex" id="oxychart" ' +
	                 'data-dimension="240" data-text="'+averOxy+'%"' +
	                 'data-info="Oxygen levels" data-width="30" ' +
	                 'data-fontsize="38" data-percent="'+averOxy+'" ' +
	                 'data-fgcolor="#61a9dc" data-bgcolor="#eee"' +
	                 'data-fill="#ddd" style="margin:0 auto;"></div>';
 	}

 	$("#OxyIndex").html(template);
 	$("span#moreInfo").html('<a class="btn btn-primary pull-right" href="#">Learn more</a>');


 	$('#oxychart').circliful();
		
}

function generateTempChart(dataTemp, ticksTemp, avTemp){

	var mainColor = '#5090F7';
    var secondaryColor = '#34495e';
    var chartDataArray = [];
    var ticksArray = [];

 //    for (var i = 0; i <=60; i++) {
	//     chartDataArray[i] = dataTemp[i];
	//     ticksArray[i] = i;
	// }
	//Area Chart
	var areaData = [{ 
	    data: dataTemp,
	    label: "Temperature"
	}],
	areaOptions = { 
	    xaxis: {
	      ticks: ticksTemp
	    },
	    series: {
	      lines: { 
	        show: true, 
	        fill: true
	      },
	      shadowSize: 0
	    },
	    grid: {
	      hoverable: true,
	      clickable: true,
	      color: '#bbb',
	      borderWidth: 1,
	      borderColor: '#eee'
	    },
	    colors: [mainColor]
	},
	areaPlot;

	$("#TempIndex").html(avTemp);

    areaPlot = $.plot($('.area-placeholder'), areaData, areaOptions);

}

function generateECGchart(dataecg,ticksecg, avPulse){
	var mainColor = '#5090F7';
    var secondaryColor = '#34495e';

	var data= [
      { data: dataecg,
        label: "ECG"
      }],
      options = { 
        xaxis: {
          ticks: ticksecg
        },
      series: {
	      lines: {
	        show: true, 
	      },
	      points: {
	        show: true,
	        radius: '3.5'
	      },
	      shadowSize: 0
	    },
	    grid: {
	      hoverable: true,
	      clickable: true,
	      color: '#bbb',
	      borderWidth: 1,
	      borderColor: '#eee'
	    },
	    colors: [mainColor,secondaryColor]
	  },
	  plot;

	  $("#pulseIndex ").html(avPulse + "bmp");
	  plot = $.plot($('.line-placeholder'), data, options);
}

function getMean(myArray) {
	var mean = myArray.reduce(function(a,b){
		return a + b;
	})/myArray.length;
	return Math.round(mean.toFixed(2));
}

function processData(rdata){
	var i;
	var data = [];
	var dataT = [];
	var oxygenMean = [];
	var averageTemp = [];
	var averagePulse = [];
	var position = [];
	var ticks = [];
	var count = 0;
	
	$.each(rdata, function(key, val){
		if(val.cTime !== null
			&& val.ecgvalue !== null
			&& val.oxygen !== null
			&& val.pulse !== null
			&& val.temperature !== null){
			//ECG array data
			data.push([count++,parseInt(val.ecgvalue)]);
			//Temp array data
			dataT.push([count++,parseInt(val.temperature)]);
			oxygenMean.push(parseInt(val.oxygen));
			averageTemp.push(parseInt(val.temperature));
			averagePulse.push(parseInt(val.pulse));

			ticks.push(count++);
		}
	});

	generateECGchart(data, ticks, getMean(averagePulse));
	generateTempChart(dataT, ticks, getMean(averageTemp));
	generateOxyChart(getMean(oxygenMean));

	// console.log(oxygenMean);
	// console.log("the mean temperature = "+getMean(averageTemp));
	// console.log("the mean Pulse = "+ getMean(averagePulse));
	// console.log("the mean oxygen = "+getMean(oxygenMean));
	// console.log(data);
	// console.log(dataT)
}//process data

function getMedian(myArray){
	var median;
	var sorted = myArray.sort(myArray);
	var midleIndex = Math.floor(sorted.length/2);

	if (sorted.length % 2 === 0) {
		var medianA = sorted[midleIndex];
		var medianB = sorted[midleIndex-1];

		median = (medianA + medianB)/2;
	}else {
		median = sorted[midleIndex];
	}

	return median.toFixed(2);
}

function getItemDetails(id){
	//fetch the item data by id
	var headerContent = "",
	    ptnmenu = "",
	    logdataButton = "",
	    bodyContent = "";
	$(".loading-wrap").css({"display":"block"});
	$.ajax({
		type: 'GET',
		url: '/data/api/v/'+id,
	}).done(function(data){
		$(".loading-wrap").css({"display":"none"});
		console.log(data);
		console.log(data[0].name);
		headerContent += '<div class="user-wrapper img-lg"><div class="profile-pic">' +
                         '<img src="../static/img/profile8.jpg" alt="" class="img-circle">' +
                         '</div><div class="p-t-10">' +
                         '<div class="font-12 text-dark" style="color:#fff">'+data[0].name+'</div>' +
                         '<div class="font-10 text-muted">'+data[0].IDnumber+'</div>' +
                         '</div></div>';

        bodyContent += '<tr><th>ID No :</th><td>'+data[0].IDnumber+'</td></tr>' +
                       '<tr><th>Age :</th><td>13</td></tr>' +
                       '<tr><th>Gender :</th><td>Male</td></tr>' +
                       '<tr><th>Location</th><td><a class="location" data-id="'+data[0]._id.$oid+'" href="" style="color:#fff">Location</a></td></tr>';
        ptnmenu += '<ul class="ptn-menu pull-right"><li>' +
                   '<a href="feedbck/'+data[0]._id.$oid+'/'+data[0].Device_uuid+'" class="btn btn-primary btn-rounded"> Feedbacks </a>' +
                   '</li></ul>';
        logdataButton +='<a href="logdata/'+data[0]._id.$oid+'" class="btn btn-dark" style="width:100%">view all data</a>';
        //update the info panel -- header
        $("#ptntHeaderInfo").html(headerContent);
        //insert menu buttons
        $(".ptn-menu-container").html(ptnmenu);
        //update the info panel -- body
        $("#ptntBodyInfo").html(bodyContent);
        //insert button for logdata
        $(".ptntBodyInfo-table").html(logdataButton);
        //proccess data for visualization
		processData(data[0].vitalsigns);
	});
}

function getFeedback(usrid){
	var output = "";
	$.ajax({
		type:"GET",
		url: "/getfeedback/"+usrid,
	}).done(function(data){
		console.log(data);
		$.each(data, function(key, val){
			output += '<div class="timeline-row clearfix">' +
		          '<div class="timeline-event" style="width:98%">' +
                  '<div class="event-box"><div class="event-header has-profile-pic">' +
                  '<div class="profile-pic">' +
                  '<img src="../../static/img/profile4.jpg" alt="" class="img-rounded">' +
                  '</div><div class="p-t-5"><span class="font-semi-bold">'+val.name+'</span> at CHUK</div>' +
                  '<div class="font-12 text-muted">'+val.time+'</div></div>' +
                  '<hr class="line-dashed m-t-10 m-b-5"><div class="row m-t-20" style="padding-left:20px;">' +
                  '<p class="font-12">'+val.feedback+'</p>'+
                  '</div><div class="row" style="padding-left:10px;"><div class="feedback-icon" style="border:none;">' +
                  '<a href=""><i class="icon-pencil"></i></a></div>' +
                  '<span style="margin-left:10px;"> Status:<span class="label label-success" style="margin-left:5px;">Sent</span></span>' +
                  '</div></div><div class="timeline-icon"><div class="event-icon" style="border:none;">' +
                  '<a class="feedbck-ptnt" data-feedid="'+val._id.$oid+'" href="#" style="text-decoration:none"><span style="background-color:#F44336"><i class="icon-bin"></i></span>' +
                  '</a></div></div></div></div>';
		});
		//hide the modal firtst
		$('.modal-ex2').modal('hide');
		$("#fedbck-List").html(output);
		
	});
}

function _getLogData(id){
	var output="";
	var count = 0;

	$(".loading-wrap").css({"display":"block"});
	$.ajax({
		type:'GET',
		url: '/data/api/v/'+id,
	}).done(function(data){
		console.log(data);
		$(".loading-wrap").css({"display":"none"});
		$.each(data[0].vitalsigns, function(key, val){
			output += '<tr><td>'+ count +'</td>' +
                           '<td>'+val.temperature+' &deg;C</td>' +
                           '<td>'+val.pulse+' bpm</td>' +
                           '<td>'+val.oxygen+' %</td>' +
                           '<td>'+val.ecgvalue+'</td>' +
                           '<td>'+val.cTime+'</td>' +
                           '<td>Nyarugenge</td></tr>';
            count++;
		});
		$("#log-List").html(output);
	});
}












