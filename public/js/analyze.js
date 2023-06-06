let content = document.querySelector("#content-text");
let entityContent = document.querySelector("#content-entities")
let data;

$("#analyze-button").click( async function() {
	const file = $("#file-selector").prop('files')[0];
	const reader = new FileReader();

	reader.addEventListener(
		"load",
		() => {
		  // Display a text file content
		  
		  content.innerText = reader.result;
		  //Send post request with text file content
		 let entityD =  fetch('http://localhost:3017/detectEntities/', {
    		method: 'POST',
    		headers: {
        		'Accept': 'text/html',
        		'Content-Type': ' application/x-www-form-urlencoded'
    		},
    		body: encodeURIComponent(reader.result)
		})  
	},
		false
	);
	
	if (file) {
		reader.readAsText(file);
	}	 
})