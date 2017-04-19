function changeAmountBox() {

	if(document.getElementById("billCheck").checked) {
		document.getElementById("amtMin").disabled = false;
		document.getElementById("amtMax").disabled = false;
		document.getElementById("amtMin").value = "";
		document.getElementById("amtMax").value = "";
	}
	else {
			document.getElementById("amtMin").disabled = true;
			document.getElementById("amtMax").disabled = true;
			document.getElementById("amtMin").value = "N/A";
			document.getElementById("amtMax").value = "N/A";
	}
	if (!(document.getElementById("billCheck").checked || document.getElementById('resCheck').checked)) {
		document.getElementById("advBtn").disabled = true; 
	} else { 
			document.getElementById("advBtn").disabled = false;
	}
}