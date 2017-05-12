onmessage = function(e)
{
    if (e.data[0] === 'draw')
        postMessage(drawArt(e.data[1], e.data[2]));
};


function drawArt(items, imgData)
{
    var data = imgData.data;
    
    var x = 0;
    var y = 0;
    
    var ix = 0;
    var iy = 0;
    var d = 0, minDif = 0;
    var lc1 = [], lc2 = [];
    var results = [];
    
    for (var i = 0, l = data.length; i < l; i += 4)
    {
        if (data[i+3] > 0)
        {
            if (lc2[i] === undefined)
                lc2[i] = rgb2lab([data[i], data[i+1], data[i+2]]);
                
            minDif = 900;
        
            for (var i2 = 0, l2 = items.length; i2 < l2; i2++)
            {
                if (lc1[i2] === undefined)
                    lc1[i2] = rgb2lab(items[i2].color);

                d = labColorDif(lc1[i2], lc2[i]);
            
                if (d < minDif)
                {
                minDif = d;
                    ix = items[i2].x;
                    iy = items[i2].y;
                }
            }
            results.push([ix, iy, x, y]);
        }
        
        x++;
        if (x >= imgData.width)
        {
            x = 0;
            y++;
        }
    }
    return results;
}
    
    
function labColorDif(c1, c2)
{
    var d = 0;
        
    for (var i = 0; i < 3; i++)
    {
        d += Math.pow(c1[i] - c2[i], 2);
    }
    return Math.sqrt(d);
}
    
    
function rgb2lab(c)
{
    
    //RGB to XYZ
    var vC = [], XYZ = [];
    
    for (var i = 0; i < 3; i++)
    {
        vC[i] = ( c[i] / 255.0 );

        if (vC[i] > 0.04045)
            vC[i] = Math.pow(((vC[i] + 0.055) / 1.055), 2.4);
        else 
            vC[i] = vC[i] / 12.92;

        vC[i] = vC[i] * 100;
    }
    
    XYZ[0] = vC[0] * 0.4124 + vC[1] * 0.3576 + vC[2] * 0.1805;
    XYZ[1] = vC[0] * 0.2126 + vC[1] * 0.7152 + vC[2] * 0.0722;
    XYZ[2] = vC[0] * 0.0193 + vC[1] * 0.1192 + vC[2] * 0.9505;
    
    //XYZ to CIA-L*ab
    var L, a, b;
        
    XYZ[0] = XYZ[0] / 95.047;
    XYZ[1] = XYZ[1] / 100.0;
    XYZ[2] = XYZ[2] / 108.883;

    for (var i = 0; i < 3; i++)
    {
        if (XYZ[i] > 0.008856)
            XYZ[i] = Math.pow(XYZ[i], (1.0/3));
        else
            XYZ[i] = (7.787 * XYZ[i]) + (16.0 / 116);
    }

    L = (116 * XYZ[1]) - 16;
    a = 500 * (XYZ[0] - XYZ[1]);
    b = 200 * (XYZ[1] - XYZ[2]);
    
    return [L, a, b];
}
