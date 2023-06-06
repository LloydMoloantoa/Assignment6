var clsName;
var percentage;
let counter = 0;
var outPutLbl = document.querySelector('.outPutLbl');
var explanationLbl = document.querySelector('.explanationLbl');
var causesLbl = document.querySelector('.causesLbl');
var treatmentLbl = document.querySelector('.treatmentLbl');
var selftreatmentLbl = document.querySelector('.selftreatmentLbl');
let imageLoaded = false;
$("#image-selector").change(function () {
	imageLoaded = false;
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
		imageLoaded = true;
	}

	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

let model;
let modelLoaded = false;
$(document).ready(async function () {
	modelLoaded = false;
	$('.progress-bar').show();
	console.log("Loading model...");
	model = await tf.loadGraphModel('model/model.json');
	console.log("Model loaded.");
	$('.progress-bar').hide();
	modelLoaded = true;
});

$("#predict-button").click(async function () {
	if (!modelLoaded) { alert("The model must be loaded first"); return; }
	if (!imageLoaded) { alert("Please select an image first"); return; }

	let image = $('#selected-image').get(0);

	// Pre-process the image
	console.log("Loading image...");
	let tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([224, 224]) // change the image size
		.expandDims()
		.toFloat()
		.reverse(-1); // RGB -> BGR
	let predictions = await model.predict(tensor).data();
	console.log(predictions);
	let top5 = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			return {
				probability: p,
				className: TARGET_CLASSES[i] // we are selecting the value from the obj
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 4);

	$("#prediction-list").empty();
	top5.forEach(function (p) {
		$("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(2)}</li>`);
	});

	const items = top5.map((num) => {
		return num.className
	})

	for (let i = 0; i < 1; i++) {
		percentage = top5[i].probability.toFixed(2);
		clsName = top5[i].className;
	}
	var view = document.querySelectorAll(".box")
	view[0].classList.remove('hidden');

	console.log(percentage);
	console.log(clsName);
	

	if (clsName === "Fake") {
		outPutLbl.innerHTML = "Fake";
		explanationLbl.innerHTML = "Based on the model trained with 10,000 counterfeit and 10,000 genuine images, it can be determined your picture has been edited (Fake).";
	} 
	else if (clsName === "Real") {
		outPutLbl.innerHTML = "Real";
		explanationLbl.innerHTML = "Based on the model trained with 10,000 counterfeit and 10,000 genuine images, it can be determined your picture is authentic (Real).";
	}
});

