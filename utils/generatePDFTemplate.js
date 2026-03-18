export const generatePDFTemplate = (complaint, letterheadBase64) => {

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

@page{
size:A4;
margin:0;
}

body{
font-family:'Times New Roman',serif;
font-size:11pt;
line-height:1.5;
color:#000;
background:white;
}

.page{
width:210mm;
min-height:297mm;
padding:20mm 20mm 25mm 20mm;
position:relative;
background:white;
page-break-after:auto;
}

.letterhead{
position:absolute;
top:0;
left:0;
width:100%;
height:auto;
z-index:0;
}

.content{
position:relative;
z-index:1;
padding-top:100px;
width:170mm;
margin:auto;
}

.title{
text-align:center;
font-weight:bold;
font-size:14pt;
margin-bottom:30px;
letter-spacing:2px;
}

.paragraph{
text-align:left;
margin-bottom:15px;
word-break:break-word;
overflow-wrap:break-word;
white-space:normal;
}

.paragraph.indent{
text-indent:30px;
white-space:pre-wrap;
}

.section-title{
font-weight:bold;
margin-top:20px;
margin-bottom:10px;
}

.signature-section{
margin-top:60px;
text-align:center;
}

.signature-line{
border-top:1px solid #000;
width:200px;
margin:40px auto 5px auto;
}

.linea{
display:inline-block;
min-width:180px;
max-width:170mm;
border-bottom:1px dotted #000;
text-align:center;
padding:0 4px;
vertical-align:bottom;
word-break:break-word;
}

.linea-corta{
min-width:100px;
}

.linea-larga{
min-width:300px;
max-width:170mm;
word-break:break-word;
}

</style>
</head>

<body>

<div class="page">

<img src="data:image/png;base64,${letterheadBase64}" class="letterhead"/>

<div class="content">

<div class="title">DENUNCIA</div>

<p class="paragraph">
En la ciudad de ${complaint.ciudad || "Formosa"}, siendo las 
<span class="linea linea-corta">${complaint.hora || ""}</span> 
horas del día 
<span class="linea linea-corta">${complaint.dia || ""}</span> 
de 
<span class="linea linea-corta">${complaint.mes || ""}</span> 
del año ${complaint.anio || "2025"}, 
se hace presente ante esta SUBSECRETARIA DE DEFENSA AL CONSUMIDOR Y USUARIO,
el Sr./Sra 
<span class="linea">${complaint.nombreCompleto || ""}</span> 
DNI 
<span class="linea">${complaint.dni || ""}</span> 
con domicilio real en 
<span class="linea linea-larga">${complaint.domicilio || ""}</span>.
</p>

<p class="paragraph">
Teléfono Celular 
<span class="linea">${complaint.telefono || ""}</span> 
y/o correo electrónico 
<span class="linea linea-larga">${complaint.email || ""}</span>.
</p>

<p class="paragraph">
Preguntado sobre el motivo de su presencia ante esta Autoridad de Aplicación de la Ley 24.240 de Defensa del Consumidor y Usuario, manifiesta que es a los fines de formular una denuncia contra 
<span class="linea linea-larga">${complaint.motivoDenuncia || ""}</span>.
</p>

<p class="paragraph">
con domicilio comercial en 
<span class="linea linea-larga">${complaint.domicilioComercial || ""}</span>.
</p>

<p class="paragraph section-title">
Seguidamente manifiesta lo siguiente:
</p>

<p class="paragraph indent">
${complaint.relacionConsumo || ""}
</p>

<p class="paragraph">
Que a fin de acreditar la relación de consumo y/o prestación del servicio, adjunta la siguiente documentales:
</p>

<p class="paragraph">
${complaint.documentalesAdjuntas || ""}
</p>

<p class="paragraph">
No siendo para más, se firman tres (3) ejemplares de un mismo tenor y efectos.
</p>

<div class="signature-section">

<div class="signature-line"></div>

<p>Firma del Denunciante</p>

</div>

</div>
</div>

</body>
</html>
`
}