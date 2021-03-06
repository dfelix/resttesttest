function showParamHeaders() {
	if ($("#allparameters").find(".realinputvalue").length > 0) {
		$("#allparameters").show();
	} else {
		$("#allparameters").hide();
	}
}

//this specifies the parameter names
$(".fakeinputname").blur(function() {
  var newparamname = $(this).val();
  $(this).parent().parent().parent().parent().find(".realinputvalue").attr("name", newparamname);
});
 

 /*
$(".close").click(function(e) {
  e.preventDefault();
  $(this).parent().parent().remove();
	showParamHeaders();
});
*/

$("#addprambutton").click(function(e) {
  e.preventDefault();
	$('.httpparameter:first').clone(true).appendTo("#allparameters");
	showParamHeaders();
});

$("#addfilebutton").click(function(e) {
  e.preventDefault();
	$('.httpfile:first').clone(true).appendTo("#allparameters");
	showParamHeaders();
});

function postWithAjax(myajax) {
  myajax = myajax || {};
  myajax.url = $("#urlvalue").val();
  myajax.type = $("#httpmethod").val();
  myajax.complete = function(jqXHR) {
		$("#statuspre").text(
				"HTTP " + jqXHR.status + " " + jqXHR.statusText);
		if (jqXHR.status == 0) {
			httpZeroError();
		} else if (jqXHR.status >= 200 && jqXHR.status < 300) {
			$("#statuspre").addClass("alert-success");
		} else if (jqXHR.status >= 400) {
			$("#statuspre").addClass("alert-error");
		} else {
			$("#statuspre").addClass("alert-warning");
		}
		
		var text = syntaxHighlight(jqXHR.responseText);
		
		$("#outputpre").html(text);
		$("#headerpre").text(jqXHR.getAllResponseHeaders());
	}

	if (jQuery.isEmptyObject(myajax.data)) {
		myajax.contentType = 'application/x-www-form-urlencoded';
	}

	$("#outputframe").hide();
	$("#outputpre").empty();
	$("#headerpre").empty();
	$("#outputframe").attr("src", "")
	$("#ajaxoutput").show();
	$("#statuspre").text("0");
	$("#statuspre").removeClass("alert-success");
	$("#statuspre").removeClass("alert-error");
	$("#statuspre").removeClass("alert-warning");

  $('#ajaxspinner').show();
	var req = $.ajax(myajax).always(function(){
    $('#ajaxspinner').hide();
	});
}

$("#submitajax").click(function(e) {
  e.preventDefault();
  if(checkForFiles()){
    postWithAjax({
      data : createMultipart(), 
      cache: false,
      contentType: false,
      processData: false  
    });
  } else {
    postWithAjax({
      data : createUrlData()
    });    
  }
});

function checkForFiles() {
	return $("#paramform").find(".input-file").length > 0;
}

function createUrlData(){
  var mydata = {};
	var parameters = $("#allparameters").find(".realinputvalue");
	for (i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
		value = $(parameters).eq(i).val();
		mydata[name] = value
	}
  return(mydata);
}

function createMultipart(){
  //create multipart object
  var data = new FormData();
  
  //add parameters
  var parameters = $("#allparameters").find(".realinputvalue");
	for (i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
    if(parameters[i].files){
  	  data.append(name, parameters[i].files[0]);      
    } else {
		  data.append(name, $(parameters).eq(i).val());
    }
	}
  return(data)  
}

function httpZeroError() {
	$("#errordiv").append('<div class="alert alert-danger fade in" role="alert"> <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">�</span><span class="sr-only">Close</span></button> <strong>Oh no!</strong> Javascript returned an HTTP 0 error. One common reason this might happen is that you requested a cross-domain resource from a server that did not include the appropriate CORS headers in the response. Better open up your debugger...</div>');
}


function syntaxHighlight(text) {
	
	try{
        var json = jQuery.parseJSON(text);
       	json = JSON.stringify(json, undefined, 4);
			  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			      var cls = 'number';
			      if (/^"/.test(match)) {
			          if (/:$/.test(match)) {
			              cls = 'key';
			          } else {
			              cls = 'string';
			          }
			      } else if (/true|false/.test(match)) {
			          cls = 'boolean';
			      } else if (/null/.test(match)) {
			          cls = 'null';
			      }
			      return '<span class="' + cls + '">' + match + '</span>';
		  });
    }catch(e){
        return text;
    }
}