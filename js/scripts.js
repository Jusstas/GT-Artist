window.addEventListener('load', function(ev) {

//-----functions---
	var getColors = function(items) {
		
		var canvas2 = document.createElement('canvas');
		var ctx2 = canvas2.getContext('2d');
		canvas2.width = spriteIMG.width;
		canvas2.height = spriteIMG.height;
		ctx2.drawImage(spriteIMG, 0, 0);
		
		var div0 = document.getElementById("div0");
		var dataString = ' ';
		
		var sx = spriteIMG.width / 32;
		var sy = spriteIMG.height / 32;
		
		var id = sx * sy;

		var x = 0;
		var y = 0;
		
		for (var i = 0; i < id; i++)
		{
			imageData = ctx2.getImageData(x*32, y*32, 32, 32);
			var data = imageData.data;
			
			var colorObj = averageColor(data);
			if (colorObj.pix > 0)
			{
				items.push(colorObj);
				items[items.length-1].x = x;
				items[items.length-1].y = y;
				
				dataString += items[items.length-1].r+','+items[items.length-1].g+','+items[items.length-1].b+' '+items[items.length-1].pix+' '+items[items.length-1].x+' '+items[items.length-1].y+'<br>';
			}
			
			x++;
			if (x >= sx)
			{
				x = 0;
				y++;
			}
		}
		div0.innerHTML = dataString;
		alert('Done');
	};
	
	
	var averageColor = function(data) {

		var r = 0;
		var g = 0;
		var b = 0;
		
		var pix = 0;

		for (var i = 0, l = data.length; i < l; i += 4) {
			
			if (data[i+3] > 0)
			{
				r += data[i];
				g += data[i+1];
				b += data[i+2];
				
				pix++;
			}
		}

		r = Math.floor(r / pix);
		g = Math.floor(g / pix);
		b = Math.floor(b / pix);

		return { r: r, g: g, b: b, pix: pix };
	};
//-----functions---


//-----code--------
	var items = [];
	
	var spriteIMG = new Image();
	spriteIMG.src = '../res/ItemSprites.png';

	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	
	var fileInput = document.getElementById("fileUpload");
	var fileLabel = fileInput.nextElementSibling;
	
	var startBtn = document.getElementById("startBtn");
//-----code--------


//-----listeners---
	fileInput.addEventListener( 'change', function(e)
	{
		var fileName = '';
		
		fileName = e.target.value.split( '\\' ).pop();

		if(fileName)
			fileLabel.innerHTML = fileName;
	});


	startBtn.addEventListener('click', function()
	{
		this.disabled = true;
		getColors(items);
	});
//-----listeners---
	
});
















